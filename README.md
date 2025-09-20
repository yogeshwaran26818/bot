# WebBot - RAG Chatbot

A full-stack web application that transforms any website into an intelligent chatbot using RAG (Retrieval-Augmented Generation) technology.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication
- 🌐 **Web Scraping** - Automatically scrape up to 15 pages from any website
- 🤖 **RAG Chatbot** - AI-powered chatbot using Gemini 2.0 Flash
- 💾 **MongoDB Storage** - Store user data and scraped content
- ⚡ **Real-time Chat** - Interactive chat interface
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Clerk React
- Axios
- Lucide React (icons)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Clerk SDK
- Google Generative AI (Gemini)
- Axios + Cheerio (web scraping)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally
- Clerk account
- Google AI API key

### Installation

1. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Environment Setup:**
   - Update `.env` file with your actual API keys
   - Ensure MongoDB is running on `mongodb://localhost:27017/webbot`

3. **Run the application:**
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## How It Works

1. **Sign In** - Users authenticate via Clerk
2. **Upload Website** - Paste any website URL
3. **Auto Scraping** - System scrapes up to 15 anchor links and their content
4. **RAG Training** - Content is processed and embeddings are generated
5. **Chat** - Users can ask questions about the website content
6. **AI Responses** - Gemini 2.0 Flash provides contextual answers

## Database Schema

### Users Collection
- User info from Clerk
- Uploaded links with metadata
- Training status

### ScrapedLinks Collection
- Scraped anchor tags and URLs
- Page content for each link
- Embedding status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get user info

### Links
- `POST /api/links/upload` - Upload and scrape website
- `GET /api/links/:url` - Get scraped links

### RAG
- `POST /api/rag/train/:url` - Train RAG model
- `POST /api/rag/query` - Query chatbot

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License