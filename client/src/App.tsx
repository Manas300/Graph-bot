import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  Stack,
  Fade,
  Slide,
} from '@mui/material';
import {
  AutoGraph as GraphIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { Toaster } from 'react-hot-toast';
import FileUpload from './components/FileUpload';
import QueryInput from './components/QueryInput';
import GraphDisplay from './components/GraphDisplay';
import ChatbotInterface from './components/ChatbotInterface';
import { GraphResult } from './types';

// Modern dark theme with gradients
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4338ca',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#cbd5e1', // Slate 300
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h3: {
      fontWeight: 700,
      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState<string>('');
  const [graphResult, setGraphResult] = useState<GraphResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatbotResponse, setChatbotResponse] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setChatbotResponse(null);
    setGraphResult(null);
  };

  const handleQuerySubmit = (queryText: string) => {
    setQuery(queryText);
  };

  const handleGraphGenerated = (result: GraphResult) => {
    setGraphResult(result);
    setChatbotResponse(null);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleChatbotResponse = (response: any) => {
    setChatbotResponse(response);
    setGraphResult(null);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setChatbotResponse(null);
    setTimeout(() => {
      const queryInput = document.querySelector('input[placeholder*="query"]') as HTMLInputElement;
      if (queryInput) {
        queryInput.focus();
      }
    }, 100);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setQuery('');
    setGraphResult(null);
    setIsLoading(false);
    setChatbotResponse(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            },
          }}
        />

        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              <GraphIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Graph Bot
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                by Manas Singh
              </Typography>
            </Box>
            <Chip 
              label="AI-Powered" 
              size="small"
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Chat Interface Container */}
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Welcome Message */}
            <Fade in timeout={800}>
              <Paper
                sx={{
                  p: 4,
                  mb: 3,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <BotIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" gutterBottom>
                  Transform Data into Insights
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                  Upload your CSV or Excel file and describe what you want to visualize. 
                  I'll create the perfect graph using advanced AI analysis.
                </Typography>
              </Paper>
            </Fade>

            {/* Chat Messages */}
            <Stack spacing={3}>
              {/* File Upload Step */}
              <Slide direction="up" in timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      Step 1: Upload Your Data
                    </Typography>
                  </Box>
                  <Paper sx={{ p: 3, ml: 5 }}>
                    <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                  </Paper>
                </Box>
              </Slide>

              {/* Query Input Step */}
              {selectedFile && (
                <Slide direction="up" in timeout={1200}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'secondary.main' }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: 'text.primary' }}>
                        Step 2: Describe Your Visualization
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 3, ml: 5 }}>
                      <QueryInput
                        onQuerySubmit={handleQuerySubmit}
                        onGraphGenerated={handleGraphGenerated}
                        onLoadingChange={handleLoadingChange}
                        onChatbotResponse={handleChatbotResponse}
                        selectedFile={selectedFile}
                        query={query}
                        disabled={!selectedFile || isLoading}
                      />
                    </Paper>
                  </Box>
                </Slide>
              )}

              {/* Chatbot Response */}
              {chatbotResponse && (
                <Slide direction="up" in timeout={600}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                        <BotIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: 'text.primary' }}>
                        Let me help you with that
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 5 }}>
                      <ChatbotInterface
                        message={chatbotResponse.message}
                        suggestions={chatbotResponse.suggestions || []}
                        dataInfo={chatbotResponse.data_info}
                        dataQualityIssues={chatbotResponse.data_quality_issues}
                        dataSummary={chatbotResponse.data_summary}
                        errorType={chatbotResponse.error_type}
                        onSuggestionClick={handleSuggestionClick}
                      />
                    </Box>
                  </Box>
                </Slide>
              )}

              {/* Graph Result */}
              {(graphResult || isLoading) && (
                <Slide direction="up" in timeout={800}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'success.main' }}>
                        <GraphIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: 'text.primary' }}>
                        Your Visualization
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 3, ml: 5 }}>
                      <GraphDisplay
                        graphResult={graphResult}
                        isLoading={isLoading}
                        onReset={resetForm}
                      />
                    </Paper>
                  </Box>
                </Slide>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;