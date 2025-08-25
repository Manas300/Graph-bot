# System Requirements

## Hardware Requirements

### Minimum Requirements
- **CPU**: Intel i5 or AMD Ryzen 5 (or equivalent)
- **RAM**: 8GB (4GB for system, 2GB for Node.js, 2GB for Python/ML libraries)
- **Storage**: 5GB free space
- **Network**: Internet connection for package installation and Ollama model download

### Recommended Requirements
- **CPU**: Intel i7 or AMD Ryzen 7 (or Apple M1/M2)
- **RAM**: 16GB or more
- **Storage**: 10GB free space (for multiple Ollama models)
- **Network**: High-speed internet for faster model downloads

## Software Requirements

### Operating System Support
- **macOS**: 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent
- **Windows**: Windows 10 or later (with WSL2 recommended)

### Core Dependencies

#### 1. Node.js
- **Version**: 16.x or higher (tested with v24.6.0)
- **Package Manager**: npm 8.x or higher
- **Purpose**: Frontend React app and backend Express server

#### 2. Python
- **Version**: 3.10, 3.11, 3.12, or 3.13 (tested with 3.13.5)
- **Package Manager**: pip 20.x or higher
- **Purpose**: Graph generation, data processing, AI integration

#### 3. Ollama
- **Version**: 0.11.x or higher
- **Models**: llama2 (3.8GB download)
- **Purpose**: AI-powered query interpretation

### Package Managers

#### macOS (Recommended)
```bash
# Homebrew (required for easy installation)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install curl wget build-essential

# CentOS/RHEL
sudo yum install curl wget gcc-c++ make
```

#### Windows
```bash
# WSL2 (Windows Subsystem for Linux) recommended
# Or use Windows Package Manager (winget)
```

## Installation Verification

### Test Node.js Installation
```bash
node --version    # Should output: v16.x.x or higher
npm --version     # Should output: 8.x.x or higher
```

### Test Python Installation
```bash
python3 --version # Should output: Python 3.10.x or higher
pip3 --version    # Should output: pip 20.x.x or higher
```

### Test Ollama Installation
```bash
ollama --version  # Should output: ollama version 0.11.x
ollama list       # Should show available models after setup
```

## Network Requirements

### Ports Used
- **3000**: React frontend development server
- **5000**: Node.js backend API server
- **11434**: Ollama AI model server

### Firewall Configuration
```bash
# Allow local development ports (if needed)
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw allow 3000,5000,11434
# Windows: Windows Defender Firewall settings
```

### Internet Requirements
- **Initial Setup**: ~4GB download for Ollama llama2 model
- **Package Installation**: ~500MB for Node.js and Python dependencies
- **Runtime**: No internet required after setup (works offline)

## Development Environment

### Recommended Code Editors
- **Visual Studio Code** (with extensions: React, Python, JavaScript)
- **WebStorm/PyCharm** (JetBrains IDEs)
- **Sublime Text** with appropriate plugins

### Terminal Requirements
- **macOS**: Built-in Terminal or iTerm2
- **Linux**: Bash, Zsh, or Fish shell
- **Windows**: PowerShell, WSL2, or Git Bash

## Performance Considerations

### CPU Usage
- **Node.js**: Light usage for web server
- **Python**: Medium usage for graph generation
- **Ollama**: High usage during AI query processing

### Memory Usage
- **React Frontend**: ~200-400MB
- **Node.js Backend**: ~100-200MB
- **Python Service**: ~300-500MB
- **Ollama + Model**: ~2-4GB

### Storage Usage
```
Project Files:           ~50MB
Node.js Dependencies:   ~500MB
Python Dependencies:    ~200MB
Ollama Binary:          ~30MB
Ollama Models:         ~3.8GB (llama2)
Total:                 ~4.6GB
```

## Security Requirements

### File Permissions
```bash
# Ensure proper permissions for startup script
chmod +x start.sh

# Python virtual environment
chmod -R 755 python-service/venv/
```

### Network Security
- Application runs on localhost only by default
- No external network access required during runtime
- File uploads are validated and sandboxed

## Troubleshooting Common Issues

### Python Virtual Environment
```bash
# If pip fails with "externally managed environment"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Ollama Model Download
```bash
# If model download fails
ollama pull llama2 --verbose

# Alternative smaller model
ollama pull llama2:7b-chat
```

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5000
lsof -i :11434

# Kill processes if needed
kill -9 <PID>
```

### Memory Issues
```bash
# Monitor memory usage
top -o mem
htop (Linux)

# Close unnecessary applications
# Consider using smaller Ollama models
```

## Production Deployment (Optional)

### Additional Requirements for Production
- **Web Server**: Nginx or Apache
- **Process Manager**: PM2 for Node.js
- **SSL Certificate**: Let's Encrypt or commercial
- **Database**: Optional for user management
- **Monitoring**: Application performance monitoring

### Environment Variables for Production
```env
NODE_ENV=production
PORT=80
CLIENT_URL=https://yourdomain.com
OLLAMA_BASE_URL=http://localhost:11434
```

This system requirements document ensures your environment is properly configured for optimal performance of the AI-powered graph generation application.
