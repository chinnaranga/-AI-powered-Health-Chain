#!/bin/bash
# ==============================================================================
# HealthChain Cloud Run Automated Production Deployment Script
# ==============================================================================

set -e

SERVICE_NAME="healthchain-backend"
REGION="${GCP_REGION:-us-central1}"
PROJECT_ID="${GCP_PROJECT_ID:-healthcare-edb75}"

echo "======================================================"
echo " Deploying HealthChain Backend to Google Cloud Run"
echo " Project: $PROJECT_ID"
echo " Service: $SERVICE_NAME"
echo " Region:  $REGION"
echo "======================================================"

# Deploy directly from source to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --session-affinity \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300

echo ""
echo "✓ HealthChain Backend successfully deployed to Google Cloud Run!"
echo "✓ Service URL: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID)"
