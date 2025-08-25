import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
  AutoAwesome as MagicIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import axios from 'axios';
import { QueryInputProps } from '../types';

const QueryInput: React.FC<QueryInputProps> = ({
  onQuerySubmit,
  onGraphGenerated,
  onLoadingChange,
  onChatbotResponse,
  selectedFile,
  query,
  disabled,
}) => {
  const [currentQuery, setCurrentQuery] = useState<string>(query);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);

  // Sync with external query prop (when suggestions are clicked)
  useEffect(() => {
    setCurrentQuery(query);
  }, [query]);

  // Generate smart suggestions when file is uploaded
  useEffect(() => {
    if (selectedFile) {
      generateSmartSuggestions();
    } else {
      setSmartSuggestions([]);
    }
  }, [selectedFile]);

  const generateSmartSuggestions = async () => {
    if (!selectedFile) return;

    setLoadingSuggestions(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('query', 'generate suggestions'); // Special query to get suggestions

      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post<any>(
        `${apiBaseUrl}/api/generate-graph`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      // Extract suggestions from the response
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setSmartSuggestions(response.data.suggestions);
      } else {
        // Fallback to generic suggestions if no smart ones available
        setSmartSuggestions([
          'Show me a bar chart of the data',
          'Create a line chart showing trends',
          'Display a pie chart distribution',
          'Generate a scatter plot',
        ]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback suggestions
      setSmartSuggestions([
        'Show me a bar chart of the data',
        'Create a line chart showing trends', 
        'Display a pie chart distribution',
        'Generate a scatter plot',
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!currentQuery.trim() || !selectedFile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    onLoadingChange(true);
    onQuerySubmit(currentQuery);

    toast.loading('Analyzing your request...', { id: 'graph-generation' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('query', currentQuery);

      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post<any>(
        `${apiBaseUrl}/api/generate-graph`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );

      // Check if it's a chatbot response
      if (response.data.is_chatbot_response) {
        if (onChatbotResponse) {
          onChatbotResponse(response.data);
        }
        toast.dismiss('graph-generation');
      } else if (response.data.success) {
        onGraphGenerated(response.data);
        toast.success('Graph generated successfully!', {
          id: 'graph-generation',
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate graph');
      }
    } catch (error: any) {
      console.error('Error generating graph:', error);
      
      let errorMessage = 'Failed to generate graph. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        id: 'graph-generation',
      });
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentQuery(suggestion);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Describe what you want to visualize... For example: 'Show me a bar chart comparing sales by region' or 'Create a line chart showing monthly trends'"
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          disabled={disabled || isSubmitting}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              '&:hover': {
                border: '1px solid rgba(99, 102, 241, 0.5)',
              },
              '&.Mui-focused': {
                border: '2px solid rgba(99, 102, 241, 0.8)',
                boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '1rem',
              lineHeight: 1.5,
            },
          }}
          variant="outlined"
        />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={disabled || isSubmitting || !currentQuery.trim()}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <SendIcon />
            }
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              fontWeight: 600,
              minWidth: 160,
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #0891b2 100%)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(99, 102, 241, 0.3)',
                transform: 'none',
              },
            }}
          >
            {isSubmitting ? 'Generating...' : 'Generate Graph'}
          </Button>
          
          {selectedFile && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Using:
              </Typography>
              <Chip
                label={selectedFile.name}
                size="small"
                sx={{
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  color: 'secondary.main',
                  fontWeight: 500,
                }}
              />
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title="Clear query">
            <IconButton
              onClick={() => setCurrentQuery('')}
              disabled={!currentQuery || isSubmitting}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.1)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </form>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Smart Suggestions */}
      {selectedFile && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LightbulbIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {loadingSuggestions ? 'Analyzing your data...' : 'Smart suggestions for your data:'}
            </Typography>
            {loadingSuggestions && (
              <CircularProgress size={16} sx={{ color: 'primary.main' }} />
            )}
          </Stack>
          
          <Stack spacing={1.5}>
            {loadingSuggestions ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.4 },
                      '50%': { opacity: 0.8 },
                      '100%': { opacity: 0.4 },
                    },
                  }}
                />
              ))
            ) : (
              smartSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={disabled || isSubmitting}
                  startIcon={<MagicIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 400,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderColor: 'rgba(99, 102, 241, 0.5)',
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {suggestion}
                </Button>
              ))
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default QueryInput;