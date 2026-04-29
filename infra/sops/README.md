# Secrets Management (SOPS + age)

## Initial Setup (one time)

### 1. Install tools

```bash
# macOS
brew install sops age

# Linux
sudo apt install age
# SOPS: download from https://github.com/getsops/sops/releases
```

### 2. Generate age key

```bash
age-keygen -o ~/.config/sops/age/keys.txt
```

This outputs your **public key** (starts with `age1...`). Save it.

**BACKUP your private key** (`~/.config/sops/age/keys.txt`) — if you lose it, secrets are unrecoverable.

### 3. Configure SOPS

Edit `.sops.yaml` in this directory — replace `YOUR_AGE_PUBLIC_KEY_HERE` with your public key.

### 4. Create encrypted env file

```bash
# Create plaintext file (DO NOT commit this)
cp ../../.env.example prod.env

# Edit prod.env with real values, then encrypt:
sops --encrypt prod.env > prod.enc.env

# Delete plaintext
rm prod.env
```

## Daily Usage

### View secrets
```bash
sops --decrypt prod.enc.env
```

### Edit secrets
```bash
sops prod.enc.env
# Opens in $EDITOR, saves encrypted automatically
```

### Deploy secrets to server
```bash
sops --decrypt prod.enc.env | ssh root@<SERVER_IP> "cat > /opt/smart-obd/.env"
```

### Rotate / add new secret
```bash
sops prod.enc.env
# Add or change values, save, done
```

## How it works

- `prod.enc.env` — encrypted, safe to commit to git
- Only someone with the age private key can decrypt
- SOPS encrypts values but keeps keys visible (easy to diff)
- Git history shows what changed without exposing secrets

## Emergency: lost age key

If you lose your age key, secrets are gone. Generate a new key and re-create `prod.enc.env` from scratch (you'll need to re-enter all secrets).

Always keep a backup of `~/.config/sops/age/keys.txt` in a secure location (password manager, hardware key, encrypted USB).
