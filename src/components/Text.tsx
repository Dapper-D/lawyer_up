import React, { useState, useCallback, DragEvent } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { geminiService } from '../services/geminiService';
import { useFiles, FileWithContent } from '../contexts/FileContext';

// Custom type declaration for directory input
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string | boolean;
    directory?: string | boolean;
  }
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface FileWithPath {
  file: File;
  path: string;
  type: string;
  preview?: string;
}

const Text: React.FC = () => {
  const [localFiles, setLocalFiles] = useState<FileWithPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadType, setUploadType] = useState<'files' | 'folder'>('files');
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState({
    summary: '',
    keywords: [] as string[],
    imageTexts: [] as { path: string; text: string; preview?: string }[],
  });
  const { addFiles } = useFiles();

  const handleUploadTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'files' | 'folder',
  ) => {
    if (newType !== null) {
      setUploadType(newType);
    }
  };

  const processFile = async (file: File, path: string): Promise<FileWithPath> => {
    const fileType = file.type;
    let preview = undefined;

    if (fileType.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    return { file, path, type: fileType, preview };
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const newFiles: FileWithPath[] = [];
    const items = event.target.files;

    for (let i = 0; i < items.length; i++) {
      const file = items[i];
      const path = file.webkitRelativePath || file.name;
      const processedFile = await processFile(file, path);
      newFiles.push(processedFile);
    }

    setLocalFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const newFiles: FileWithPath[] = [];

    if (uploadType === 'folder') {
      // Handle folder drop using FileSystemEntry API
      const items = Array.from(event.dataTransfer.items);
      for (const item of items) {
        if (item.kind === 'file') {
          // Use the non-standard API with proper type casting
          const entry = (item as DataTransferItem).webkitGetAsEntry?.();
          if (entry?.isDirectory) {
            await traverseDirectory(entry as FileSystemDirectoryEntry, '', newFiles);
          } else if (entry?.isFile) {
            await handleFileEntry(entry as FileSystemFileEntry, '', newFiles);
          }
        }
      }
    } else {
      // Handle individual files drop
      const files = Array.from(event.dataTransfer.files);
      for (const file of files) {
        const processedFile = await processFile(file, file.name);
        newFiles.push(processedFile);
      }
    }

    setLocalFiles(prevFiles => [...prevFiles, ...newFiles]);
    setIsDragging(false);
  };

  const traverseDirectory = async (
    dirEntry: FileSystemDirectoryEntry,
    path: string,
    files: FileWithPath[]
  ): Promise<void> => {
    const dirReader = dirEntry.createReader();
    await new Promise<void>((resolve) => {
      const readEntries = async () => {
        dirReader.readEntries(async (entries) => {
          if (entries.length === 0) {
            resolve();
            return;
          }

          for (const entry of entries) {
            const newPath = path ? `${path}/${entry.name}` : entry.name;
            if (entry.isDirectory) {
              await traverseDirectory(entry as FileSystemDirectoryEntry, newPath, files);
            } else {
              await handleFileEntry(entry as FileSystemFileEntry, newPath, files);
            }
          }

          readEntries(); // Continue reading if there are more entries
        });
      };
      readEntries();
    });
  };

  const handleFileEntry = async (
    fileEntry: FileSystemFileEntry,
    path: string,
    files: FileWithPath[]
  ): Promise<void> => {
    const file = await new Promise<File>((resolve) => {
      fileEntry.file(resolve);
    });
    const processedFile = await processFile(file, path || file.name);
    files.push(processedFile);
  };

  const handleAnalyze = async () => {
    if (localFiles.length === 0) return;

    setIsLoading(true);
    try {
      const analysisResults = await Promise.all(
        localFiles.map(async (fileWithPath) => {
          if (fileWithPath.type.startsWith('image/')) {
            // Handle image files
            const reader = new FileReader();
            const imageData = await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(fileWithPath.file);
            });
            
            const extractedText = await geminiService.extractTextFromImage(
              imageData.split(',')[1],
              fileWithPath.type
            );
            
            return {
              path: fileWithPath.path,
              type: 'image',
              content: extractedText,
              preview: fileWithPath.preview
            };
          } else {
            // Handle text files
            const content = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsText(fileWithPath.file);
            });
            
            const analysis = await geminiService.analyzeFileContent(content, fileWithPath.path);

            // Add the file to the shared context
            addFiles([{
              name: fileWithPath.path,
              content,
              type: fileWithPath.type
            }]);

            return {
              path: fileWithPath.path,
              type: 'text',
              content: analysis
            };
          }
        })
      );

      // Separate text and image results
      const textResults = analysisResults.filter(result => result.type === 'text');
      const imageResults = analysisResults.filter(result => result.type === 'image');

      // Combine the analysis results
      const textSummary = textResults
        .map(result => `File: ${result.path}\n${result.content}\n\n`)
        .join('---\n');

      setAnalysis({
        summary: textSummary,
        keywords: [],
        imageTexts: imageResults.map(result => ({
          path: result.path,
          text: result.content,
          preview: result.preview
        }))
      });
    } catch (error) {
      console.error('Error analyzing files:', error);
      setAnalysis({
        summary: 'Sorry, I encountered an error while analyzing your files. Please try again.',
        keywords: [],
        imageTexts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFiles = () => {
    setLocalFiles([]);
    setAnalysis({
      summary: '',
      keywords: [],
      imageTexts: []
    });
    // Clean up image previews
    localFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      overflow: 'hidden'  // Prevent outer container from scrolling
    }}>
      {/* Upload controls section - fixed height */}
      <Box sx={{ flexShrink: 0 }}>  {/* Prevent this section from shrinking */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <ToggleButtonGroup
              value={uploadType}
              exclusive
              onChange={handleUploadTypeChange}
              aria-label="upload type"
              size="small"
            >
              <ToggleButton value="files" aria-label="files">
                <FileUploadIcon sx={{ mr: 1 }} /> Files
              </ToggleButton>
              <ToggleButton value="folder" aria-label="folder">
                <FolderOpenIcon sx={{ mr: 1 }} /> Folder
              </ToggleButton>
            </ToggleButtonGroup>

            <Paper
              sx={{
                p: 3,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isDragging ? 'action.hover' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              elevation={0}
            >
              <Box
                component="label"
                sx={{ display: 'block', width: '100%', height: '100%' }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  hidden
                  multiple={uploadType === 'files'}
                  {...(uploadType === 'folder' ? { webkitdirectory: "true", directory: "true" } : {})}
                  onChange={handleFileUpload}
                />
                {uploadType === 'folder' ? (
                  <FolderOpenIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                ) : (
                  <FileUploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                )}
                <Typography variant="h6" gutterBottom>
                  Drop {uploadType === 'folder' ? 'folders' : 'files'} here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select {uploadType === 'folder' ? 'folders' : 'files'}
                </Typography>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<TextFieldsIcon />}
              onClick={handleAnalyze}
              disabled={localFiles.length === 0 || isLoading}
            >
              Analyze
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearFiles}
              disabled={localFiles.length === 0}
            >
              Clear Files
            </Button>
          </Box>
        </Box>

        {/* Selected files list - fixed height with internal scroll if needed */}
        <Paper sx={{ p: 2, maxHeight: '150px', overflow: 'auto' }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({localFiles.length}):
          </Typography>
          <List dense>
            {localFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={file.path}
                  secondary={`${(file.file.size / 1024).toFixed(2)} KB - ${file.type}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Results section - scrollable */}
      <Paper sx={{ 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0  // Allow container to shrink below its content size
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ 
            p: 3, 
            overflow: 'auto',  // Enable scrolling for results
            height: '100%'
          }}>
            {/* Text Analysis Section */}
            {analysis.summary && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SummarizeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Text Analysis
                  </Typography>
                </Box>
                {analysis.summary.split('---\n').map((section, index) => {
                  const [fileLine, ...contentLines] = section.split('\n');
                  return (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'medium',
                          mb: 1,
                          fontFamily: 'monospace',
                        }}
                      >
                        {fileLine}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {contentLines.join('\n')}
                      </Typography>
                    </Paper>
                  );
                })}
              </>
            )}

            {/* Image Analysis Section */}
            {analysis.imageTexts.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
                  <TextFieldsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Image Text Extraction
                  </Typography>
                </Box>
                <ImageList sx={{ width: '100%' }} cols={2} rowHeight={400}>
                  {analysis.imageTexts.map((item, index) => (
                    <ImageListItem key={index} sx={{ mb: 2 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        {item.preview && (
                          <img
                            src={item.preview}
                            alt={item.path}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                        <Typography variant="subtitle2" color="primary">
                          {item.path}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto',
                            maxHeight: '150px',
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Paper>
                    </ImageListItem>
                  ))}
                </ImageList>
              </>
            )}

            {!analysis.summary && analysis.imageTexts.length === 0 && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                Analysis will appear here...
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Text; 