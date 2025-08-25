const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

// File filter to only accept CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Graph generation endpoint
app.post('/api/generate-graph', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.body.query) {
      return res.status(400).json({ error: 'No query provided' });
    }

    const { query } = req.body;
    const filePath = req.file.path;
    const sessionId = uuidv4();

    console.log(`Processing request ${sessionId}: Query="${query}", File="${req.file.originalname}"`);

    // Call Python service via HTTP (microservice communication)
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath), {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      formData.append('query', query);
      formData.append('session_id', sessionId);

      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
      
      console.log(`Calling Python service at ${pythonServiceUrl}/generate-graph`);
      
      const response = await axios.post(`${pythonServiceUrl}/generate-graph`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 300000, // 5 minutes
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Clean up uploaded file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      res.json(response.data);
      
    } catch (httpError) {
      // Clean up uploaded file on error
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      console.error('Error calling Python service:', httpError.message);
      
      if (httpError.response) {
        // Python service returned an error response
        console.error('Python service error response:', httpError.response.data);
        res.status(httpError.response.status).json(httpError.response.data);
      } else if (httpError.code === 'ECONNREFUSED') {
        console.error('Cannot connect to Python service');
        res.status(503).json({ error: 'Graph generation service unavailable' });
      } else {
        console.error('Request error:', httpError);
        res.status(500).json({ error: 'Failed to start graph generation service' });
      }
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
    }
  }
  
  if (error.message === 'Only CSV and Excel files are allowed!') {
    return res.status(400).json({ error: 'Only CSV and Excel files are allowed!' });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
