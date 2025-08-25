import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Avatar,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Lightbulb as SuggestionIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface ChatbotInterfaceProps {
  message: string;
  suggestions: string[];
  dataInfo?: {
    columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    data_shape: string;
  };
  dataQualityIssues?: string[];
  dataSummary?: {
    total_rows: number;
    total_columns: number;
    columns_with_issues: string[];
  };
  errorType?: string;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({
  message,
  suggestions,
  dataInfo,
  dataQualityIssues,
  dataSummary,
  errorType,
  onSuggestionClick,
}) => {
  const isDataQualityError = errorType === 'data_quality';

  return (
    <Paper
      elevation={0}
      sx={{
        background: isDataQualityError 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: isDataQualityError
          ? '1px solid rgba(239, 68, 68, 0.3)'
          : '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 3,
        p: 3,
      }}
    >
      {/* Bot Message Header */}
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
        <Avatar
          sx={{
            background: isDataQualityError
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            width: 40,
            height: 40,
          }}
        >
          {isDataQualityError ? <ErrorIcon /> : <BotIcon />}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
              lineHeight: 1.6,
              fontSize: '1rem',
            }}
          >
            {message}
          </Typography>
        </Box>
      </Stack>

      {/* Data Quality Issues */}
      {isDataQualityError && dataQualityIssues && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
              Data Quality Issues
            </Typography>
          </Stack>
          
          {dataSummary && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={`${dataSummary.total_rows} rows × ${dataSummary.total_columns} columns`}
                size="small"
                sx={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'error.main' }}
              />
              {dataSummary.columns_with_issues.length > 0 && (
                <Chip
                  label={`${dataSummary.columns_with_issues.length} problematic columns`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(220, 38, 38, 0.3)', color: 'error.main' }}
                />
              )}
            </Stack>
          )}
          
          <Alert
            severity="error"
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 2,
            }}
          >
            <Box>
              {dataQualityIssues.map((issue, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ 
                    mb: index < dataQualityIssues.length - 1 ? 1 : 0,
                    '&:before': {
                      content: '"• "',
                      color: 'error.main',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  {issue}
                </Typography>
              ))}
            </Box>
          </Alert>
        </Box>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <SuggestionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Try these suggestions:
            </Typography>
          </Stack>
          
          <List sx={{ p: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ p: 0, mb: 1 }}>
                <ListItemButton
                  onClick={() => onSuggestionClick(suggestion)}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemText
                    primary={suggestion}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: 'text.primary',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Data Info */}
      {dataInfo && !isDataQualityError && (
        <Box>
          <Divider sx={{ my: 2, borderColor: 'rgba(99, 102, 241, 0.2)' }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <InfoIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Your Data Summary
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`Data Shape: ${dataInfo.data_shape}`}
              size="small"
              sx={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: 'secondary.main' }}
            />
            <Chip
              label={`${dataInfo.numeric_columns.length} Numeric Columns`}
              size="small"
              sx={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: 'secondary.main' }}
            />
            <Chip
              label={`${dataInfo.categorical_columns.length} Text Columns`}
              size="small"
              sx={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: 'secondary.main' }}
            />
          </Stack>
          
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }}>
            <strong>Available columns:</strong> {dataInfo.columns.join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ChatbotInterface;