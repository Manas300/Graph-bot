#!/bin/bash

echo "🚀 AI-Powered Graph Generator Startup Script"
echo "============================================="
echo "Version: 1.0.0"
echo "Date: $(date)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js:"
    echo "  macOS: brew install node"
    echo "  Or download from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
print_status "Node.js found: $NODE_VERSION"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    echo "Please install Python 3:"
    echo "  macOS: brew install python@3.13"
    echo "  Or download from: https://python.org/"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_status "Python found: $PYTHON_VERSION"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    print_error "Ollama is not installed"
    echo "Please install Ollama:"
    echo "  macOS: brew install ollama"
    echo "  Linux: curl -fsSL https://ollama.ai/install.sh | sh"
    echo "  Windows: Download from https://ollama.ai/download"
    exit 1
fi
OLLAMA_VERSION=$(ollama --version)
print_status "Ollama found: $OLLAMA_VERSION"

echo ""

# Check if Node.js dependencies are installed
echo "Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
    print_warning "Node.js dependencies not found. Installing..."
    echo "Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install root dependencies"
        exit 1
    fi
    
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
    if [ $? -ne 0 ]; then
        print_error "Failed to install client dependencies"
        exit 1
    fi
    
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
    if [ $? -ne 0 ]; then
        print_error "Failed to install server dependencies"
        exit 1
    fi
    
    print_status "Node.js dependencies installed"
else
    print_status "Node.js dependencies found"
fi

# Check Python virtual environment and dependencies
if [ ! -d "python-service/venv" ]; then
    print_warning "Python virtual environment not found. Creating..."
    cd python-service
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create Python virtual environment"
        exit 1
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    cd ..
    print_status "Python environment created and dependencies installed"
else
    print_status "Python virtual environment found"
fi

echo ""

# Check if Ollama is running
echo "Checking Ollama service..."
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    print_warning "Ollama service not running. Starting..."
    brew services start ollama 2>/dev/null || ollama serve &
    OLLAMA_PID=$!
    
    # Wait for Ollama to start
    echo "Waiting for Ollama to start..."
    for i in {1..10}; do
        if curl -s http://localhost:11434/api/tags &> /dev/null; then
            break
        fi
        sleep 2
        echo "  Waiting... ($i/10)"
    done
    
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        print_error "Failed to start Ollama service"
        exit 1
    fi
    print_status "Ollama service started"
else
    print_status "Ollama service is running"
fi

# Check if llama2 model is available
echo "Checking AI model..."
if ! ollama list | grep -q "llama2"; then
    print_warning "llama2 model not found. Downloading (this may take several minutes)..."
    print_info "Model size: ~3.8GB - Please be patient"
    ollama pull llama2
    if [ $? -ne 0 ]; then
        print_error "Failed to download llama2 model"
        echo "You can try a smaller model: ollama pull llama2:7b-chat"
        exit 1
    fi
    print_status "llama2 model downloaded"
else
    print_status "llama2 model available"
fi

echo ""

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    print_info "Creating environment configuration..."
    cat > server/.env << EOF
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
EOF
    print_status "Environment configuration created"
else
    print_status "Environment configuration found"
fi

echo ""
echo "🌟 Starting the application..."
echo ""
echo "📱 Application URLs:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:5000"
echo "   🤖 Ollama:    http://localhost:11434"
echo ""
echo "📊 Sample data file: sample-data.csv"
echo "💡 Example queries:"
echo "   • 'Show me a bar chart comparing sales by region'"
echo "   • 'Create a line chart showing trends over time'"
echo "   • 'Display a pie chart of the distribution'"
echo ""
echo "Press Ctrl+C to stop all services"
echo "============================================="
echo ""

# Activate Python virtual environment for the session
cd python-service && source venv/bin/activate && cd ..

# Start the application
npm run dev
