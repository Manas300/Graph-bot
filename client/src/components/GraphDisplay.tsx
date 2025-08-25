import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { GraphResult } from '../types';

interface GraphDisplayProps {
  graphResult: GraphResult | null;
  isLoading: boolean;
  onReset: () => void;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({
  graphResult,
  isLoading,
  onReset,
}) => {
  const downloadImage = () => {
    if (!graphResult?.image) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${graphResult.image}`;
    link.download = `graph-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 3,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 3,
          }}
        />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Creating your visualization...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Our AI is analyzing your data and generating the perfect graph
        </Typography>
      </Paper>
    );
  }

  if (!graphResult) {
    return null;
  }

  return (
    <Box>
      {/* Success Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CheckIcon sx={{ color: 'success.main', fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
              Graph generated successfully!
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={graphResult.chart_type?.replace('_', ' ').toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: 'success.main',
                  fontWeight: 600,
                }}
              />
              {graphResult.summary && (
                <Chip
                  label={graphResult.summary.data_shape}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                    color: 'secondary.main',
                    fontWeight: 500,
                  }}
                />
              )}
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadImage}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #0891b2 100%)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Download
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              sx={{
                borderColor: 'text.secondary',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.main',
                },
              }}
            >
              New Graph
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Data Warnings */}
      {graphResult.data_warnings && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Data Quality Notice:
          </Typography>
          <Typography variant="body2">
            {graphResult.data_warnings.message}
          </Typography>
        </Alert>
      )}

      {/* Graph Image */}
      <Paper
        sx={{
          p: 0,
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          background: 'white',
        }}
      >
        <img
          src={`data:image/png;base64,${graphResult.image}`}
          alt="Generated Graph"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </Paper>

      {/* Graph Details */}
      {graphResult.summary && (
        <Paper
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <AnalyticsIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Graph Details
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Data Overview:
              </Typography>
              <Typography variant="body1">
                {graphResult.summary.data_shape} • {graphResult.summary.chart_type}
              </Typography>
            </Box>

            {graphResult.summary.key_insights && (
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Key Insights:
                </Typography>
                <Typography variant="body1">
                  {graphResult.summary.key_insights}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`Session: ${graphResult.session_id?.slice(-8)}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label="High Quality (300 DPI)"
                size="small"
                variant="outlined"
              />
              <Chip
                label="PNG Format"
                size="small"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default GraphDisplay;