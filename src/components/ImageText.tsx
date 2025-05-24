import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { geminiService } from '../services/geminiService';

interface ExtractedText {
  raw_text: string;
  formatted_text: string;
}

const ImageText: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<ExtractedText | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsLoading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        setSelectedImage(URL.createObjectURL(file));
        
        // Extract text from image
        const result = await geminiService.extractTextFromImage(base64String, file.type);
        const parsedResult = JSON.parse(result);
        setExtractedText(parsedResult);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        component="label"
      >
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />
        <UploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
        <Typography variant="h6" gutterBottom>
          Upload an image
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PNG, JPEG, WEBP, HEIC, HEIF
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
        {/* Image Preview */}
        {selectedImage && (
          <Paper sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
            <Typography variant="subtitle1" gutterBottom>
              Image Preview
            </Typography>
            <Box
              component="img"
              src={selectedImage}
              alt="Uploaded image"
              sx={{
                width: '100%',
                height: 'calc(100% - 40px)',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          </Paper>
        )}

        {/* Extracted Text */}
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" gutterBottom>
            Extracted Text
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
              <CircularProgress />
            </Box>
          ) : extractedText ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Raw Text</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyText(extractedText.raw_text)}
                    title="Copy raw text"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {extractedText.raw_text}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Formatted Text</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleCopyText(extractedText.formatted_text)}
                    title="Copy formatted text"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {extractedText.formatted_text}
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              Upload an image to extract text...
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ImageText; 