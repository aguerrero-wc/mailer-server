# Deployment & Containerization Strategy

## 🛑 Golden Rule: "Host is for Docker, Container is for Code"
**ABSOLUTELY NO** development commands (`npm install`, `npm run build`, `node main.js`) shall be executed directly on the host machine. The host environment is considered "dirty" and inconsistent.

## 1. Architecture Infrastructure
- **Orchestrator:** Docker Compose (V2).
- **Container Runtime:** Docker Engine.
- **Base Image:** `node:22-bookworm-slim` (Consistent across Dev and Prod).

## 2. Developer Workflow
All interactions happen via `docker compose`.

### Start Development Environment
Opens port `3001` (mapped to internal `3000`) with Hot-Reload and mapped volumes.
```bash
docker compose --profile dev up --build

If you need to run specific commands (like generating a resource or installing a package):
docker compose --profile dev exec app-dev sh

View Logs
docker compose --profile dev logs -f app-dev

### Production Deployment
Strategy: Rolling Update.
Profile: prod (Optimized, no dev-dependencies, read-only root where possible).
Network: Isolated bridge network secure_mail_network.
Command for Prod
docker compose --profile prod up -d --build