import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FileWithContent {
  name: string;
  content: string;
  type: string;
  path?: string;
  preview?: string;
}

interface FileContextType {
  files: FileWithContent[];
  addFiles: (newFiles: FileWithContent[]) => void;
  removeFile: (fileName: string) => void;
  clearFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileWithContent[]>([]);

  const addFiles = (newFiles: FileWithContent[]) => {
    setFiles(prevFiles => {
      // Filter out any existing files with the same name
      const existingFileNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));
      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const removeFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <FileContext.Provider value={{ files, addFiles, removeFile, clearFiles }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}; 