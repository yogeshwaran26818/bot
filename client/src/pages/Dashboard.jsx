import { useState } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import UploadLink from '../components/UploadLink';
import ScrapedLinks from '../components/ScrapedLinks';
import { Bot } from 'lucide-react';

export default function Dashboard({ onNavigateToChat }) {
  const { user } = useUser();
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleUploadSuccess = (url) => {
    setUploadedUrl(url);
  };

  const handleChatClick = (linkId) => {
    onNavigateToChat?.(linkId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold">WebBot</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.firstName}!</span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your AI Assistant Dashboard</h2>
          <p className="text-gray-600">Upload a website to create your personalized chatbot</p>
        </div>

        <UploadLink onUploadSuccess={handleUploadSuccess} />
        
        <ScrapedLinks 
          uploadedUrl={uploadedUrl} 
          onChatClick={handleChatClick}
        />
      </main>
    </div>
  );
}