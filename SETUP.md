# Quick Setup Guide

## Prerequisites Setup

### 1. Install Homebrew (macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js
```bash
# macOS with Homebrew
brew install node

# Verify installation
node --version    # Should show v16+ or higher
npm --version     # Should show v8+ or higher
```

### 3. Install Python
```bash
# macOS with Homebrew (if not already installed)
brew install python@3.13

# Verify installation
python3 --version # Should show Python 3.10+ or higher
pip3 --version    # Should show pip version
```

### 4. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

## Project Setup

### Automated Setup (Recommended)
```bash
cd grad_assist

# Make startup script executable
chmod +x start.sh

# Run complete setup and start application
./start.sh
```

### Manual Setup
```bash
cd grad_assist

# 1. Install Node.js dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 2. Setup Python environment
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# 3. Start Ollama and download model
brew services start ollama
ollama pull llama2  # ~3.8GB download

# 4. Create environment file
cat > server/.env << EOF
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
EOF

# 5. Start application
npm run dev
```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health
- **Ollama**: http://localhost:11434

## Quick Test
1. Open http://localhost:3000
2. Upload the provided `sample-data.csv`
3. Type: "Show me a bar chart comparing sales by region"
4. Click "Generate Graph"
5. Verify graph appears and can be downloaded

## Verification Commands
```bash
# Check all services are running
curl http://localhost:3000              # Frontend (HTML response)
curl http://localhost:5000/api/health   # Backend (JSON response)
curl http://localhost:11434/api/tags    # Ollama (Model list)

# Check versions
node --version      # Node.js version
python3 --version   # Python version
ollama --version    # Ollama version
ollama list         # Available AI models
```

## Troubleshooting

### Services Not Starting
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5000
lsof -i :11434

# Kill processes if needed
kill -9 <PID>
```

### Python Issues
```bash
# Recreate virtual environment
cd python-service
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Ollama Issues
```bash
# Check Ollama status
ollama list
brew services list | grep ollama

# Restart Ollama
brew services restart ollama
```

### Memory Issues
```bash
# Monitor system resources
top -o mem

# Try smaller AI model if needed
ollama pull llama2:7b-chat
```

## Project Structure
```
grad_assist/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── python-service/         # Python graph generation
│   └── venv/              # Python virtual environment
├── sample-data.csv         # Test data
├── start.sh               # Automated startup script
├── README.md              # Complete documentation
├── SETUP.md               # This file
├── DEPLOYMENT.md          # Production deployment guide
└── SYSTEM_REQUIREMENTS.md # Hardware/software requirements
```

## Development Tips
- Use `./start.sh` for fastest setup and testing
- Check `README.md` for complete documentation
- Review `SYSTEM_REQUIREMENTS.md` for detailed system info
- See `DEPLOYMENT.md` for production deployment

For any issues, ensure all prerequisites are installed and verify with the verification commands above.
