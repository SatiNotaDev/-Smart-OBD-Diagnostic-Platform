#!/bin/bash
set -euo pipefail

# Initial SSL certificate setup with Let's Encrypt
# Run this ONCE after first deploy

SERVER=${1:-$(cd "$(dirname "$0")/../terraform" && terraform output -raw server_ip 2>/dev/null || echo "")}
DOMAIN=${2:-""}

if [ -z "$SERVER" ] || [ -z "$DOMAIN" ]; then
  echo "Usage: ./ssl-init.sh <server-ip> <domain>"
  exit 1
fi

echo "=> Setting up SSL for $DOMAIN on $SERVER..."

ssh "root@$SERVER" << SSHEOF
cd /opt/smart-obd

# Start nginx with HTTP only (for ACME challenge)
# Temporarily use a simple config
cat > /tmp/nginx-init.conf << 'NGINXEOF'
events { worker_connections 1024; }
http {
    server {
        listen 80;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Setting up SSL...';
            add_header Content-Type text/plain;
        }
    }
}
NGINXEOF

docker run -d --name nginx-init \
  -p 80:80 \
  -v /tmp/nginx-init.conf:/etc/nginx/nginx.conf:ro \
  -v smart-obd_certbot_www:/var/www/certbot \
  nginx:alpine

# Get certificate
docker run --rm \
  -v smart-obd_certbot_conf:/etc/letsencrypt \
  -v smart-obd_certbot_www:/var/www/certbot \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@${DOMAIN} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN}

# Cleanup init container
docker stop nginx-init && docker rm nginx-init

echo "=> SSL certificate obtained! Now run deploy.sh to start all services."
SSHEOF
