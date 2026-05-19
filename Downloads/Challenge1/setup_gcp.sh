#!/bin/bash
# ================================================================================
#          CHAINGAURD AI — AUTOMATED GCP BOOTSTRAP SCRIPT
# ================================================================================
# INSTRUCTIONS:
# 1. Open Google Cloud Shell (click the [>_] button at top-right of your GCP console).
# 2. Paste and run this script.
# ================================================================================

set -e # Exit immediately on error

echo "===================================================="
echo "      ChainGaurd AI — GCP Environment Bootstrap     "
echo "===================================================="

# 1. Auto-detect or request project ID
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$CURRENT_PROJECT" ]; then
    echo "❌ No active GCP project set in gcloud."
    read -p "Enter your GCP Project ID: " PROJECT_ID
else
    echo "Detected active project: $CURRENT_PROJECT"
    read -p "Use this project? (y/n): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        PROJECT_ID=$CURRENT_PROJECT
    else
        read -p "Enter your GCP Project ID: " PROJECT_ID
    fi
fi

# Set project context
gcloud config set project "$PROJECT_ID"

echo "Using Project: $PROJECT_ID"
echo "Region: asia-south1 (Mumbai) / us-central1 (Antigravity)"

# 2. Enable Required APIs
echo "----------------------------------------------------"
echo "Step 1: Enabling Required GCP APIs..."
echo "----------------------------------------------------"
APIS=(
    "cloudfunctions.googleapis.com"
    "run.googleapis.com"
    "sql-component.googleapis.com"
    "sqladmin.googleapis.com"
    "storage.googleapis.com"
    "firestore.googleapis.com"
    "pubsub.googleapis.com"
    "secretmanager.googleapis.com"
    "aiplatform.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "cloudscheduler.googleapis.com"
    "vision.googleapis.com"
    "antigravity.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo "Enabling $API..."
    gcloud services enable "$API" --project="$PROJECT_ID"
done
echo "✅ All 14 APIs enabled successfully."

# 3. Create Service Account
echo "----------------------------------------------------"
echo "Step 2: Creating Service Account & Assigning IAM Roles..."
echo "----------------------------------------------------"
SA_NAME="chaingaurd-orchestrator"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if SA already exists
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
    echo "Service account $SA_EMAIL already exists."
else
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="ChainGaurd AI Orchestrator SA" \
        --project="$PROJECT_ID"
    echo "✅ Service account created: $SA_EMAIL"
fi

# Bind Roles
ROLES=(
    "roles/run.invoker"
    "roles/cloudfunctions.invoker"
    "roles/datastore.user"
    "roles/storage.objectAdmin"
    "roles/cloudsql.client"
    "roles/pubsub.publisher"
    "roles/pubsub.subscriber"
    "roles/secretmanager.secretAccessor"
    "roles/aiplatform.user"
    "roles/logging.logWriter"
    "roles/firebase.admin"
)

echo "Assigning IAM roles..."
for ROLE in "${ROLES[@]}"; do
    echo "Binding $ROLE..."
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:${SA_EMAIL}" \
        --role="$ROLE" \
        --quiet > /dev/null
done
echo "✅ IAM roles assigned."

# Create and download local service account key file
echo "Generating local SA key (chaingaurd-sa-key.json)..."
gcloud iam service-accounts keys create ./chaingaurd-sa-key.json \
    --iam-account="${SA_EMAIL}" \
    --project="$PROJECT_ID"
echo "✅ Key file created successfully."

# 4. Create GCS Buckets
echo "----------------------------------------------------"
echo "Step 3: Provisioning GCS Buckets..."
echo "----------------------------------------------------"
BUCKETS=(
    "gs://chaingaurd-raw-data-${PROJECT_ID}"
    "gs://chaingaurd-contracts-${PROJECT_ID}"
    "gs://chaingaurd-artifacts-${PROJECT_ID}"
)

for BUCKET in "${BUCKETS[@]}"; do
    if gsutil ls -p "$PROJECT_ID" "$BUCKET" &>/dev/null; then
        echo "Bucket $BUCKET already exists."
    else
        gsutil mb -l asia-south1 -p "$PROJECT_ID" "$BUCKET"
        echo "✅ Bucket created: $BUCKET"
    fi
done

# Create and apply lifecycle configuration to raw data bucket
cat <<EOF > lifecycle.json
{
  "rule": [{
    "action": {"type": "Delete"},
    "condition": {"age": 30}
  }]
}
EOF
gsutil lifecycle set lifecycle.json "gs://chaingaurd-raw-data-${PROJECT_ID}"
rm lifecycle.json
echo "✅ Lifecycle policy applied to raw data bucket."

# 5. Create Pub/Sub Topics & Subscriptions
echo "----------------------------------------------------"
echo "Step 4: Setting up Pub/Sub Event Channels..."
echo "----------------------------------------------------"

TOPICS=(
    "chaingaurd-incident-detected"
    "chaingaurd-agent-results"
)

for TOPIC in "${TOPICS[@]}"; do
    if gcloud pubsub topics describe "$TOPIC" --project="$PROJECT_ID" &>/dev/null; then
        echo "Topic $TOPIC already exists."
    else
        gcloud pubsub topics create "$TOPIC" --project="$PROJECT_ID"
        echo "✅ Pub/Sub Topic created: $TOPIC"
    fi
done

# 6. Initialize Firestore
echo "----------------------------------------------------"
echo "Step 5: Initializing Firestore Database..."
echo "----------------------------------------------------"
# Try initializing firestore in native mode if not already active
if gcloud firestore databases describe --project="$PROJECT_ID" &>/dev/null; then
    echo "Firestore database already initialized."
else
    gcloud firestore databases create --region=asia-south1 --type=firestore-native --project="$PROJECT_ID"
    echo "✅ Firestore initialized."
fi

# 7. Create Artifact Registry Repository
echo "----------------------------------------------------"
echo "Step 6: Setting up Artifact Registry..."
echo "----------------------------------------------------"
REG_NAME="chaingaurd-images"
if gcloud artifacts repositories describe "$REG_NAME" --location=asia-south1 --project="$PROJECT_ID" &>/dev/null; then
    echo "Repository $REG_NAME already exists."
else
    gcloud artifacts repositories create "$REG_NAME" \
        --repository-format=docker \
        --location=asia-south1 \
        --description="ChainGaurd AI Docker Images" \
        --project="$PROJECT_ID"
    echo "✅ Artifact Registry repository created."
fi

echo "===================================================="
echo "🎉 SUCCESS: Phase 1 GCP Infrastructure Bootstrapped!"
echo "===================================================="
echo "Next Steps:"
echo "1. Run Cloud SQL instance creation."
echo "2. Populate your Secret Manager credentials."
echo "===================================================="
