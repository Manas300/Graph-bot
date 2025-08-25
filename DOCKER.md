# 🐳 Docker Setup Guide - Graph Bot

## Overview

This project includes complete Docker containerization for all components:

- **Frontend (React)**: Nginx-served production build
- **Backend (Node.js)**: Express API server
- **Python Service**: AI-powered graph generation
- **Ollama**: Local LLM service

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 8GB RAM available for containers
- 10GB+ free disk space

## 🏗️ Built Docker Images

All images have been successfully built and tested:

```bash
graph-bot-frontend    latest    82.8MB
graph-bot-backend     latest    257MB
graph-bot-python      latest    5.28GB
```

## 🚀 Quick Start with Docker Compose

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ollama**: http://localhost:11434

### 3. Stop All Services
```bash
docker-compose down
```

### 4. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f python-service
docker-compose logs -f ollama
```

## 🛠️ Individual Container Commands

### Build Images
```bash
# Build all images
docker build -t graph-bot-frontend ./client
docker build -t graph-bot-backend ./server
docker build -t graph-bot-python ./python-service

# Or rebuild with docker-compose
docker-compose build
```

### Run Individual Containers

#### Frontend (React)
```bash
docker run -d -p 3000:80 \
  --name graph-bot-frontend \
  graph-bot-frontend:latest
```

#### Backend (Node.js)
```bash
docker run -d -p 5000:5000 \
  --name graph-bot-backend \
  -e NODE_ENV=production \
  -e PORT=5000 \
  graph-bot-backend:latest
```

#### Python Service
```bash
docker run -d \
  --name graph-bot-python \
  -e PYTHONPATH=/app \
  graph-bot-python:latest
```

#### Ollama (for LLM)
```bash
docker run -d -p 11434:11434 \
  --name ollama \
  -v ollama-data:/root/.ollama \
  ollama/ollama:latest
```

## 📁 Container Architecture

### Frontend Container (`graph-bot-frontend`)
- **Base**: `nginx:alpine`
- **Build Process**: Multi-stage build with Node.js 18
- **Ports**: 80 (nginx)
- **Features**: 
  - Production React build
  - Gzip compression
  - Health check endpoint
  - React Router support

### Backend Container (`graph-bot-backend`)
- **Base**: `node:18-alpine`
- **Ports**: 5000
- **Features**:
  - Production dependencies only
  - Non-root user security
  - Health check endpoint
  - Upload directory management

### Python Service Container (`graph-bot-python`)
- **Base**: `python:3.11-slim`
- **Size**: ~5.3GB (includes Ollama + ML libraries)
- **Features**:
  - Complete Python ML stack
  - Ollama installation
  - Non-root user security
  - Pre-installed dependencies

## 🔧 Configuration

### Environment Variables

#### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)

#### Backend
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Server port (default: 5000)
- `PYTHON_SERVICE_PATH`: Path to Python service
- `OLLAMA_HOST`: Ollama service URL

#### Python Service
- `PYTHONPATH`: Python module path
- `OLLAMA_HOST`: Ollama service URL

### Volumes

Docker Compose creates persistent volumes for:
- `uploads`: Shared file uploads between backend and Python service
- `graph-output`: Generated graph outputs
- `ollama-data`: Ollama model data (persistent across restarts)

## 🌐 Networking

All containers run on the `graph-network` bridge network:
- Frontend ↔ Backend: HTTP API calls
- Backend ↔ Python Service: Process spawning + file sharing
- Backend ↔ Ollama: HTTP API for LLM queries
- Python Service ↔ Ollama: HTTP API for query processing

## 🔍 Health Checks

### Built-in Health Checks
- **Backend**: `GET /api/health`
- **Frontend**: `GET /health`
- **Python Service**: Python import validation

### Manual Health Check
```bash
# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000/health

# Test Ollama
curl http://localhost:11434/api/version
```

## 🛡️ Security Features

- **Non-root users** in all containers
- **Minimal base images** (Alpine Linux)
- **Production-only dependencies**
- **Proper file permissions**
- **Network isolation**

## 📊 Resource Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 8GB (Ollama + ML libraries are memory-intensive)
- **Disk**: 10GB free space

### Recommended
- **CPU**: 4+ cores
- **RAM**: 16GB
- **Disk**: 20GB+ free space

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Kill conflicting processes
pkill -f "node.*index.js"
pkill -f "npm.*start"

# Check port usage
lsof -i :3000
lsof -i :5000
```

#### 2. Memory Issues
```bash
# Check Docker stats
docker stats

# Increase Docker memory in Docker Desktop settings
```

#### 3. Ollama Model Download
```bash
# Connect to Ollama container and pull model
docker exec -it ollama ollama pull llama2
```

#### 4. Volume Permissions
```bash
# Reset volumes
docker-compose down -v
docker volume prune
docker-compose up -d
```

### Container Logs
```bash
# Backend logs
docker logs graph-bot-backend

# Python service logs
docker logs graph-bot-python

# Ollama logs
docker logs ollama
```

## 🚀 Production Deployment

### Docker Compose Production
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Individual Container Deployment
```bash
# Deploy with restart policies
docker run -d --restart=unless-stopped \
  -p 3000:80 graph-bot-frontend:latest
```

## 📝 Development vs Production

### Development (Current Setup)
- All services in docker-compose
- Volume mounts for live code updates
- Debug logging enabled

### Production Considerations
- Use separate databases
- Implement proper secrets management
- Add load balancing
- Set up monitoring and logging
- Use registry for image distribution

## 🎯 Next Steps for Kubernetes

When ready for Kubernetes deployment:

1. **Push images to registry**:
   ```bash
   docker tag graph-bot-frontend:latest your-registry/graph-bot-frontend:v1.0
   docker push your-registry/graph-bot-frontend:v1.0
   ```

2. **Create K8s manifests** for:
   - Deployments (frontend, backend, python-service)
   - Services (ClusterIP, LoadBalancer)
   - ConfigMaps and Secrets
   - Persistent Volume Claims
   - Ingress for external access

3. **Consider Helm charts** for easier deployment management

Your Docker setup is now complete and ready for both local development and production deployment! 🎉
