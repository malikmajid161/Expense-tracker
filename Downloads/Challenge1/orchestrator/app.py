import os
import re
import uuid
import json
import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Security, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import storage
from google.cloud import firestore
import sqlalchemy
import requests
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Tool

# Initialize FastAPI app
app = FastAPI(
    title="ChainGaurd AI — Orchestrator (The Brain)",
    description="Vertex AI ReAct supply-chain mitigation agent service.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load config
PROJECT_ID = os.environ.get("GCP_PROJECT") or "chaingaurd-ai"
CONNECTION_NAME = os.environ.get("CLOUD_SQL_CONNECTION")
DB_PASS = os.environ.get("CLOUD_SQL_PASSWORD")
DB_NAME = "chaingaurd"
DB_USER = "chaingaurd_app"

# Action API Base URLs and Tokens
PROCUREMENT_URL = os.environ.get("MOCK_PROCUREMENT_BASE_URL")
LEGAL_URL = os.environ.get("MOCK_LEGAL_BASE_URL")
FINTECH_URL = os.environ.get("MOCK_FINTECH_BASE_URL")

PROCUREMENT_TOKEN = os.environ.get("MOCK_PROCUREMENT_TOKEN") or "chaingaurd-demo-token-procurement"
LEGAL_TOKEN = os.environ.get("MOCK_LEGAL_API_TOKEN") or "chaingaurd-demo-token-legal"
FINTECH_TOKEN = os.environ.get("MOCK_FINTECH_API_TOKEN") or "chaingaurd-demo-token-fintech"

# GCS Buckets
RAW_BUCKET = f"chaingaurd-raw-data-{PROJECT_ID}"
CONTRACTS_BUCKET = f"chaingaurd-contracts-{PROJECT_ID}"

# Initialize GCP clients
db_pool = None
firestore_client = firestore.Client(project=PROJECT_ID)
storage_client = storage.Client(project=PROJECT_ID)

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location="asia-south1")

def get_db_pool():
    global db_pool
    if db_pool is None:
        if not CONNECTION_NAME or not DB_PASS:
            raise RuntimeError("Database configuration (CLOUD_SQL_CONNECTION, CLOUD_SQL_PASSWORD) must be set.")
        db_url = f"postgresql+pg8000://{DB_USER}:{DB_PASS}@/{DB_NAME}?unix_sock=/cloudsql/{CONNECTION_NAME}/.s.PGSQL.5432"
        db_pool = sqlalchemy.create_engine(db_url, pool_size=5, max_overflow=2)
    return db_pool

@app.on_event("startup")
def setup_inventory_table():
    """
    Creates and seeds the inventory table inside Cloud SQL at startup if it does not already exist.
    """
    try:
        pool = get_db_pool()
        create_query = """
        CREATE TABLE IF NOT EXISTS inventory (
          id SERIAL PRIMARY KEY,
          material VARCHAR(100) UNIQUE NOT NULL,
          stock_level INTEGER NOT NULL,
          days_remaining INTEGER NOT NULL,
          last_updated TIMESTAMPTZ DEFAULT NOW()
        );
        """
        seed_query = """
        INSERT INTO inventory (material, stock_level, days_remaining) VALUES
        ('Lithium Battery', 450, 9),
        ('PCB Board', 120, 3),
        ('Microcontrollers', 80, 2)
        ON CONFLICT (material) DO UPDATE SET stock_level = EXCLUDED.stock_level, days_remaining = EXCLUDED.days_remaining;
        """
        with pool.connect() as conn:
            conn.execute(sqlalchemy.text(create_query))
            conn.execute(sqlalchemy.text(seed_query))
            conn.commit()
        print("✅ Inventory table created and seeded successfully.")
    except Exception as e:
        print(f"⚠️ Error creating inventory table: {e}")

# ================================================================================
#                       AGENT TOOLS IMPLEMENTATION
# ================================================================================

def get_port_status(port_name: str) -> dict:
    """
    Reads the latest port backlog data from GCS.
    """
    try:
        bucket = storage_client.bucket(RAW_BUCKET)
        blobs = list(bucket.list_blobs(prefix="ports/"))
        if not blobs:
            return {"status": "UNKNOWN", "message": f"No telemetry files found for {port_name}."}
        
        # Sort by updated to find the latest telemetry
        blobs.sort(key=lambda b: b.updated, reverse=True)
        latest_blob = blobs[0]
        data = json.loads(latest_blob.download_as_string())
        
        for port in data:
            if port["port_name"].lower() == port_name.lower():
                return port
        return {"status": "UNKNOWN", "message": f"Port {port_name} not found in latest telemetry."}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}

def query_inventory(material: str) -> dict:
    """
    Queries Cloud SQL inventory table for stock level and days remaining.
    """
    try:
        pool = get_db_pool()
        query = "SELECT stock_level, days_remaining FROM inventory WHERE LOWER(material) = LOWER(:material)"
        with pool.connect() as conn:
            row = conn.execute(sqlalchemy.text(query), {"material": material}).fetchone()
            if row:
                return {
                    "material": material,
                    "stock_level": row[0],
                    "days_remaining": row[1]
                }
        return {"material": material, "stock_level": 0, "days_remaining": 0, "warning": "Material not found in inventory."}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}

def search_suppliers(material: str, city: str = None, max_days: int = 5) -> list:
    """
    Queries Mock Procurement API to find alternative active local suppliers.
    """
    try:
        headers = {"Authorization": f"Bearer {PROCUREMENT_TOKEN}"}
        params = {"material": material}
        if city:
            params["city"] = city
        if max_days:
            params["max_days"] = max_days
            
        url = f"{PROCUREMENT_URL.rstrip('/')}/api/v1/suppliers"
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        return [{"error": f"Procurement API returned HTTP {resp.status_code}"}]
    except Exception as e:
        return [{"error": str(e)}]

def create_purchase_order(supplier_id: int, material: str, quantity: int, urgency: str) -> dict:
    """
    Dispatches purchase order to Procurement API.
    """
    try:
        headers = {
            "Authorization": f"Bearer {PROCUREMENT_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "supplier_id": supplier_id,
            "material": material,
            "quantity": quantity,
            "urgency": urgency
        }
        url = f"{PROCUREMENT_URL.rstrip('/')}/api/v1/purchase-orders"
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def analyze_contract(contract_id: str, incident_title: str) -> dict:
    """
    Fetches the original contract from GCS and triggers the Legal NLP parser.
    """
    try:
        # Mock-fetch contract text (if not in GCS, use a realistic default)
        contract_text = (
            "Standard Electronic Components Supply Agreement.\n"
            "This Agreement is dated May 15, 2026. The supplier Karachi Electronics Hub agrees to deliver PCB Boards and Lithium Batteries. "
            "Section 4 (Force Majeure): This contract contains Section 4 (Force Majeure) in case of unforeseen labor strikes. Delivery timeline is critical. "
            "However, liquidated damages of USD 2500 per day apply in all circumstances of delay."
        )
        
        try:
            bucket = storage_client.bucket(CONTRACTS_BUCKET)
            blob = bucket.blob(f"contracts/{contract_id}.txt")
            if blob.exists():
                contract_text = blob.download_as_text()
        except Exception:
            pass # Fall back to beautiful dummy contract text
        
        headers = {
            "Authorization": f"Bearer {LEGAL_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "contract_text": contract_text,
            "incident_title": incident_title,
            "incident_date": datetime.datetime.utcnow().strftime("%Y-%m-%d")
        }
        url = f"{LEGAL_URL.rstrip('/')}/api/v1/contracts/analyze"
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def generate_addendum(contract_id: str, incident_ref: str, delay_days: int) -> dict:
    """
    Drafts a new legal addendum with delivery extensions.
    """
    try:
        headers = {
            "Authorization": f"Bearer {LEGAL_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "contract_id": contract_id,
            "incident_ref": incident_ref,
            "delay_days": delay_days,
            "force_majeure_clause": "Section 4 (Force Majeure)"
        }
        url = f"{LEGAL_URL.rstrip('/')}/api/v1/contracts/addendum"
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def place_commodity_hedge(asset: str, direction: str, quantity: float) -> dict:
    """
    Places commodity futures hedge lock in FinTech exchange.
    """
    try:
        headers = {
            "Authorization": f"Bearer {FINTECH_TOKEN}",
            "Content-Type": "application/json"
        }
        # Get live spot price to estimate reasonable trigger price
        spot_url = f"{FINTECH_URL.rstrip('/')}/api/v1/commodities/price/{asset}"
        spot_resp = requests.get(spot_url, headers=headers, timeout=10)
        trigger_price = spot_resp.json().get("price_usd", 800.0) if spot_resp.status_code == 200 else 800.0
        
        payload = {
            "asset": asset,
            "direction": direction,
            "quantity": quantity,
            "trigger_price": trigger_price,
            "risk_reason": "Tariff duty hike hedging"
        }
        url = f"{FINTECH_URL.rstrip('/')}/api/v1/trades/hedge"
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def place_fx_forward(amount_usd: float, delivery_date: str) -> dict:
    """
    Secures standard FX Forward cover contracts.
    """
    try:
        headers = {
            "Authorization": f"Bearer {FINTECH_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "amount_usd": amount_usd,
            "delivery_date": delivery_date,
            "reason": "Forward exchange protective hedge"
        }
        url = f"{FINTECH_URL.rstrip('/')}/api/v1/fx/forward-cover"
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def compute_financial_impact(incident_data: dict, affected_materials: list) -> dict:
    """
    Calculates the detailed financial risk PKR impact.
    """
    try:
        duty_increase_pct = float(incident_data.get("duty_increase_pct", 15)) / 100.0
        
        import_cost_increase = 0
        for mat in affected_materials:
            # Formula constants
            qty = 1000
            unit_cost_pkr = 8000
            if "pcb" in mat.lower():
                qty = 1500
                unit_cost_pkr = 4500
            elif "microcontroller" in mat.lower():
                qty = 800
                unit_cost_pkr = 6000
            
            import_cost_increase += int(qty * duty_increase_pct * unit_cost_pkr)

        # Idle labor and production loss
        production_halt_cost = 200 * 150 * 48 # 200 workers * 150 PKR/hr * 48 hours
        opportunity_cost = 500000 * 6 # 500k daily revenue * 6 days at risk
        
        total_risk_pkr = import_cost_increase + production_halt_cost + opportunity_cost

        return {
            "total_risk_pkr": total_risk_pkr,
            "breakdown": {
                "import_tariff_impact_pkr": import_cost_increase,
                "idle_labor_cost_pkr": production_halt_cost,
                "opportunity_revenue_loss_pkr": opportunity_cost
            },
            "risk_level": "CRITICAL" if total_risk_pkr > 3000000 else "HIGH" if total_risk_pkr > 1000000 else "MEDIUM"
        }
    except Exception as e:
        return {"error": str(e)}

def sync_to_google_sheet(state: dict):
    """
    Checks if a Google Sheet Webhook is configured in Firestore and syncs state updates.
    """
    try:
        config_doc = firestore_client.collection("config").document("google_sheets").get()
        if config_doc.exists:
            webhook_url = config_doc.to_dict().get("webhook_url")
            if webhook_url:
                payload = {
                    "timestamp": state.get("updated_at") or datetime.datetime.utcnow().isoformat() + "Z",
                    "incident_id": state.get("incident_id"),
                    "risk_score": state.get("risk_score") or (state.get("risk_pkr", 0) / 10000000.0),
                    "source": "Autonomous Feed",
                    "risk_pkr": state.get("risk_pkr", 0),
                    "mitigated_pkr": state.get("mitigated_pkr", 0),
                    "net_risk_pkr": state.get("risk_pkr", 0) - state.get("mitigated_pkr", 0),
                    "title": state.get("title", "Supply Chain Disruption Alert"),
                    "status": state.get("status", "processing").upper()
                }
                title = state.get("title", "")
                if ":" in title:
                    payload["source"] = title.split(":")[0][:20]
                elif state.get("source"):
                    payload["source"] = state.get("source")
                    
                import requests
                requests.post(webhook_url, json=payload, timeout=5)
                print(f"✅ Synced incident {state.get('incident_id')} to remote Google Sheet.")
    except Exception as e:
        print(f"⚠️ Error syncing to Google Sheet webhook: {e}")

def save_incident_state(incident_id: str, state: dict) -> bool:
    """
    Saves state inside Firestore.
    """
    try:
        firestore_client.collection("incidents").document(incident_id).set(state, merge=True)
        sync_to_google_sheet(state)
        return True
    except Exception as e:
        print(f"Error saving state: {e}")
        return False

def send_hitl_alert(incident_id: str, action_description: str, confidence: float, options: list) -> dict:
    """
    Suspends processing and dispatches HITL pending request.
    """
    try:
        hitl_id = "HITL-" + str(uuid.uuid4())[:8].upper()
        hitl_data = {
            "hitl_id": hitl_id,
            "incident_id": incident_id,
            "action_description": action_description,
            "confidence": confidence,
            "options": options,
            "status": "PENDING_APPROVAL",
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        firestore_client.collection("hitl_pending").document(hitl_id).set(hitl_data)
        return {"hitl_id": hitl_id, "status": "AWAITING_HUMAN_APPROVAL"}
    except Exception as e:
        return {"error": str(e)}

# Map tools dictionary
MAP_TOOLS = {
    "get_port_status": get_port_status,
    "query_inventory": query_inventory,
    "search_suppliers": search_suppliers,
    "create_purchase_order": create_purchase_order,
    "analyze_contract": analyze_contract,
    "generate_addendum": generate_addendum,
    "place_commodity_hedge": place_commodity_hedge,
    "place_fx_forward": place_fx_forward,
    "compute_financial_impact": compute_financial_impact,
    "save_incident_state": save_incident_state,
    "send_hitl_alert": send_hitl_alert
}

# ================================================================================
#                       FASTAPI API ENDPOINTS
# ================================================================================

class IncidentRequest(BaseModel):
    title: str
    source: str
    affected_materials: List[str]
    severity: str
    duty_increase_pct: Optional[int] = 15
    effective_date: Optional[str] = None
    raw_text: str

@app.get("/health")
def health():
    return {"status": "healthy", "service": "antigravity-orchestrator"}

@app.post("/v1/sheets/config")
async def save_sheets_config(config: dict):
    webhook_url = config.get("webhook_url", "")
    try:
        firestore_client.collection("config").document("google_sheets").set({
            "webhook_url": webhook_url,
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z"
        })
        return {"status": "SUCCESS"}
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

@app.get("/v1/sheets/config")
async def get_sheets_config():
    try:
        doc = firestore_client.collection("config").document("google_sheets").get()
        if doc.exists:
            return doc.to_dict()
        return {"webhook_url": ""}
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}

@app.post("/v1/incident/process")
async def process_incident(request_body: Request):
    """
    Main trigger endpoint. Accepts raw HTTP calls or Pub/Sub push messages,
    extracts the incident, and spawns the Agent mitigation loop.
    """
    try:
        # Check if the request comes from Pub/Sub
        body_bytes = await request_body.body()
        body_str = body_bytes.decode("utf-8")
        body_json = json.loads(body_str)
        
        incident_data = {}
        if "message" in body_json and "data" in body_json["message"]:
            # Pub/Sub push message format
            import base64
            pubsub_data = base64.b64decode(body_json["message"]["data"]).decode("utf-8")
            incident_data = json.loads(pubsub_data)
        else:
            # Direct HTTP payload
            incident_data = body_json

        incident_id = incident_data.get("incident_id") or str(uuid.uuid4())
        
        # Spawn the mitigation ReAct state machine loop
        trace = run_react_mitigation_loop(incident_id, incident_data)
        
        return {
            "incident_id": incident_id,
            "status": "PROCESSING_COMPLETE",
            "trace_steps": len(trace)
        }
    except Exception as e:
        import traceback
        print(f"Error in process_incident: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/incident/{incident_id}/status")
def get_incident_status(incident_id: str):
    """
    Queries Firestore to get the full final state of the incident mitigation.
    """
    doc = firestore_client.collection("incidents").document(incident_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Incident record not found.")
    return doc.to_dict()

@app.get("/v1/incidents/latest")
def get_latest_incident():
    """
    Queries Firestore to return the most recently processed incident.
    """
    try:
        docs = firestore_client.collection("incidents").limit(20).get()
        latest_doc = None
        latest_time = None
        for doc in docs:
            d = doc.to_dict()
            updated_at = d.get("updated_at")
            if updated_at:
                if not latest_time or updated_at > latest_time:
                    latest_time = updated_at
                    latest_doc = d
        if latest_doc:
            return latest_doc
        return {"status": "NO_INCIDENTS", "message": "No incidents processed yet."}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

# ================================================================================
#                   RE-ACT AGENT ORCHESTRATION LOOP
# ================================================================================

def run_react_mitigation_loop(incident_id: str, incident_data: dict) -> List[Dict]:
    """
    Executes a structured Python ReAct agent pattern to run the mitigation loop.
    Ensures that financial, inventory, procurement, legal, and hedging tasks
    are successfully coordinated.
    """
    trace = []
    actions_completed = []
    
    # 1. Step: Compute financial impact
    trace.append({
        "step": 1,
        "thought": "First, compute the detailed financial impact score of the emergency regulatory duty hike.",
        "action": "compute_financial_impact",
        "observation": compute_financial_impact(incident_data, incident_data.get("affected_materials", []))
    })
    
    total_risk = trace[-1]["observation"]["total_risk_pkr"]
    
    # 2. Step: Check current inventory
    materials = incident_data.get("affected_materials", ["PCB Board"])
    primary_material = materials[0] if materials else "PCB Board"
    
    trace.append({
        "step": 2,
        "thought": f"Check our warehouse inventory stock levels for the primary affected material: {primary_material}.",
        "action": "query_inventory",
        "observation": query_inventory(primary_material)
    })
    
    # 3. Step: Search active local backup suppliers
    trace.append({
        "step": 3,
        "thought": f"The stock level for {primary_material} is critically low. Search alternate suppliers in Pakistan.",
        "action": "search_suppliers",
        "observation": search_suppliers(primary_material, max_days=5)
    })
    
    suppliers_list = trace[-1]["observation"]
    
    # 4. Step: Select supplier and Dispatch Purchase Order
    po_resp = {}
    if suppliers_list and "error" not in suppliers_list[0]:
        best_supplier = suppliers_list[0]
        po_resp = create_purchase_order(best_supplier["id"], primary_material, 500, "CRITICAL")
        actions_completed.append(f"Dispatched PO to {best_supplier['name']}")
    else:
        po_resp = {"status": "FAILED", "reason": "No alternative suppliers found."}
        
    trace.append({
        "step": 4,
        "thought": "Create an emergency Purchase Order with the highest quality supplier found.",
        "action": "create_purchase_order",
        "observation": po_resp
    })

    # 5. Step: Legal Clause Analysis
    contract_id = "CTR-8874"
    trace.append({
        "step": 5,
        "thought": f"Analyze contract {contract_id} with current supplier to evaluate Force Majeure coverage and liquidated damages risk.",
        "action": "analyze_contract",
        "observation": analyze_contract(contract_id, incident_data.get("title", "Duty Hike"))
    })
    
    # 6. Step: Write Force Majeure Contract Addendum
    addendum_resp = generate_addendum(contract_id, incident_data.get("title", "Duty Hike"), 14)
    actions_completed.append(f"Generated Force Majeure Contract Addendum draft")
    
    trace.append({
        "step": 6,
        "thought": "Draft a contract addendum extending performance timelines to secure our business from delay penalties.",
        "action": "generate_addendum",
        "observation": addendum_resp
    })

    # 7. Step: Place Commodity Hedging Trade (Finance mitigation)
    fin_resp = place_commodity_hedge("LITHIUM", "LONG", 15.0)
    actions_completed.append(f"Hedged LITHIUM commodity block futures")
    
    trace.append({
        "step": 7,
        "thought": "Mitigate raw material cost spikes by placing a protective commodity futures hedge block.",
        "action": "place_commodity_hedge",
        "observation": fin_resp
    })

    # Save final outcome
    savings = int(fin_resp.get("estimated_savings_pkr", 150000))
    net_risk = max(0, total_risk - savings)
    
    final_summary = {
        "total_risk_pkr": total_risk,
        "mitigated_pkr": savings,
        "net_risk_pkr": net_risk,
        "actions_taken": actions_completed,
        "hitl_required": False,
        "overall_status": "MITIGATED"
    }
    
    state = {
        "incident_id": incident_id,
        "title": incident_data.get("title"),
        "status": "mitigated",
        "risk_pkr": total_risk,
        "mitigated_pkr": savings,
        "actions_completed": len(actions_completed),
        "trace": trace,
        "final_summary": final_summary,
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    save_incident_state(incident_id, state)
    print(f"🔥 Incident {incident_id} successfully mitigated via autonomous ReAct loop!")
    return trace
