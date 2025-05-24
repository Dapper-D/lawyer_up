import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { geminiService } from '../services/geminiService';

const Image: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await geminiService.generateImage(prompt);
      // Note: Gemini's image generation returns a text description
      // You might want to use a different service for actual image generation
      setGeneratedImages([response]);
    } catch (error) {
      console.error('Error generating images:', error);
      setGeneratedImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    // Implement download functionality
    console.log('Downloading image:', imageUrl);
  };

  const handleShare = (imageUrl: string) => {
    // Implement share functionality
    console.log('Sharing image:', imageUrl);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          variant="outlined"
        />
        <Button
          variant="contained"
          startIcon={<ImageIcon />}
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
        >
          Generate
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {generatedImages.map((imageUrl, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <IconButton onClick={() => handleDownload(imageUrl)}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton onClick={() => handleShare(imageUrl)}>
                    <ShareIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Image; 