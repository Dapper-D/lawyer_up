import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import { geminiService } from '../services/geminiService';

const Code: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const analysis = await geminiService.analyzeCode(code, language);
      setResult(analysis);
    } catch (error) {
      console.error('Error analyzing code:', error);
      setResult('Sorry, I encountered an error while analyzing your code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleAnalyze}
          disabled={!code.trim() || isLoading}
        >
          Analyze Code
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#1e1e1e',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Code Editor
          </Typography>
          <TextField
            multiline
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Enter your ${language} code here...`}
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-root': {
                height: '100%',
                fontFamily: 'monospace',
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto',
              },
            }}
          />
        </Paper>

        <Paper
          elevation={1}
          sx={{
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#1e1e1e',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            AI Analysis
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'auto',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {result || 'AI analysis will appear here...'}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Code; 