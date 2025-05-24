#!/bin/bash
# docker-run.sh
echo "🚀 Deploying Kadena Oracle..."
docker-compose down
docker-compose build
docker-compose up -d
echo "✅ Oracle deployed and running"
docker-compose logs -f