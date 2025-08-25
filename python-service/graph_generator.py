#!/usr/bin/env python3

import sys
import json
import pandas as pd
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
import seaborn as sns
import numpy as np
import base64
import io
import requests
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set matplotlib to use non-interactive backend
plt.switch_backend('Agg')

class GraphGenerator:
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url
        self.supported_formats = ['csv', 'xlsx', 'xls']
        
    def load_data(self, file_path):
        """Load data from CSV or Excel file"""
        try:
            file_extension = Path(file_path).suffix.lower()
            
            if file_extension == '.csv':
                # Try different encodings for CSV
                encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
                for encoding in encodings:
                    try:
                        df = pd.read_csv(file_path, encoding=encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                else:
                    raise ValueError("Could not decode CSV file with any supported encoding")
                    
            elif file_extension in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
            if df.empty:
                raise ValueError("The uploaded file is empty")
                
            return df
            
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")
    
    def query_ollama(self, prompt):
        """Query Ollama LLM for graph type and parameters"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": "llama2",  # You can change this to your preferred model
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('response', '')
            else:
                return self.fallback_analysis(prompt)
                
        except Exception as e:
            print(f"Ollama query failed: {e}", file=sys.stderr)
            return self.fallback_analysis(prompt)
    
    def fallback_analysis(self, query):
        """Fallback analysis when Ollama is not available"""
        query_lower = query.lower()
        
        # Simple keyword-based analysis
        if any(word in query_lower for word in ['line', 'trend', 'time', 'over time']):
            return "line_chart"
        elif any(word in query_lower for word in ['bar', 'column', 'compare', 'comparison']):
            return "bar_chart"
        elif any(word in query_lower for word in ['scatter', 'correlation', 'relationship']):
            return "scatter_plot"
        elif any(word in query_lower for word in ['pie', 'proportion', 'percentage', 'distribution']):
            return "pie_chart"
        elif any(word in query_lower for word in ['histogram', 'frequency', 'bins']):
            return "histogram"
        elif any(word in query_lower for word in ['box', 'boxplot', 'quartile']):
            return "box_plot"
        elif any(word in query_lower for word in ['heatmap', 'correlation matrix']):
            return "heatmap"
        else:
            return "bar_chart"  # Default
    
    def validate_data_quality(self, df):
        """Validate data quality and return issues if any"""
        issues = []
        suggestions = []
        
        # Check for empty dataset
        if df.empty:
            return {
                "is_valid": False,
                "message": "Your file appears to be empty or contains no readable data.",
                "suggestions": ["Please check that your CSV/Excel file contains data", "Ensure the file is not corrupted"],
                "issues": ["Empty dataset"]
            }
        
        # Check for too few rows
        if len(df) < 2:
            issues.append("Dataset has only 1 row")
            suggestions.append("Add more data rows for meaningful visualization")
        
        # Check for columns with mixed data types (strings in numeric columns)
        numeric_issues = []
        for col in df.columns:
            if df[col].dtype == 'object':  # String column
                # Try to convert to numeric and see if there are conversion issues
                numeric_converted = pd.to_numeric(df[col], errors='coerce')
                non_numeric_count = numeric_converted.isna().sum() - df[col].isna().sum()
                
                if non_numeric_count > 0 and non_numeric_count < len(df) * 0.8:  # Mixed data
                    numeric_issues.append({
                        "column": col,
                        "non_numeric_count": non_numeric_count,
                        "total_count": len(df),
                        "examples": df[col][pd.to_numeric(df[col], errors='coerce').isna() & df[col].notna()].head(3).tolist()
                    })
        
        if numeric_issues:
            issue_details = []
            for issue in numeric_issues:
                examples_str = ", ".join([f"'{ex}'" for ex in issue["examples"][:2]])
                issue_details.append(f"Column '{issue['column']}' has {issue['non_numeric_count']} non-numeric values (e.g., {examples_str})")
            
            return {
                "is_valid": False,
                "message": f"Data quality issue detected: Some columns contain mixed data types.",
                "suggestions": [
                    "Clean your data by removing or fixing non-numeric values in numeric columns",
                    "Use consistent data types within each column",
                    "Consider using text columns for categorical data and numeric columns for measurements"
                ],
                "issues": issue_details,
                "data_summary": {
                    "total_rows": len(df),
                    "total_columns": len(df.columns),
                    "columns_with_issues": [issue["column"] for issue in numeric_issues]
                }
            }
        
        # Check for columns with all missing values
        empty_columns = [col for col in df.columns if df[col].isna().all()]
        if empty_columns:
            issues.append(f"Columns with no data: {', '.join(empty_columns)}")
            suggestions.append("Remove empty columns or add data to them")
        
        # Check for extremely high missing data percentage
        high_missing_cols = []
        for col in df.columns:
            missing_pct = (df[col].isna().sum() / len(df)) * 100
            if missing_pct > 70:
                high_missing_cols.append(f"{col} ({missing_pct:.1f}% missing)")
        
        if high_missing_cols:
            issues.append(f"High missing data in: {', '.join(high_missing_cols)}")
            suggestions.append("Consider filling missing values or removing columns with excessive missing data")
        
        # If there are non-critical issues, warn but allow processing
        if issues and not numeric_issues:
            return {
                "is_valid": True,
                "has_warnings": True,
                "message": f"Data quality warnings detected: {'; '.join(issues)}",
                "suggestions": suggestions,
                "issues": issues
            }
        
        # Data looks good
        return {"is_valid": True, "message": "Data quality looks good!"}

    def validate_and_analyze_query(self, query, df):
        """Validate query and provide intelligent suggestions"""
        data_info = f"""
        Data shape: {df.shape}
        Columns: {list(df.columns)}
        Data types: {df.dtypes.to_dict()}
        Numeric columns: {df.select_dtypes(include=[np.number]).columns.tolist()}
        Categorical columns: {df.select_dtypes(include=['object']).columns.tolist()}
        Sample data (first 3 rows):
        {df.head(3).to_string()}
        """
        
        validation_prompt = f"""
        You are a helpful data visualization assistant. Analyze the user's query and data to provide guidance.
        
        User Query: "{query}"
        
        Dataset Information:
        {data_info}
        
        Available chart types: bar chart, line chart, scatter plot, pie chart, histogram, box plot, heatmap
        
        Please respond in JSON format with:
        {{
            "is_valid": true/false,
            "chart_type": "recommended_chart_type",
            "message": "helpful message to user",
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
        }}
        
        Rules:
        1. If query mentions a valid chart type (bar, line, scatter, pie, histogram, box, heatmap), mark as valid
        2. If query is unclear or mentions invalid chart types, mark as invalid and provide helpful suggestions
        3. Base suggestions on the actual data columns available
        4. Be conversational and helpful in your message
        """
        
        try:
            response = self.query_ollama(validation_prompt)
            # Try to parse JSON response
            import json
            # Clean the response to extract JSON
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback validation
        return self.fallback_validation(query, df)
    
    def fallback_validation(self, query, df):
        """Fallback validation when LLM fails"""
        query_lower = query.lower().strip()
        
        # Handle edge cases first
        edge_case_result = self.handle_query_edge_cases(query_lower, df)
        if edge_case_result:
            return edge_case_result
        
        # Check for valid chart types
        found_chart_type = self.detect_explicit_chart_type(query_lower)
        if found_chart_type:
            chart_type_name = found_chart_type.replace('_', ' ')
            return {
                "is_valid": True,
                "chart_type": found_chart_type,
                "message": f"Great! I'll create a {chart_type_name} for you.",
                "suggestions": []
            }
        else:
            # Default suggestions when no specific chart type is found
            return self.provide_intelligent_suggestions(query, df)

    def handle_query_edge_cases(self, query_lower, df):
        """Handle various edge cases in user queries"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Case 1: Very vague queries
        vague_patterns = [
            'any graph', 'any chart', 'any plot', 'some graph', 'some chart',
            'generate graph', 'create graph', 'make graph', 'show graph',
            'visualize', 'plot data', 'chart data', 'graph data',
            'something', 'anything', 'whatever', 'just show me', 'display'
        ]
        
        if any(pattern in query_lower for pattern in vague_patterns):
            suggestions = []
            if len(categorical_cols) > 0 and len(numeric_cols) > 0:
                suggestions.append(f"Show me a bar chart of {numeric_cols[0]} by {categorical_cols[0]}")
                suggestions.append(f"Create a pie chart showing {categorical_cols[0]} distribution")
            if len(numeric_cols) >= 2:
                suggestions.append(f"Make a scatter plot of {numeric_cols[0]} vs {numeric_cols[1]}")
                suggestions.append(f"Create a line chart showing {numeric_cols[0]} trends")
            if len(numeric_cols) >= 1:
                suggestions.append(f"Show a histogram of {numeric_cols[0]} distribution")
            
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "I'd be happy to help! Since you want 'any graph', here are some great options based on your data:",
                "suggestions": suggestions[:4] if suggestions else [
                    "Please be more specific about what you'd like to visualize",
                    "Try: 'Show me a bar chart of sales by region'",
                    "Or: 'Create a line chart showing trends over time'"
                ]
            }
        
        # Case 2: Empty or very short queries
        if len(query_lower) <= 2:
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "Your query seems too short. Please tell me what kind of graph you'd like to see!",
                "suggestions": [
                    "Try: 'Show me a bar chart comparing values'",
                    "Or: 'Create a line chart showing trends'",
                    "Be specific: 'Make a pie chart of categories'"
                ]
            }
        
        # Case 3: Only contains numbers or special characters
        if query_lower.replace(' ', '').isdigit() or not any(c.isalpha() for c in query_lower):
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "I need a text description of what you want to visualize. Numbers alone won't help me understand!",
                "suggestions": [
                    f"Try: 'Show {numeric_cols[0] if numeric_cols else 'values'} in a bar chart'",
                    "Describe what you want to see, like 'compare sales by region'",
                    "Use words to tell me about your visualization goal"
                ]
            }
        
        # Case 4: Questions without clear visualization intent
        question_patterns = ['what', 'how', 'why', 'when', 'where', 'who']
        if any(query_lower.startswith(q) for q in question_patterns) and not any(chart in query_lower for chart in ['chart', 'graph', 'plot', 'show', 'visualize']):
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "I can help you visualize data! Try rephrasing your question to specify what kind of chart you'd like.",
                "suggestions": [
                    f"Instead of '{query_lower[:30]}...', try: 'Show me a bar chart of...'",
                    "Add words like 'chart', 'graph', or 'plot' to your request",
                    "Be specific about the visualization type you want"
                ]
            }
        
        # Case 5: Nonsensical or random text (lots of repeated characters or gibberish)
        if (len(set(query_lower.replace(' ', ''))) < 4 and len(query_lower) > 10) or \
           (len([word for word in query_lower.split() if len(word) > 2 and word.isalpha()]) == 0):
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "I couldn't understand your request. Please use clear words to describe what you want to visualize!",
                "suggestions": [
                    "Use simple English like 'show me a bar chart'",
                    "Describe your data visualization goal clearly",
                    "Try: 'Create a graph showing...' followed by what you want to see"
                ]
            }
        
        # Case 6: Greetings or conversational text without visualization intent
        greeting_patterns = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you']
        if any(pattern in query_lower for pattern in greeting_patterns) and len(query_lower.split()) <= 3:
            return {
                "is_valid": False,
                "chart_type": "bar_chart",
                "message": "Hello! I'm here to help you create graphs. What would you like to visualize?",
                "suggestions": [
                    f"Try: 'Show me a bar chart of {numeric_cols[0]} by {categorical_cols[0]}'" if numeric_cols and categorical_cols else "Try: 'Show me a bar chart'",
                    "Or: 'Create a line chart showing trends over time'",
                    "Be specific about what data you want to see in graph form"
                ]
            }
        
        return None  # No edge case detected
    
    def detect_explicit_chart_type(self, query_lower):
        """Detect if user explicitly mentioned a chart type"""
        chart_mappings = {
            ('bar', 'column', 'bars', 'columns'): "bar_chart",
            ('line', 'trend', 'trends', 'time series', 'over time'): "line_chart",
            ('scatter', 'scatterplot', 'scatter plot', 'correlation'): "scatter_plot",
            ('pie', 'pie chart', 'donut', 'circle'): "pie_chart",
            ('histogram', 'distribution', 'freq', 'frequency'): "histogram",
            ('box', 'box plot', 'boxplot', 'quartile'): "box_plot",
            ('heatmap', 'heat map', 'correlation matrix'): "heatmap"
        }
        
        for keywords, chart_type in chart_mappings.items():
            if any(keyword in query_lower for keyword in keywords):
                return chart_type
        
        return None
    
    def provide_intelligent_suggestions(self, query, df):
        """Provide intelligent suggestions when no explicit chart type is found"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        suggestions = []
        if len(categorical_cols) > 0 and len(numeric_cols) > 0:
            suggestions.append(f"Show me a bar chart of {numeric_cols[0]} by {categorical_cols[0]}")
        if len(numeric_cols) >= 2:
            suggestions.append(f"Create a line chart showing {numeric_cols[0]} over time")
            suggestions.append(f"Make a scatter plot of {numeric_cols[0]} vs {numeric_cols[1]}")
        
        return {
            "is_valid": False,
            "chart_type": "bar_chart",  # default
            "message": f"I'm not sure what '{query}' means. Could you try one of these instead?",
            "suggestions": suggestions[:3]
        }

    def analyze_query_and_data(self, query, df):
        """Analyze query and data to determine best graph type"""
        validation_result = self.validate_and_analyze_query(query, df)
        
        if not validation_result["is_valid"]:
            # Return validation result for frontend to handle
            return validation_result
        
        # If valid, extract chart type
        chart_type = validation_result["chart_type"]
        
        # Ensure proper format
        chart_type_map = {
            "bar": "bar_chart",
            "line": "line_chart", 
            "scatter": "scatter_plot",
            "pie": "pie_chart",
            "histogram": "histogram",
            "box": "box_plot",
            "heatmap": "heatmap"
        }
        
        for key, value in chart_type_map.items():
            if key in chart_type.lower():
                return value
                
        return chart_type
    
    def create_graph(self, df, chart_type, query):
        """Create appropriate graph based on chart type"""
        try:
            # Set up the plot style
            plt.style.use('seaborn-v0_8')
            fig, ax = plt.subplots(figsize=(12, 8))
            
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            
            if chart_type == 'line_chart':
                if len(numeric_cols) >= 2:
                    x_col = numeric_cols[0]
                    y_col = numeric_cols[1]
                    ax.plot(df[x_col], df[y_col], marker='o', linewidth=2, markersize=6)
                    ax.set_xlabel(x_col)
                    ax.set_ylabel(y_col)
                elif len(numeric_cols) == 1 and len(categorical_cols) >= 1:
                    x_col = categorical_cols[0]
                    y_col = numeric_cols[0]
                    ax.plot(df[x_col], df[y_col], marker='o', linewidth=2, markersize=6)
                    ax.set_xlabel(x_col)
                    ax.set_ylabel(y_col)
                    plt.xticks(rotation=45)
                else:
                    # Fallback to index vs first numeric column
                    y_col = numeric_cols[0] if numeric_cols else df.columns[0]
                    ax.plot(df.index, df[y_col], marker='o', linewidth=2, markersize=6)
                    ax.set_xlabel('Index')
                    ax.set_ylabel(y_col)
                    
            elif chart_type == 'bar_chart':
                if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
                    x_col = categorical_cols[0]
                    y_col = numeric_cols[0]
                    # Group by category and sum/mean
                    grouped_data = df.groupby(x_col)[y_col].mean()
                    ax.bar(grouped_data.index, grouped_data.values, alpha=0.8)
                    ax.set_xlabel(x_col)
                    ax.set_ylabel(f'Average {y_col}')
                    plt.xticks(rotation=45)
                elif len(numeric_cols) >= 2:
                    x_col = numeric_cols[0]
                    y_col = numeric_cols[1]
                    ax.bar(range(len(df)), df[y_col], alpha=0.8)
                    ax.set_xlabel('Index')
                    ax.set_ylabel(y_col)
                else:
                    # Simple bar chart of first column
                    col = df.columns[0]
                    value_counts = df[col].value_counts().head(10)
                    ax.bar(range(len(value_counts)), value_counts.values, alpha=0.8)
                    ax.set_xticks(range(len(value_counts)))
                    ax.set_xticklabels(value_counts.index, rotation=45)
                    ax.set_ylabel('Count')
                    
            elif chart_type == 'scatter_plot':
                if len(numeric_cols) >= 2:
                    x_col = numeric_cols[0]
                    y_col = numeric_cols[1]
                    ax.scatter(df[x_col], df[y_col], alpha=0.6, s=50)
                    ax.set_xlabel(x_col)
                    ax.set_ylabel(y_col)
                else:
                    # Fallback: scatter plot with index
                    y_col = numeric_cols[0] if numeric_cols else df.columns[0]
                    ax.scatter(df.index, df[y_col], alpha=0.6, s=50)
                    ax.set_xlabel('Index')
                    ax.set_ylabel(y_col)
                    
            elif chart_type == 'pie_chart':
                if len(categorical_cols) >= 1:
                    col = categorical_cols[0]
                    value_counts = df[col].value_counts().head(8)  # Limit to 8 slices
                    ax.pie(value_counts.values, labels=value_counts.index, autopct='%1.1f%%')
                elif len(numeric_cols) >= 1:
                    col = numeric_cols[0]
                    # Create bins for numeric data
                    bins = pd.cut(df[col], bins=5)
                    value_counts = bins.value_counts()
                    ax.pie(value_counts.values, labels=[str(x) for x in value_counts.index], autopct='%1.1f%%')
                    
            elif chart_type == 'histogram':
                if len(numeric_cols) >= 1:
                    col = numeric_cols[0]
                    ax.hist(df[col].dropna(), bins=20, alpha=0.7, edgecolor='black')
                    ax.set_xlabel(col)
                    ax.set_ylabel('Frequency')
                else:
                    # Fallback for non-numeric data
                    col = df.columns[0]
                    value_counts = df[col].value_counts().head(15)
                    ax.bar(range(len(value_counts)), value_counts.values, alpha=0.7)
                    ax.set_xticks(range(len(value_counts)))
                    ax.set_xticklabels(value_counts.index, rotation=45)
                    ax.set_ylabel('Count')
                    
            elif chart_type == 'box_plot':
                if len(numeric_cols) >= 1:
                    cols_to_plot = numeric_cols[:5]  # Limit to 5 columns
                    df[cols_to_plot].boxplot(ax=ax)
                    plt.xticks(rotation=45)
                    
            elif chart_type == 'heatmap':
                if len(numeric_cols) >= 2:
                    # Correlation heatmap
                    corr_matrix = df[numeric_cols].corr()
                    im = ax.imshow(corr_matrix, cmap='coolwarm', aspect='auto')
                    ax.set_xticks(range(len(corr_matrix.columns)))
                    ax.set_yticks(range(len(corr_matrix.columns)))
                    ax.set_xticklabels(corr_matrix.columns, rotation=45)
                    ax.set_yticklabels(corr_matrix.columns)
                    
                    # Add correlation values
                    for i in range(len(corr_matrix.columns)):
                        for j in range(len(corr_matrix.columns)):
                            ax.text(j, i, f'{corr_matrix.iloc[i, j]:.2f}', 
                                   ha='center', va='center', color='white', fontweight='bold')
                    
                    plt.colorbar(im, ax=ax)
                    
            # Set title and improve layout
            plt.title(f'Graph for: {query}', fontsize=14, fontweight='bold', pad=20)
            plt.tight_layout()
            
            # Save plot to base64 string
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight', 
                       facecolor='white', edgecolor='none')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            raise Exception(f"Error creating graph: {str(e)}")
    
    def generate_summary(self, df, query, chart_type):
        """Generate a summary of the data and graph"""
        summary = {
            "data_shape": f"{df.shape[0]} rows × {df.shape[1]} columns",
            "chart_type": chart_type.replace('_', ' ').title(),
            "columns": list(df.columns),
            "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_columns": df.select_dtypes(include=['object']).columns.tolist(),
            "query_processed": query
        }
        return summary

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Invalid arguments. Expected: file_path query session_id"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    query = sys.argv[2]
    session_id = sys.argv[3]
    
    try:
        generator = GraphGenerator()
        
        # Load data
        df = generator.load_data(file_path)
        
        # Validate data quality first
        data_validation = generator.validate_data_quality(df)
        if not data_validation["is_valid"]:
            # Return data quality error response
            response = {
                "success": False,
                "session_id": session_id,
                "is_chatbot_response": True,
                "message": data_validation["message"],
                "suggestions": data_validation["suggestions"],
                "data_quality_issues": data_validation.get("issues", []),
                "data_summary": data_validation.get("data_summary", {}),
                "error_type": "data_quality"
            }
            print(json.dumps(response))
            return
        
        # Check for data quality warnings
        data_warnings = None
        if data_validation.get("has_warnings"):
            data_warnings = {
                "message": data_validation["message"],
                "suggestions": data_validation["suggestions"],
                "issues": data_validation["issues"]
            }
        
        # Special handling for suggestion generation request
        if query.lower().strip() == "generate suggestions":
            suggestions_result = generator.provide_intelligent_suggestions("", df)
            response = {
                "success": True,
                "session_id": session_id,
                "suggestions": suggestions_result["suggestions"],
                "data_info": {
                    "columns": list(df.columns),
                    "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
                    "categorical_columns": df.select_dtypes(include=['object']).columns.tolist(),
                    "data_shape": f"{df.shape[0]} rows × {df.shape[1]} columns"
                }
            }
            print(json.dumps(response))
            return
        
        # Analyze query and determine chart type
        analysis_result = generator.analyze_query_and_data(query, df)
        
        # Check if it's a validation response (invalid query)
        if isinstance(analysis_result, dict) and "is_valid" in analysis_result:
            if not analysis_result["is_valid"]:
                # Return chatbot response for invalid query
                response = {
                    "success": False,
                    "session_id": session_id,
                    "is_chatbot_response": True,
                    "message": analysis_result["message"],
                    "suggestions": analysis_result["suggestions"],
                    "data_info": {
                        "columns": list(df.columns),
                        "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
                        "categorical_columns": df.select_dtypes(include=['object']).columns.tolist(),
                        "data_shape": f"{df.shape[0]} rows × {df.shape[1]} columns"
                    }
                }
                print(json.dumps(response))
                return
            else:
                chart_type = analysis_result["chart_type"]
        else:
            chart_type = analysis_result
        
        # Generate graph
        image_base64 = generator.create_graph(df, chart_type, query)
        
        # Generate summary
        summary = generator.generate_summary(df, query, chart_type)
        
        # Return response
        response = {
            "success": True,
            "session_id": session_id,
            "image": image_base64,
            "chart_type": chart_type,
            "summary": summary,
            "message": f"Successfully generated {chart_type.replace('_', ' ')} based on your query."
        }
        
        # Include data warnings if any
        if data_warnings:
            response["data_warnings"] = data_warnings
        
        print(json.dumps(response))
        
    except Exception as e:
        error_response = {
            "success": False,
            "session_id": session_id,
            "error": str(e),
            "message": "Failed to generate graph. Please check your data and query."
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
