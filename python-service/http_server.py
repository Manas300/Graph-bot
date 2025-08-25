#!/usr/bin/env python3
"""
HTTP Server wrapper for the Graph Generator Python Service
Allows the Python service to run as a microservice in Docker
"""

import os
import sys
import json
import tempfile
import shutil
from pathlib import Path
from flask import Flask, request, jsonify
import subprocess
import logging

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create necessary directories
# Use local paths for development, Docker paths for production
if os.path.exists("/app"):
    UPLOAD_DIR = Path("/app/uploads")
    OUTPUT_DIR = Path("/app/output")
else:
    # Local development paths
    UPLOAD_DIR = Path("./uploads")
    OUTPUT_DIR = Path("./output")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "python-graph-generator"})

@app.route('/generate-graph', methods=['POST'])
def generate_graph():
    """
    Generate graph endpoint
    Expects:
    - file: CSV/Excel file (multipart upload)
    - query: Text query for graph generation
    - session_id: Session identifier
    """
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        if 'query' not in request.form:
            return jsonify({"error": "No query provided"}), 400
            
        if 'session_id' not in request.form:
            return jsonify({"error": "No session_id provided"}), 400

        file = request.files['file']
        query = request.form['query']
        session_id = request.form['session_id']

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Save uploaded file
        file_path = UPLOAD_DIR / f"{session_id}_{file.filename}"
        file.save(str(file_path))
        
        logger.info(f"Processing request - Session: {session_id}, Query: '{query}', File: {file.filename}")

        # Call the original graph_generator.py script
        try:
            # Use local path for development, Docker path for production
            script_path = "/app/graph_generator.py" if os.path.exists("/app") else "./graph_generator.py"
            
            result = subprocess.run([
                sys.executable, 
                script_path,
                str(file_path),
                query,
                session_id
            ], capture_output=True, text=True, timeout=300)  # 5 minute timeout
            
            if result.returncode == 0:
                # Parse the output (should be JSON)
                try:
                    response_data = json.loads(result.stdout.strip())
                    logger.info(f"Graph generation successful for session {session_id}")
                    return jsonify(response_data)
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON output from graph_generator: {result.stdout}")
                    return jsonify({
                        "error": "Invalid response from graph generator",
                        "output": result.stdout,
                        "stderr": result.stderr
                    }), 500
            else:
                logger.error(f"Graph generation failed for session {session_id}: {result.stderr}")
                return jsonify({
                    "error": "Graph generation failed",
                    "details": result.stderr,
                    "output": result.stdout
                }), 500
                
        except subprocess.TimeoutExpired:
            logger.error(f"Graph generation timed out for session {session_id}")
            return jsonify({"error": "Graph generation timed out"}), 500
        except Exception as e:
            logger.error(f"Error running graph generator: {str(e)}")
            return jsonify({"error": f"Internal error: {str(e)}"}), 500
        
    except Exception as e:
        logger.error(f"Request processing error: {str(e)}")
        return jsonify({"error": f"Request processing failed: {str(e)}"}), 500
    
    finally:
        # Clean up uploaded file
        try:
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
        except Exception as e:
            logger.warning(f"Failed to clean up file {file_path}: {e}")

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to verify service is working"""
    try:
        # Test Python imports
        import pandas as pd
        import matplotlib
        import plotly
        import requests
        
        return jsonify({
            "status": "success",
            "message": "Python service is working",
            "libraries": {
                "pandas": pd.__version__,
                "matplotlib": matplotlib.__version__,
                "plotly": plotly.__version__,
                "requests": requests.__version__
            },
            "directories": {
                "uploads": str(UPLOAD_DIR),
                "output": str(OUTPUT_DIR),
                "upload_exists": UPLOAD_DIR.exists(),
                "output_exists": OUTPUT_DIR.exists()
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Service test failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    logger.info("Starting Python Graph Generator HTTP Service")
    logger.info(f"Upload directory: {UPLOAD_DIR}")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8000, debug=False)
