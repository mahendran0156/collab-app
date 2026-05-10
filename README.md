# 🤝 COLLAB Platform

> A full-stack MERN collaboration platform for designers, musicians, developers and social media creators — deployed on Azure via Helm + AKS.

---

## 📦 Project Structure

```
collab-app/
├── frontend/               # React 18 + Three.js 3D UI
│   ├── src/
│   │   ├── components/     # Navbar, ProjectCard, Scene3D
│   │   ├── pages/          # Home, Projects, Dashboard, Explore...
│   │   ├── context/        # AuthContext (JWT)
│   │   └── styles/         # global.css (Orbitron + Rajdhani fonts)
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # Node.js + Express REST API
│   ├── models/             # User, Project, Message (Mongoose)
│   ├── routes/             # /api/auth, /projects, /users, /messages
│   ├── middleware/         # JWT auth guard
│   └── server.js           # Express + Socket.IO server
├── helm/                   # Kubernetes Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/          # Deployments, Services, Ingress, HPA
├── azure-pipelines.yml     # CI/CD pipeline
└── docker-compose.yml      # Local dev stack
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker & Docker Compose

### Option A — Docker Compose (recommended)
```bash
# Clone and start
git clone https://dev.azure.com/your-org/collab
cd collab-app
cp backend/.env.example backend/.env
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Option B — Manual
```bash
# Backend
cd backend
cp .env.example .env        # Set MONGO_URI, JWT_SECRET
npm install
npm run dev                 # Starts on :5000

# Frontend (new terminal)
cd frontend
cp .env.example .env        # Set REACT_APP_API_URL
npm install
npm start                   # Starts on :3000
```

---

## 🎯 Feature Walkthrough

| Feature | Description |
|---|---|
| 3D Hero Scene | React Three Fiber canvas with floating orbs, particle fields, stars |
| Auth | JWT register/login, protected routes |
| Projects | Create, browse, filter by category/status, search |
| Collaboration | Join projects, real-time updates via Socket.IO |
| Reviews | Rate and comment on projects |
| Like System | Like/unlike any project |
| Explore | Browse all creators by field |
| Dashboard | Personal stats, owned projects |

---

## 🏗️ Architecture

```
[Browser]
    │
    ▼
[React Frontend — 3D UI]
    │ HTTP + Socket.IO
    ▼
[Express API :5000]
    │
    ├── /api/auth     → JWT register/login
    ├── /api/projects → CRUD + join + review + like
    ├── /api/users    → profile, explore
    └── /api/messages → project chat
    │
    ▼
[MongoDB :27017]
  ├── users
  ├── projects
  └── messages
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in, receive JWT |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/projects | No | List/filter projects |
| POST | /api/projects | Yes | Create project |
| GET | /api/projects/:id | No | Get project detail |
| POST | /api/projects/:id/join | Yes | Join as collaborator |
| POST | /api/projects/:id/review | Yes | Add review |
| POST | /api/projects/:id/like | Yes | Toggle like |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/users/profile | Yes | Get own profile |
| PUT | /api/users/profile | Yes | Update profile |
| GET | /api/users | No | List all creators |

---

## ☁️ Azure DevOps Setup

### 1. Create Azure Resources
```bash
# Resource Group
az group create --name collab-rg --location eastus

# Container Registry
az acr create --name yourCollabACR --resource-group collab-rg --sku Basic

# AKS Cluster
az aks create \
  --resource-group collab-rg \
  --name collab-aks \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr yourCollabACR
```

### 2. Create Azure DevOps Project
1. Go to https://dev.azure.com
2. Create new Organization → New Project → "Collab"
3. Repos → Import → your Git repo
4. Pipelines → New Pipeline → YAML → select `azure-pipelines.yml`

### 3. Create Service Connection
- Project Settings → Service Connections → Azure Resource Manager
- Name it `Azure-Service-Connection`
- Select your subscription

### 4. Update Pipeline Variables
Edit `azure-pipelines.yml` and set:
```yaml
ACR_NAME: 'yourCollabACR'
ACR_LOGIN_SERVER: 'yourcollabacr.azurecr.io'
AKS_CLUSTER: 'collab-aks'
RESOURCE_GROUP: 'collab-rg'
```

---

## ⚓ Helm Chart Guide

### Installing Helm
```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows (Chocolatey)
choco install kubernetes-helm
```

### Configure values.yaml
Edit `helm/values.yaml`:
```yaml
backend:
  image:
    repository: yourcollabacr.azurecr.io/collab-backend
    tag: latest

frontend:
  image:
    repository: yourcollabacr.azurecr.io/collab-frontend
    tag: latest

ingress:
  host: collab.yourdomain.com
```

### Manual Helm Deploy
```bash
# Get AKS credentials
az aks get-credentials --resource-group collab-rg --name collab-aks

# Install / upgrade
helm upgrade --install collab ./helm \
  --namespace collab \
  --create-namespace \
  --set backend.image.tag=latest \
  --set frontend.image.tag=latest \
  --wait

# Check status
helm status collab -n collab
kubectl get pods -n collab
kubectl get ingress -n collab
```

### Useful Helm Commands
```bash
helm list -n collab                      # List releases
helm history collab -n collab            # Rollout history
helm rollback collab 1 -n collab         # Rollback to version 1
helm uninstall collab -n collab          # Remove deployment
helm lint ./helm                         # Validate chart
helm template collab ./helm              # Preview manifests
```

---

## 🔒 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabdb
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📊 Summary

**Tech Stack:**
- Frontend: React 18, React Three Fiber, Three.js, Framer Motion, React Router 6, Socket.IO client
- Backend: Node.js, Express.js, Mongoose, JWT, Socket.IO, bcryptjs
- Database: MongoDB 6.0
- DevOps: Azure DevOps, Azure Container Registry, Azure Kubernetes Service
- Deploy: Docker, Helm 3, Kubernetes, Nginx Ingress

**How it was built:**
The platform follows a clean separation of concerns — the React frontend handles all UI including the immersive 3D Three.js canvas, while the Express backend exposes a RESTful API with JWT authentication. MongoDB stores users, projects, and messages as flexible documents. Socket.IO enables real-time collab updates. The entire stack is containerized with Docker, shipped via ACR, and orchestrated on AKS using a Helm chart with configurable values for different environments.
# collab-app
