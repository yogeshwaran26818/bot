import { useUser, UserButton } from '@clerk/clerk-react';
import ChatBot from '../components/ChatBot';
import { Bot, ArrowLeft } from 'lucide-react';

export default function Chat({ onBackToDashboard, linkId }) {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold">WebBot Chat</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.firstName}!</span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ChatBot linkId={linkId} />
      </main>
    </div>
  );
}