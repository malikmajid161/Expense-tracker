import os
import uuid
import datetime
from typing import Optional, Dict
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import storage
from google.cloud import firestore

app = FastAPI(
    title="ChainGaurd AI — Mock Legal-Tech API",
    description="Simulated contract analysis and automated Force Majeure addendum generator.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security_scheme = HTTPBearer()

# Read configurations
PROJECT_ID = os.environ.get("GCP_PROJECT") or "chaingaurd-ai"
BUCKET_NAME = f"chaingaurd-contracts-{PROJECT_ID}"
EXPECTED_TOKEN = os.environ.get("MOCK_LEGAL_API_TOKEN") or "chaingaurd-demo-token-legal"

# Initialize GCP clients lazy-loaded
storage_client = storage.Client(project=PROJECT_ID)
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

# Pydantic Request/Response models
class AnalyzeContractRequest(BaseModel):
    contract_text: str
    incident_title: str
    incident_date: str

class GenerateAddendumRequest(BaseModel):
    contract_id: str
    incident_ref: str
    delay_days: int
    force_majeure_clause: str

class PushApprovalRequest(BaseModel):
    addendum_id: str
    client_email: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mock-legal-api",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.post("/api/v1/contracts/analyze")
def analyze_contract(
    request: AnalyzeContractRequest,
    token: str = Depends(validate_token)
):
    """
    Performs deterministic NLP (regex-matching) to isolate key clauses (Force Majeure, Liquidated Damages, Dispute Resolution).
    """
    text_lower = request.contract_text.lower()
    
    # NLP Extraction logic
    fm_clauses = [
        "force majeure", "act of god", "unforeseen circumstances", "beyond control",
        "strike", "labor dispute", "government regulations", "embargo"
    ]
    ld_clauses = ["penalty", "liquidated damages", "forfeit", "delay penalty", "per day of delay"]
    de_clauses = ["extension of time", "delivery timeline", "revised schedule", "delay notice"]
    arb_clauses = ["arbitration", "dispute resolution", "governing law", "jurisdiction"]

    def extract_surrounding_sentence(keywords, text):
        sentences = text.split('.')
        matches = []
        for sentence in sentences:
            for keyword in keywords:
                if keyword in sentence.lower():
                    matches.append(sentence.strip() + ".")
                    break
        return " ".join(matches[:2]) if matches else None

    fm_found = extract_surrounding_sentence(fm_clauses, request.contract_text)
    ld_found = extract_surrounding_sentence(ld_clauses, request.contract_text)
    de_found = extract_surrounding_sentence(de_clauses, request.contract_text)
    arb_found = extract_surrounding_sentence(arb_clauses, request.contract_text)

    # Risk level determination
    risk_level = "LOW"
    recommended_action = "NO_ACTION"

    if fm_found:
        if ld_found:
            # High risk: liquid damages exist and FM requires negotiation
            risk_level = "HIGH"
            recommended_action = "ADDENDUM_REQUIRED"
        else:
            risk_level = "MEDIUM"
            recommended_action = "NOTIFICATION_ONLY"
    else:
        if ld_found:
            # Extreme risk: Liquid damages exist but no Force Majeure protection!
            risk_level = "HIGH"
            recommended_action = "ADDENDUM_REQUIRED"

    return {
        "contract_analyzed": True,
        "clauses_found": {
            "force_majeure": fm_found or "Not found",
            "liquidated_damages": ld_found or "Not found",
            "delivery_extension": de_found or "Not found",
            "arbitration": arb_found or "Not found"
        },
        "risk_level": risk_level,
        "recommended_action": recommended_action
    }

@app.post("/api/v1/contracts/addendum")
def generate_addendum(
    request: GenerateAddendumRequest,
    token: str = Depends(validate_token)
):
    """
    Generates a professional force majeure contract addendum as text, and uploads it to GCS.
    """
    try:
        addendum_id = "ADD-" + str(uuid.uuid4())[:8].upper()
        now = datetime.datetime.utcnow()
        formatted_date = now.strftime("%B %d, %Y")

        addendum_text = (
            f"CONTRACT ADDENDUM {addendum_id}\n"
            f"EFFECTIVE DATE: {formatted_date}\n"
            f"REF INCIDENT: {request.incident_ref}\n\n"
            f"This Addendum is entered into by and between the parties to the Contract Reference {request.contract_id}.\n\n"
            f"1. BACKGROUND & WITNESSETH\n"
            f"Due to the emergence of the major supply chain disruption event '{request.incident_ref}', "
            f"which qualifies as an event of Force Majeure as recognized under the terms of Section 4 (Force Majeure) "
            f"of the original agreement ('{request.force_majeure_clause}'), performance timelines are severely affected.\n\n"
            f"2. AGREEMENT & AMENDMENT\n"
            f"The parties hereby agree to amend the delivery schedule as follows:\n"
            f" - The original delivery schedule is hereby extended by exactly {request.delay_days} calendar days.\n"
            f" - No liquidated damages or late performance penalties shall accrue or be charged for the duration of this extension.\n"
            f" - All other terms, conditions, and covenants of the original contract remain in full force and effect.\n\n"
            f"3. SIGNATURE BLOCKS\n"
            f"For Supplier: ______________________             For Buyer: ______________________\n"
            f"Date: {formatted_date}                             Date: {formatted_date}\n"
        )

        # Upload to Google Cloud Storage
        gcs_filename = f"addendums/{addendum_id}.txt"
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(gcs_filename)
        blob.upload_from_string(addendum_text, content_type="text/plain")
        gcs_url = f"gs://{BUCKET_NAME}/{gcs_filename}"
        http_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{gcs_filename}"

        addendum_data = {
            "addendum_id": addendum_id,
            "contract_id": request.contract_id,
            "incident_ref": request.incident_ref,
            "delay_days": request.delay_days,
            "addendum_text": addendum_text,
            "gcs_url": gcs_url,
            "http_url": http_url,
            "status": "DRAFT_CREATED",
            "created_at": now.isoformat() + "Z"
        }

        # Store record in Firestore
        firestore_client.collection("addendums").document(addendum_id).set(addendum_data)
        print(f"✅ Addendum recorded in Firestore & uploaded to GCS: {addendum_id}")

        return addendum_data
    except Exception as e:
        print(f"Error generating addendum: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/contracts/push-approval")
def push_approval(
    request: PushApprovalRequest,
    token: str = Depends(validate_token)
):
    """
    Saves approval requests inside Firestore and triggers real-time dashboard notifications.
    """
    try:
        approval_id = "APP-" + str(uuid.uuid4())[:8].upper()
        now = datetime.datetime.utcnow()

        approval_data = {
            "approval_id": approval_id,
            "addendum_id": request.addendum_id,
            "client_email": request.client_email,
            "status": "PENDING_APPROVAL",
            "estimated_response_hours": 24,
            "mock_client_portal_url": f"https://mock-legal-portal.chaingaurd-ai.run/approve/{approval_id}",
            "created_at": now.isoformat() + "Z"
        }

        # Store in Firestore collection 'approval_requests'
        firestore_client.collection("approval_requests").document(approval_id).set(approval_data)
        print(f"✅ Contract approval notification pushed. ID: {approval_id}")

        return approval_data
    except Exception as e:
        print(f"Error pushing approval: {e}")
        raise HTTPException(status_code=500, detail=str(e))
