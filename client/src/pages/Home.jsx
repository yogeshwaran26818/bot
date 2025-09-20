import { useUser } from '@clerk/clerk-react';
import SignInButton from '../components/Auth/SignInButton';
import { Bot, Globe, MessageSquare, Zap } from 'lucide-react';

export default function Home() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return null; // Will be handled by App.jsx routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Bot className="w-12 h-12 text-primary-600" />
            <h1 className="text-5xl font-bold text-gray-900">WebBot</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform any website into an intelligent chatbot. Upload a URL, let us scrape the content, 
            and chat with your personalized AI assistant.
          </p>
          <SignInButton />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="card text-center">
            <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upload Website</h3>
            <p className="text-gray-600">Simply paste any website URL and we'll scrape up to 15 pages automatically</p>
          </div>
          
          <div className="card text-center">
            <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Training</h3>
            <p className="text-gray-600">Our RAG system processes the content and creates embeddings for intelligent responses</p>
          </div>
          
          <div className="card text-center">
            <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Chat</h3>
            <p className="text-gray-600">Ask questions about the website content and get accurate, contextual answers</p>
          </div>
        </div>
      </div>
    </div>
  );
}