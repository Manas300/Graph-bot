import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CheckIcon sx={{ color: 'success.main', fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
              File uploaded successfully
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <FileIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedFile.name}
              </Typography>
              <Chip
                label={formatFileSize(selectedFile.size)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: 'success.main',
                  fontWeight: 500,
                }}
              />
            </Stack>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onFileSelect(null as any)}
            sx={{
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': {
                borderColor: 'success.dark',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
              },
            }}
          >
            Change File
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
          border: isDragActive 
            ? '2px dashed rgba(99, 102, 241, 0.6)'
            : '2px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '2px dashed rgba(99, 102, 241, 0.5)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: 'primary.main',
            mb: 2,
            opacity: isDragActive ? 1 : 0.7,
          }}
        />
        
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: isDragActive ? 'primary.main' : 'text.primary',
          }}
        >
          {isDragActive ? 'Drop your file here' : 'Upload your data file'}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 3 }}
        >
          Drag and drop your CSV or Excel file here, or click to browse
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Chip label="CSV" size="small" variant="outlined" />
          <Chip label="Excel" size="small" variant="outlined" />
          <Chip label="Max 10MB" size="small" variant="outlined" />
        </Stack>

        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #0891b2 100%)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Choose File
        </Button>
      </Paper>

      <Alert
        severity="info"
        sx={{
          mt: 2,
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          '& .MuiAlert-icon': {
            color: 'secondary.main',
          },
        }}
      >
        Supported formats: CSV (.csv), Excel (.xls, .xlsx). Maximum file size: 10MB
      </Alert>
    </Box>
  );
};

export default FileUpload;