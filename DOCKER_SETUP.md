# Docker Setup Guide

## 🐳 Install Docker on Linux

### Option 1: Quick Install Script (Recommended)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Option 2: Manual Install (Ubuntu/Debian)
```bash
# 1. Update packages
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 2. Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Post-Install: Add user to docker group (no sudo needed)
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Installation
```bash
docker --version
docker compose version
```

---

## 🚀 Start PostgreSQL Database

### 1. Navigate to backend folder
```bash
cd /home/stn/-Smart-OBD-Diagnostic-Platform/backend
```

### 2. Create .env.local file
```bash
cp .env.example .env.local
```

### 3. Edit .env.local (optional - defaults work)
```bash
nano .env.local
# or
code .env.local
```

### 4. Start PostgreSQL container
```bash
docker compose up -d postgres
```

This will:
- Download PostgreSQL 15 image
- Create container `smart_obd_postgres`
- Start on port **5433** (not default 5432 to avoid conflicts)
- Create database `smart_obd`
- Use credentials: postgres/postgres
- Persist data in Docker volume

### 5. Verify PostgreSQL is running
```bash
docker compose ps
```

Should show:
```
NAME                   IMAGE         STATUS
smart_obd_postgres     postgres:15   Up
```

### 6. Check PostgreSQL logs (optional)
```bash
docker compose logs postgres
```

---

## 📦 Install Node.js Dependencies

```bash
cd /home/stn/-Smart-OBD-Diagnostic-Platform/backend
npm install
```

---

## 🔄 Run Prisma Migrations

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Create and run migration
```bash
npx prisma migrate dev --name init
```

This will:
- Create migration files
- Apply schema to database
- Generate Prisma Client

### 3. Open Prisma Studio (optional - GUI for database)
```bash
npx prisma studio
```

Opens at: http://localhost:5555

---

## ✅ Start Backend Server

```bash
npm run start:dev
```

Server starts at: **http://localhost:3000**

---

## 🛑 Stop/Start Database

### Stop
```bash
docker compose down
```

### Start
```bash
docker compose up -d postgres
```

### Stop and remove all data
```bash
docker compose down -v
```

---

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart
docker compose restart postgres
```

### Error: "Port 5433 already in use"
```bash
# Check what's using port
sudo lsof -i :5433

# Kill process or change port in docker-compose.yml
```

### Error: "permission denied while trying to connect to Docker daemon"
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker compose up -d postgres
```

### Reset database completely
```bash
# Stop and remove containers + volumes
docker compose down -v

# Start fresh
docker compose up -d postgres

# Re-run migrations
npx prisma migrate dev
```

---

## 📊 Database Connection Details

**Docker (development):**
- Host: `localhost`
- Port: `5433`
- Database: `smart_obd`
- User: `postgres`
- Password: `postgres`
- Connection URL: `postgresql://postgres:postgres@localhost:5433/smart_obd`

**Production:**
- Use Supabase, Railway, or other managed PostgreSQL
- Update DATABASE_URL in .env

---

## 🎯 Quick Start Checklist

- [ ] Install Docker
- [ ] Add user to docker group
- [ ] Navigate to backend folder
- [ ] Copy .env.example to .env.local
- [ ] Start PostgreSQL: `docker compose up -d postgres`
- [ ] Install dependencies: `npm install`
- [ ] Generate Prisma: `npx prisma generate`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Start server: `npm run start:dev`
- [ ] Test: http://localhost:3000/api/auth/me (should get 401)

---

## 💡 Useful Docker Commands

```bash
# View all containers
docker ps -a

# View logs
docker compose logs -f postgres

# Enter PostgreSQL shell
docker compose exec postgres psql -U postgres -d smart_obd

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Check Docker disk usage
docker system df
```

---

✅ **Ready to go!** После установки Docker запусти `docker compose up -d postgres`
