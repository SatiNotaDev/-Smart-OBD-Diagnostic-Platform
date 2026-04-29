# DNS Setup

## Option A: Cloudflare (recommended)

Cloudflare gives you free DDoS protection + CDN + DNS.

### 1. Buy domain

Any registrar (Namecheap, Porkbun, Cloudflare Registrar — cheapest at ~$9/year for .com).

### 2. Add to Cloudflare

1. Create free Cloudflare account at cloudflare.com
2. "Add site" → enter your domain
3. Cloudflare will scan existing DNS records
4. It gives you 2 nameservers — set these at your registrar

### 3. Add A record

In Cloudflare DNS settings:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | `<SERVER_IP>` | Proxied (orange cloud) |
| A | www | `<SERVER_IP>` | Proxied |

Get `<SERVER_IP>` from:
```bash
cd infra/terraform && terraform output server_ip
```

### 4. SSL settings in Cloudflare

- SSL/TLS → "Full (strict)"
- Edge Certificates → "Always Use HTTPS" → On
- Edge Certificates → "Minimum TLS Version" → 1.2

### 5. Wait

DNS propagation: 5 minutes to 48 hours (usually ~10 min with Cloudflare).

Verify:
```bash
dig +short yourdomain.com
# Should return your server IP
```

---

## Option B: Direct (no Cloudflare)

Just set A record at your domain registrar:

```
A    @     → <SERVER_IP>    TTL: 300
A    www   → <SERVER_IP>    TTL: 300
```

Then SSL is handled by Let's Encrypt (certbot in docker-compose).

---

## After DNS is ready

```bash
# 1. Init SSL certificate
./infra/scripts/ssl-init.sh <SERVER_IP> yourdomain.com

# 2. Deploy
./infra/scripts/deploy.sh <SERVER_IP>
```

## Verify

```bash
curl https://yourdomain.com/api/health
# → {"status":"ok","timestamp":"..."}
```
