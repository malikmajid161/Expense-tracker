#!/bin/bash
# ================================================================================
#          CHAINGAURD AI — AUTOMATED GCP DEPLOYMENT & UPDATE SCRIPT
# ================================================================================
# INSTRUCTIONS:
# 1. Open Google Cloud Shell (click the [>_] button at top-right of your GCP console).
# 2. Upload your modified workspace folder.
# 3. Navigate to the workspace folder and run: chmod +x deploy_gcp.sh && ./deploy_gcp.sh
# ================================================================================

set -e # Exit immediately on error

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      ChainGaurd AI — GCP Deployment & Sync Update  ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Auto-detect or request project ID
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${RED}❌ No active GCP project set in gcloud.${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
else
    echo -e "Detected active project: ${GREEN}$CURRENT_PROJECT${NC}"
    read -p "Use this project for deployment? (y/n): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        PROJECT_ID=$CURRENT_PROJECT
    else
        read -p "Enter your GCP Project ID: " PROJECT_ID
    fi
fi

# Set project context
gcloud config set project "$PROJECT_ID"

echo -e "\n${BLUE}----------------------------------------------------${NC}"
echo -e "Step 1: Building & Deploying Live Orchestrator to Cloud Run..."
echo -e "${BLUE}----------------------------------------------------${NC}"

# Submit Docker build to Google Cloud Build
echo "Submitting docker build to Cloud Build..."
gcloud builds submit --tag "asia-south1-docker.pkg.dev/${PROJECT_ID}/chaingaurd-images/orchestrator:latest" ./orchestrator

# Deploy the image to Cloud Run
echo "Deploying container image to Cloud Run..."
gcloud run deploy "antigravity-orchestrator" \
    --image "asia-south1-docker.pkg.dev/${PROJECT_ID}/chaingaurd-images/orchestrator:latest" \
    --region "asia-south1" \
    --service-account "chaingaurd-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
    --allow-unauthenticated \
    --port 8080

ORCHESTRATOR_URL=$(gcloud run services describe antigravity-orchestrator --region asia-south1 --format='value(status.url)')
echo -e "${GREEN}✅ Orchestrator deployed successfully to Cloud Run!${NC}"
echo -e "Service URL: ${BLUE}${ORCHESTRATOR_URL}${NC}"


echo -e "\n${BLUE}----------------------------------------------------${NC}"
echo -e "Step 2: Deploying News Scraper to Cloud Functions..."
echo -e "${BLUE}----------------------------------------------------${NC}"

# Deploy the scraper function
echo "Deploying Python news-scraper function..."
gcloud functions deploy "chaingaurd-news-scraper" \
    --runtime "python311" \
    --trigger-http \
    --entry-point "news_scraper" \
    --region "asia-south1" \
    --service-account "chaingaurd-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
    --allow-unauthenticated

SCRAPER_URL=$(gcloud functions describe chaingaurd-news-scraper --region asia-south1 --format='value(httpsTrigger.url)')
echo -e "${GREEN}✅ News Scraper function deployed successfully!${NC}"
echo -e "Function URL: ${BLUE}${SCRAPER_URL}${NC}"

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}🎉 SUCCESS: All ChainGuard components updated on GCP!${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Use the URLs below in your Web Dashboard configurations:"
echo -e "1. Orchestrator API Base: ${GREEN}${ORCHESTRATOR_URL}${NC}"
echo -e "2. News Scraper Endpoint: ${GREEN}${SCRAPER_URL}${NC}"
echo -e "${BLUE}====================================================${NC}"
