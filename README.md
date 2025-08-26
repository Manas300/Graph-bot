# Graph-bot

A web application for generating data visualizations from CSV and Excel files using natural language queries. Built with React, Node.js, Python, and integrated with Ollama for intelligent chart type selection.

## Video Demo
[![image](https://github.com/user-attachments/assets/3465b14a-942a-471b-8226-a93d7ab0e4da)]([https://www.youtube.com/watch?v=QqNw1UXzww0)

## Features

### Core Functionality
- File upload support for CSV and Excel formats (.csv, .xls, .xlsx)
- Natural language query processing for visualization requests
- Automated chart type selection based on data analysis
- Multiple visualization types: bar charts, line charts, scatter plots, pie charts, histograms, box plots, and heatmaps
- Responsive web interface with modern design

### Technical Capabilities
- File size validation (10MB maximum)
- Input sanitization and error handling
- Session-based request processing
- Fallback mechanisms for reliable operation

## Architecture

The application consists of three main components:

```
Graph-bot/
├── client/                 # React TypeScript frontend
├── server/                 # Node.js Express backend
├── python-service/         # Python graph generation service
└── k8s/                   # Kubernetes deployment configurations
```

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.10 - v3.13)
- Docker (for containerized deployment)
- Kubernetes cluster (for production deployment)
- Ollama (optional, for enhanced NLP capabilities)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Manas300/Graph-bot.git
cd Graph-bot
```

2. Install dependencies:
```bash
# Install Node.js dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Install Python dependencies
cd python-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

3. Start the services:
```bash
# Start all services with Docker Compose
docker-compose up --build

# Or start individually:
# Backend: npm run server
# Frontend: npm run client
# Python service: cd python-service && python http_server.py
```

### Kubernetes Deployment

For production deployment on Kubernetes:

1. Build Docker images:
```bash
docker build -t graph-bot-frontend:latest ./client
docker build -t graph-bot-backend:latest ./server
docker build -t graph-bot-python:latest ./python-service
```

2. Deploy to Kubernetes:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployments-multi-node.yaml
kubectl apply -f k8s/services.yaml
```

3. Access the application:
```bash
kubectl port-forward svc/frontend-lb 3000:80 -n graph-bot
```

### Kind (Local Kubernetes)

For local Kubernetes testing with Kind:

1. Create cluster:
```bash
kind create cluster --config kind-multi-node.yaml --name graph-bot
```

2. Run deployment script:
```bash
chmod +x k8s-start-multi-node.sh
./k8s-start-multi-node.sh
```

## Usage

1. **Upload Data File**: Select a CSV or Excel file containing your data
2. **Enter Query**: Describe the visualization you want in natural language
   - Example: "Show me a bar chart of Sales by Month"
   - Example: "Create a line chart showing trends over time"
3. **Generate Graph**: The system analyzes your data and creates the appropriate visualization
4. **Download Result**: Save the generated chart as a high-quality image

## API Endpoints

- `GET /api/health` - Service health check
- `POST /api/generate-graph` - Generate visualization from uploaded data and query

## Supported Chart Types

| Type | Description | Data Requirements |
|------|-------------|-------------------|
| Bar Chart | Compare categorical data | Categorical and numeric columns |
| Line Chart | Show trends over time | Time series or sequential data |
| Scatter Plot | Display correlations | Two numeric columns |
| Pie Chart | Show proportions | Categorical data with counts |
| Histogram | Show frequency distribution | Single numeric column |
| Box Plot | Display statistical distribution | Numeric data |
| Heatmap | Show correlation matrix | Multiple numeric columns |

## Configuration

### Environment Variables

**Server (.env)**:
```
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PYTHON_SERVICE_URL=http://localhost:8000
OLLAMA_HOST=localhost:11434
```

**Kubernetes ConfigMap**:
The application uses Kubernetes ConfigMaps for environment configuration in production deployments.

## Troubleshooting

### Common Issues

**File Upload Problems**:
- Verify file format is CSV or Excel
- Check file size is under 10MB
- Ensure file contains valid data

**Graph Generation Errors**:
- Confirm data has appropriate columns for requested chart type
- Try simpler queries if complex requests fail
- Check that numeric data exists for quantitative visualizations

**Service Connection Issues**:
- Verify all services are running
- Check network connectivity between components
- Review service logs for specific error messages

### Logging

- Frontend errors: Browser developer console
- Backend logs: Server terminal output
- Python service logs: Check container/service logs
- Kubernetes logs: `kubectl logs <pod-name> -n graph-bot`

## Development

### Project Structure

- `client/`: React TypeScript frontend with Material-UI components
- `server/`: Express.js backend with file upload and API routing
- `python-service/`: Flask service for data processing and visualization generation
- `k8s/`: Kubernetes manifests for production deployment

### Key Technologies

- **Frontend**: React, TypeScript, Material-UI, Axios
- **Backend**: Node.js, Express, Multer, CORS
- **Python Service**: Flask, Pandas, Matplotlib, Plotly, Seaborn
- **Infrastructure**: Docker, Kubernetes, Kind
- **AI Integration**: Ollama (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

