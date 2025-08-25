# Deployment Guide

## Quick Development Setup

### Prerequisites Check
Run this command to verify all prerequisites are installed:
```bash
# Check Node.js
node --version    # Should be v16+ or higher
npm --version     # Should be v8+ or higher

# Check Python
python3 --version # Should be Python 3.10+ or higher
pip3 --version    # Should be pip 20+ or higher

# Check Ollama
ollama --version  # Should be 0.11+ or higher
```

### One-Command Setup
For the fastest setup, use our automated script:
```bash
# Make script executable
chmod +x start.sh

# Run the complete setup and startup
./start.sh
```

### Manual Setup (Step by Step)

#### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..

# Backend dependencies
cd server
npm install
cd ..

# Python dependencies
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

#### 2. Start Ollama Service
```bash
# Start Ollama (choose one method)
brew services start ollama    # macOS background service
# OR
ollama serve                  # Manual foreground process

# Download AI model (required first time)
ollama pull llama2           # ~3.8GB download
```

#### 3. Environment Configuration
Create `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
```

#### 4. Start Application
```bash
# Development mode (recommended)
npm run dev

# OR start services separately:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

## Testing the Application

### 1. Verify Services are Running
```bash
# Check if all services are accessible
curl http://localhost:3000     # Frontend (should get HTML)
curl http://localhost:5000/api/health  # Backend (should return {"status":"OK"})
curl http://localhost:11434/api/tags   # Ollama (should return model list)
```

### 2. Test File Upload
1. Open http://localhost:3000
2. Upload the provided `sample-data.csv`
3. Enter query: "Show me a bar chart comparing sales by region"
4. Click "Generate Graph"
5. Verify graph appears and can be downloaded

### 3. Test Different Chart Types
Try these sample queries with `sample-data.csv`:
```
"Create a line chart showing sales trends over time"
"Display a pie chart of customer distribution by region"
"Generate a scatter plot of marketing spend vs sales"
"Show me a histogram of sales values"
```

## Production Deployment

### Environment Variables
```env
# Production settings
NODE_ENV=production
PORT=80
CLIENT_URL=https://yourdomain.com
OLLAMA_BASE_URL=http://localhost:11434

# Security settings
SESSION_SECRET=your-secret-key-here
CORS_ORIGIN=https://yourdomain.com
```

### Build for Production
```bash
# Build frontend
cd client
npm run build
cd ..

# The built files will be in client/build/
# Serve these with nginx or apache
```

### Process Management
```bash
# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
cd server
pm2 start index.js --name "graph-generator-api"

# Start Ollama with PM2
pm2 start "ollama serve" --name "ollama-service"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/grad_assist/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using the port
lsof -i :3000
lsof -i :5000
lsof -i :11434

# Kill the process
kill -9 <PID>
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
cd python-service
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Ollama Model Issues
```bash
# Check available models
ollama list

# Re-download model if corrupted
ollama rm llama2
ollama pull llama2

# Try smaller model if memory is limited
ollama pull llama2:7b-chat
```

#### Memory Issues
```bash
# Monitor memory usage
top -o mem

# Reduce Ollama memory usage
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
```

#### File Upload Issues
- Ensure file is CSV or Excel format
- Check file size (max 10MB)
- Verify file encoding (UTF-8 preferred)
- Try different sample data files

### Performance Optimization

#### Frontend
```bash
# Optimize build
cd client
npm run build
# Serve with compression enabled
```

#### Backend
```bash
# Use production Node.js optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### Python Service
```bash
# Use optimized Python settings
export PYTHONOPTIMIZE=1
export PYTHONDONTWRITEBYTECODE=1
```

### Logs and Debugging

#### View Logs
```bash
# Node.js backend logs
npm run server 2>&1 | tee backend.log

# Python service logs (check stderr in backend logs)
# Frontend logs (browser console)

# Ollama logs
ollama logs
```

#### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
npm run dev
```

## Security Considerations

### File Upload Security
- Only CSV and Excel files accepted
- File size limited to 10MB
- Files processed in sandboxed environment
- Temporary files cleaned up automatically

### API Security
- Rate limiting enabled (100 requests per 15 minutes)
- CORS configured for frontend domain only
- Input validation on all endpoints
- Error messages sanitized

### Production Security
- Use HTTPS in production
- Set secure environment variables
- Regular security updates
- Monitor for vulnerabilities

## Monitoring and Maintenance

### Health Checks
```bash
# Automated health check script
curl -f http://localhost:5000/api/health || exit 1
```

### Backup Considerations
- No persistent data stored (stateless application)
- Environment files should be backed up
- Ollama models can be re-downloaded if needed

### Updates
```bash
# Update Node.js dependencies
npm update
cd client && npm update && cd ..
cd server && npm update && cd ..

# Update Python dependencies
cd python-service
source venv/bin/activate
pip list --outdated
pip install -r requirements.txt --upgrade
```

This deployment guide ensures your AI-powered graph generation application runs smoothly in both development and production environments.
