import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('REACT_APP_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

interface FileContext {
  name: string;
  content: string;
  type: string;
}

export const geminiService = {
  async generateText(prompt: string) {
    try {
      if (!API_KEY) {
        throw new Error('API key is not configured');
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate text: ${error.message}`);
      }
      throw error;
    }
  },

  async analyzeFileContent(fileContent: string, fileName: string) {
    try {
      if (!API_KEY) {
        throw new Error('API key is not configured');
      }

      const prompt = `Please analyze and summarize the following file content from "${fileName}":\n\n${fileContent}`;
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing file content:', error);
      throw error;
    }
  },

  async generateImage(prompt: string) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-vision' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  },

  async analyzeCode(code: string, language: string) {
    try {
      const prompt = `Analyze the following ${language} code and provide suggestions for improvement:\n\n${code}`;
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing code:', error);
      throw error;
    }
  },

  async extractTextFromImage(imageData: string, mimeType: string) {
    try {
      if (!API_KEY) {
        throw new Error('API key is not configured');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-vision' });
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageData
              }
            },
            {
              text: "Extract and format all text from this image. Return the text in a structured JSON format with two fields: 'raw_text' for the direct text extraction and 'formatted_text' for a clean, properly formatted version."
            }
          ]
        }]
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw error;
    }
  },

  async chatWithContext(message: string, fileContexts: FileContext[] = []) {
    try {
      if (!API_KEY) {
        throw new Error('API key is not configured');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      // Build the context from files
      let contextPrompt = '';
      if (fileContexts.length > 0) {
        contextPrompt = 'Here are the relevant files for context:\n\n';
        fileContexts.forEach(file => {
          contextPrompt += `File: ${file.name} (${file.type})\nContent:\n${file.content}\n---\n`;
        });
        contextPrompt += '\nPlease use this context to answer the following question:\n';
      }

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: contextPrompt + message
          }]
        }]
      });
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in chat with context:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process chat: ${error.message}`);
      }
      throw error;
    }
  }
}; 