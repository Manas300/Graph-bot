# AI-Powered Graph Generator

A professional-grade web application that generates intelligent data visualizations from CSV and Excel files using natural language queries. Built with React, Node.js, Python, and powered by Ollama LLM.

## 🎯 Features

### Core Functionality
- **Smart File Upload**: Accepts only CSV and Excel files (.csv, .xls, .xlsx) with strict validation
- **Natural Language Processing**: Describe your visualization needs in plain English
- **AI-Powered Analysis**: Uses Ollama LLM to interpret queries and select optimal chart types
- **Multiple Chart Types**: Supports bar charts, line charts, scatter plots, pie charts, histograms, box plots, and heatmaps
- **Sandboxed Python Execution**: Graph generation happens in isolated Python environment
- **Professional UI**: Modern, responsive interface built with Material-UI

### Security & Performance
- File size limits (10MB maximum)
- Rate limiting and security headers
- Input validation and sanitization
- Error handling and graceful fallbacks
- Session-based processing

## 🏗️ Architecture

```
grad_assist/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── types.ts        # TypeScript definitions
│   │   └── App.tsx         # Main application
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   └── package.json
├── python-service/         # Python graph generation
│   ├── graph_generator.py  # Main graph generation logic
│   └── requirements.txt
└── package.json           # Root package manager
```

## 📋 Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - JavaScript runtime
2. **Python** (v3.10 - v3.13) - For graph generation
3. **Ollama** (for LLM functionality) - AI model server
4. **Homebrew** (macOS) - Package manager

### Step-by-Step Installation

#### 1. Install Homebrew (macOS only)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js
```bash
# macOS with Homebrew
brew install node

# Verify installation
node --version  # Should show v18+ or higher
npm --version   # Should show v8+ or higher
```

#### 3. Install Python
```bash
# macOS with Homebrew (if not already installed)
brew install python@3.13

# Verify installation
python3 --version  # Should show Python 3.10+ or higher
pip3 --version     # Should show pip version
```

#### 4. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

#### 5. Start Ollama and Install Model
```bash
# Start Ollama service
brew services start ollama
# OR run manually: ollama serve

# In another terminal, pull the LLM model (this may take a few minutes)
ollama pull llama2

# Verify model is available
ollama list
```

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies
```bash
# Navigate to project directory
cd grad_assist

# Install all dependencies (root, client, server)
npm install
cd client && npm install
cd ../server && npm install
cd ../python-service

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration
Create environment files:

**Server Configuration** (`server/.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Start Ollama Service
```bash
# Start Ollama service (if not already running)
brew services start ollama

# OR run manually in a separate terminal
ollama serve
```

### 4. Run the Application

#### Option A: Use the Startup Script (Recommended)
```bash
# Make the script executable (first time only)
chmod +x start.sh

# Run the application
./start.sh
```

#### Option B: Manual Startup
```bash
# Terminal 1 - Start Python virtual environment
cd python-service
source venv/bin/activate

# Terminal 2 - Development mode (starts both frontend and backend)
npm run dev

# Or run separately:
# Terminal 2 - Backend
npm run server

# Terminal 3 - Frontend  
npm run client
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ollama**: http://localhost:11434

## 🎮 Usage Guide

### Step 1: Upload Data File
- Click the upload area or drag & drop your file
- Supported formats: CSV, Excel (.xls, .xlsx)
- Maximum file size: 10MB
- File validation ensures only data files are accepted

### Step 2: Describe Your Visualization
Enter a natural language query describing what you want to visualize:

**Example Queries:**
- "Show me a bar chart comparing sales by category"
- "Create a line chart showing trends over time"
- "Display a pie chart of the distribution"
- "Generate a scatter plot to show correlation between price and quantity"
- "Make a histogram of customer ages"

### Step 3: View Generated Graph
- AI analyzes your data and query
- Generates appropriate visualization
- Download high-quality PNG image
- View data summary and insights

## 🔧 Technical Details

### Backend API Endpoints
- `GET /api/health` - Health check
- `POST /api/generate-graph` - Graph generation endpoint

### File Processing
- Automatic encoding detection for CSV files
- Excel sheet parsing with pandas
- Data type inference and column analysis
- Error handling for corrupted files

### AI Integration
- Ollama LLM for query interpretation
- Fallback logic when AI is unavailable
- Context-aware chart type selection
- Natural language understanding

### Graph Generation
- Matplotlib for high-quality static plots
- Seaborn for statistical visualizations
- Plotly for interactive charts
- Custom styling and theming

## 🛡️ Security Features

- **File Validation**: Strict MIME type and extension checking
- **Size Limits**: 10MB file size restriction
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js protection
- **Input Sanitization**: Query and file content validation
- **Sandboxed Execution**: Python subprocess isolation

## 🐛 Troubleshooting

### Common Issues

**1. Ollama Connection Error**
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
ollama serve
```

**2. Python Dependencies**
```bash
cd python-service
pip install -r requirements.txt
```

**3. File Upload Issues**
- Ensure file is CSV or Excel format
- Check file size (max 10MB)
- Verify file is not corrupted

**4. Graph Generation Fails**
- Check data has numeric columns for most chart types
- Ensure query is descriptive enough
- Try simpler chart types (bar chart, line chart)

### Error Logs
- Backend logs: Check terminal running `npm run server`
- Python logs: Check stderr output in server logs
- Frontend errors: Check browser developer console

## 📊 Supported Chart Types

| Chart Type | Best For | Requirements |
|------------|----------|--------------|
| Bar Chart | Comparing categories | Categorical + Numeric columns |
| Line Chart | Trends over time | Numeric columns or time series |
| Scatter Plot | Correlations | Two numeric columns |
| Pie Chart | Proportions/Distribution | Categorical data |
| Histogram | Frequency distribution | Single numeric column |
| Box Plot | Statistical distribution | Numeric columns |
| Heatmap | Correlation matrix | Multiple numeric columns |

## 🎯 Performance Optimizations

- **Frontend**: React optimization, lazy loading, memoization
- **Backend**: Express compression, efficient file handling
- **Python**: Matplotlib non-interactive backend, optimized pandas operations
- **Memory**: Automatic file cleanup, limited concurrent requests

## 📈 Future Enhancements

- [ ] Interactive Plotly charts
- [ ] Multiple file support
- [ ] Real-time collaboration
- [ ] Advanced statistical analysis
- [ ] Export to multiple formats
- [ ] Database integration
- [ ] User authentication
- [ ] Chart customization options

## 🤝 Contributing

This is an academic project. For improvements:
1. Fork the repository
2. Create feature branch
3. Submit pull request with detailed description

## 📝 License

MIT License - Built for academic purposes.

## 👥 Support

For issues or questions:
- Check troubleshooting section
- Review error logs
- Ensure all dependencies are installed
- Verify Ollama is running and accessible

---

**Built with ❤️ for data visualization and AI-powered insights**
