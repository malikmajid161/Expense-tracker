import os
import uuid
import random
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import firestore

app = FastAPI(
    title="ChainGaurd AI — Mock FinTech API",
    description="Simulated commodity hedging and foreign-exchange (FX) forward cover service.",
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
EXPECTED_TOKEN = os.environ.get("MOCK_FINTECH_API_TOKEN") or "chaingaurd-demo-token-fintech"

# Base Commodity prices in USD
COMMODITY_BASE_PRICES = {
    "LITHIUM": 13500.00,  # Per Metric Ton
    "STEEL": 680.00,      # Per Metric Ton
    "COPPER": 8450.00,    # Per Metric Ton
    "ALUMINUM": 2200.00,  # Per Metric Ton
    "CRUDE_OIL": 78.50    # Per Barrel
}

# Base FX rates relative to PKR
FX_BASE_RATES = {
    "USD": 278.40,
    "EUR": 302.15,
    "CNY": 38.65
}

# Initialize Firestore Client
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
class HedgeTradeRequest(BaseModel):
    asset: str  # LITHIUM, STEEL, etc.
    direction: str  # LONG, SHORT
    quantity: float
    trigger_price: float
    risk_reason: str

class ForwardCoverRequest(BaseModel):
    amount_usd: float
    delivery_date: str
    reason: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mock-fintech-api",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/v1/fx/rates")
def get_fx_rates(token: str = Depends(validate_token)):
    """
    Returns live simulated FX rates with small market fluctuations.
    """
    rates = {}
    for currency, base in FX_BASE_RATES.items():
        change = round(random.uniform(-0.6, 0.8), 2)
        multiplier = 1.0 + (change / 100.0)
        rates[currency] = {
            "rate_pkr": round(base * multiplier, 2),
            "24h_change_pct": change,
            "trend": "UP" if change > 0 else "DOWN" if change < 0 else "STABLE"
        }
    return {
        "base_currency": "PKR",
        "rates": rates,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/v1/commodities/price/{asset}")
def get_commodity_price(asset: str, token: str = Depends(validate_token)):
    """
    Returns live spot prices for requested commodities in both USD and PKR.
    """
    asset_upper = asset.upper()
    if asset_upper not in COMMODITY_BASE_PRICES:
        raise HTTPException(status_code=404, detail=f"Commodity asset '{asset}' not supported.")
    
    usd_price = COMMODITY_BASE_PRICES[asset_upper]
    
    # Add random fluctuation ±3%
    change = round(random.uniform(-2.5, 3.5), 2)
    usd_price = round(usd_price * (1.0 + (change / 100.0)), 2)

    # Convert to PKR using current USD/PKR rate
    pkr_rate = FX_BASE_RATES["USD"]
    pkr_price = round(usd_price * pkr_rate, 2)

    return {
        "asset": asset_upper,
        "price_usd": usd_price,
        "price_pkr": pkr_price,
        "unit": "Metric Ton" if asset_upper != "CRUDE_OIL" else "Barrel",
        "24h_change_pct": change,
        "trend": "UP" if change > 0 else "DOWN" if change < 0 else "STABLE",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.post("/api/v1/trades/hedge")
def place_hedge(request: HedgeTradeRequest, token: str = Depends(validate_token)):
    """
    Simulates placing a commodity futures block trade and calculates direct savings protection.
    """
    asset_upper = request.asset.upper()
    if asset_upper not in COMMODITY_BASE_PRICES:
        raise HTTPException(status_code=404, detail="Commodity asset not traded on this exchange.")

    current_usd = COMMODITY_BASE_PRICES[asset_upper]
    usd_pkr_rate = FX_BASE_RATES["USD"]
    current_pkr = current_usd * usd_pkr_rate

    # Potential savings = quantity * price delta * volatility offset
    price_delta_pkr = abs(current_pkr - (request.trigger_price * usd_pkr_rate))
    estimated_savings_pkr = int(request.quantity * price_delta_pkr * 0.85)

    order_id = "TRD-" + str(uuid.uuid4())[:8].upper()
    now = datetime.datetime.utcnow()

    trade_data = {
        "order_id": order_id,
        "asset": asset_upper,
        "direction": request.direction.upper(),
        "quantity": request.quantity,
        "entry_price_usd": current_usd,
        "entry_price_pkr": round(current_pkr, 2),
        "trigger_price_usd": request.trigger_price,
        "estimated_savings_pkr": max(120000, estimated_savings_pkr),  # Guarantee base protection value
        "risk_reason": request.risk_reason,
        "status": "FILLED",
        "executed_at": now.isoformat() + "Z"
    }

    # Save to Firestore
    firestore_client.collection("hedge_trades").document(order_id).set(trade_data)
    print(f"✅ Future Hedging trade filled & saved to Firestore: {order_id}")

    return trade_data

@app.post("/api/v1/fx/forward-cover")
def place_forward_cover(request: ForwardCoverRequest, token: str = Depends(validate_token)):
    """
    Issues fixed-rate FX forward contracts to hedge against currency devaluation.
    """
    try:
        contract_id = "FWD-" + str(uuid.uuid4())[:8].upper()
        now = datetime.datetime.utcnow()

        # Premium rate fee (0.3% - 0.7%) depending on length of contract
        premium = random.uniform(0.003, 0.007)
        base_rate = FX_BASE_RATES["USD"]
        forward_rate = round(base_rate * (1.0 + premium), 2)

        # Devaluation protection calculation (assumes a 5% devaluation risk)
        future_risk_rate = base_rate * 1.05
        protection_value = int(request.amount_usd * (future_risk_rate - forward_rate))

        contract_data = {
            "contract_id": contract_id,
            "amount_usd": request.amount_usd,
            "spot_rate_pkr": base_rate,
            "forward_rate_pkr": forward_rate,
            "premium_pct": round(premium * 100, 3),
            "settlement_date": request.delivery_date,
            "protection_value_pkr": max(350000, protection_value),
            "reason": request.reason,
            "status": "CONTRACT_PLACED",
            "created_at": now.isoformat() + "Z"
        }

        # Store in Firestore
        firestore_client.collection("fx_forward_contracts").document(contract_id).set(contract_data)
        print(f"✅ FX Forward Contract recorded in Firestore: {contract_id}")

        return contract_data
    except Exception as e:
        print(f"Error issuing forward cover: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/trades/{order_id}")
def get_trade_details(order_id: str, token: str = Depends(validate_token)):
    """
    Fetches futures trade details directly from Firestore database.
    """
    doc = firestore_client.collection("hedge_trades").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Hedging order record not found.")
    return doc.to_dict()
