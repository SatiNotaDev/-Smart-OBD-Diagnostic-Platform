#!/bin/bash
set -euo pipefail

# Smart OBD Deploy Script
# Usage: ./deploy.sh [server-ip]

SERVER=${1:-$(cd "$(dirname "$0")/../terraform" && terraform output -raw server_ip 2>/dev/null || echo "")}

if [ -z "$SERVER" ]; then
  echo "Usage: ./deploy.sh <server-ip>"
  echo "Or run 'terraform output' in infra/terraform/ first"
  exit 1
fi

APP_DIR="/opt/smart-obd"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=> Deploying to $SERVER..."

# Sync project files (excluding node_modules, .git, etc.)
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='coverage' \
  --exclude='*.env.local' \
  --exclude='terraform.tfstate*' \
  --exclude='terraform.tfvars' \
  --exclude='.terraform' \
  "$REPO_ROOT/" "root@$SERVER:$APP_DIR/"

echo "=> Building and starting services..."

ssh "root@$SERVER" << 'EOF'
cd /opt/smart-obd

# Build and deploy
docker compose -f docker-compose.prod.yml build --parallel
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Cleanup old images
docker image prune -f

echo "=> Deploy complete!"
EOF
