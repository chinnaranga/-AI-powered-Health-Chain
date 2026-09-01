#!/bin/bash
# ==============================================================================
# HealthChain Enterprise Automated Server & Service Starter
# ==============================================================================

set -e

echo "======================================================"
echo " Starting HealthChain Enterprise Server..."
echo " Primary DB: Neon PostgreSQL"
echo " Realtime: WebSocket Event Bus (/ws)"
echo " Hosting: Firebase Hosting (https://healthcare-edb75.web.app/)"
echo "======================================================"

# 1. Ensure environment template is present
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
  fi
fi

# 2. Run automated database setup & migrations
node server/bootstrap.js
