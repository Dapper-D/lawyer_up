live link https://lawyer-up-xi.vercel.app/
# AI Assistant Application

A sophisticated AI-powered application with multiple functionalities including chat, code analysis, image generation, and text analysis.

## Features

- **Chat Assistant**: Interactive chat interface with AI
- **Code Analysis**: AI-powered code analysis and suggestions
- **Image Generation**: Generate images from text descriptions
- **Text Analysis**: Sentiment analysis, translation, and summarization

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-assistant-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your API keys:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

1. Start the development server:
```bash
npm start
# or
yarn start
```

2. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Building for Production

```bash
npm run build
# or
yarn build
```

## Technologies Used

- React
- TypeScript
- Material-UI
- OpenAI API

## Project Structure

```
src/
  ├── components/
  │   ├── Chat.tsx
  │   ├── Code.tsx
  │   ├── Image.tsx
  │   └── Text.tsx
  ├── App.tsx
  ├── index.tsx
  └── index.css
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
