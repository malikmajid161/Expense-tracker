import os
import uuid
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import firestore
import sqlalchemy

# Initialize FastAPI App
app = FastAPI(
    title="ChainGaurd AI — Mock Procurement API",
    description="Simulated supplier management and purchase-order dispatch microservice.",
    version="1.0.0"
)

# Enable CORS for cross-origin mobile dashboard sync
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secure Bearer Authorization
security_scheme = HTTPBearer()

# Read configurations from environment variables (secured via Secret Manager injections)
PROJECT_ID = os.environ.get("GCP_PROJECT") or "chaingaurd-ai"
CONNECTION_NAME = os.environ.get("CLOUD_SQL_CONNECTION")
DB_USER = "chaingaurd_app"
DB_PASS = os.environ.get("CLOUD_SQL_PASSWORD")
DB_NAME = "chaingaurd"
EXPECTED_TOKEN = os.environ.get("MOCK_PROCUREMENT_TOKEN") or "chaingaurd-demo-token-procurement"

# Lazy-loaded database connection pool using standard Unix Socket connection
db_pool = None

def get_db_pool():
    global db_pool
    if db_pool is None:
        if not CONNECTION_NAME or not DB_PASS:
            raise RuntimeError("Database configuration environment variables (CLOUD_SQL_CONNECTION, CLOUD_SQL_PASSWORD) must be set.")
        
        # Connect using Cloud Run Unix Socket mount /cloudsql/INSTANCE_CONNECTION_NAME
        # This bypasses the need for the google-cloud-sql-connector library
        db_url = f"postgresql+pg8000://{DB_USER}:{DB_PASS}@/{DB_NAME}?unix_sock=/cloudsql/{CONNECTION_NAME}/.s.PGSQL.5432"
        db_pool = sqlalchemy.create_engine(
            db_url,
            pool_size=5,
            max_overflow=2,
            pool_timeout=30,
            pool_recycle=1800
        )
        print("Connected to Cloud SQL PostgreSQL via Unix socket successfully.")
    return db_pool

# Initialize Firestore
firestore_client = firestore.Client(project=PROJECT_ID)

# Authentication Dependency
def validate_token(credentials: HTTPAuthorizationCredentials = Security(security_scheme)):
    token = credentials.credentials
    if token != EXPECTED_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired security authorization credentials."
        )
    return token

# Pydantic Schemas
class PurchaseOrderRequest(BaseModel):
    supplier_id: int
    material: str
    quantity: int
    urgency: str  # NORMAL, URGENT, CRITICAL

class PurchaseOrderResponse(BaseModel):
    po_id: str
    supplier_id: int
    supplier_name: str
    material: str
    quantity: int
    estimated_delivery: str
    total_cost_pkr: int
    urgency: str
    status: str
    created_at: str

# API Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mock-procurement-api",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/v1/suppliers")
def list_suppliers(
    material: str,
    city: Optional[str] = None,
    max_days: Optional[int] = None,
    token: str = Depends(validate_token)
):
    """
    Queries Cloud SQL supplier table to find active backups matching material and logistics filters.
    """
    try:
        pool = get_db_pool()
        query = "SELECT id, name, city, country, materials, price_index, delivery_days, quality_score FROM suppliers WHERE active = TRUE AND :material = ANY(materials)"
        params = {"material": material}

        if city:
            query += " AND city = :city"
            params["city"] = city
        if max_days:
            query += " AND delivery_days <= :max_days"
            params["max_days"] = max_days

        query += " ORDER BY quality_score DESC, price_index ASC"

        suppliers = []
        with pool.connect() as conn:
            result = conn.execute(sqlalchemy.text(query), params)
            for row in result:
                suppliers.append({
                    "id": row[0],
                    "name": row[1],
                    "city": row[2],
                    "country": row[3],
                    "materials": row[4],
                    "price_index": float(row[5]) if row[5] else 1.0,
                    "delivery_days": row[6],
                    "quality_score": float(row[7]) if row[7] else 0.0
                })
        
        return suppliers
    except Exception as e:
        print(f"Error querying suppliers: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query database suppliers: {str(e)}"
        )

@app.post("/api/v1/purchase-orders", response_model=PurchaseOrderResponse)
def create_purchase_order(
    request: PurchaseOrderRequest,
    token: str = Depends(validate_token)
):
    """
    Verifies supplier eligibility from Cloud SQL, calculates costs, dispatches mock PO, and registers in Firestore.
    """
    try:
        pool = get_db_pool()
        # Fetch supplier info
        query = "SELECT name, price_index, delivery_days FROM suppliers WHERE id = :id"
        with pool.connect() as conn:
            row = conn.execute(sqlalchemy.text(query), {"id": request.supplier_id}).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Requested backup supplier not found in databases.")
            
            supplier_name = row[0]
            price_index = float(row[1]) if row[1] else 1.0
            delivery_days = row[2]

        # Financial formula calculations
        base_unit_cost = 8000 # Standard cost for lithium battery cells / electronic modules in PKR
        if "pcb" in request.material.lower():
            base_unit_cost = 4500
        elif "microcontroller" in request.material.lower():
            base_unit_cost = 6000

        total_cost = int(request.quantity * base_unit_cost * price_index)
        
        # Adjust delivery days based on urgency
        adjusted_days = delivery_days
        if request.urgency == "CRITICAL":
            adjusted_days = max(1, delivery_days - 2)
        elif request.urgency == "URGENT":
            adjusted_days = max(1, delivery_days - 1)

        po_id = "PO-" + str(uuid.uuid4())[:8].upper()
        now = datetime.datetime.utcnow()
        est_delivery = (now + datetime.timedelta(days=adjusted_days)).strftime("%Y-%m-%d")

        po_data = {
            "po_id": po_id,
            "supplier_id": request.supplier_id,
            "supplier_name": supplier_name,
            "material": request.material,
            "quantity": request.quantity,
            "estimated_delivery": est_delivery,
            "total_cost_pkr": total_cost,
            "urgency": request.urgency,
            "status": "CONFIRMED",
            "created_at": now.isoformat() + "Z"
        }

        # Save to Firestore collection 'purchase_orders'
        firestore_client.collection("purchase_orders").document(po_id).set(po_data)
        print(f"✅ Purchase Order registered in Firestore: Document ID {po_id}")

        return po_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating purchase order: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Database or database pool error: {str(e)}"
        )

@app.get("/api/v1/purchase-orders/{po_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    po_id: str,
    token: str = Depends(validate_token)
):
    """
    Fetches PO status directly from Firestore database.
    """
    try:
        doc = firestore_client.collection("purchase_orders").document(po_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Purchase order not found.")
        return doc.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching purchase order: {e}")
        raise HTTPException(status_code=500, detail=str(e))
