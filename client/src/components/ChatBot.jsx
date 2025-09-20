import { useState } from 'react';
import { ragAPI } from '../services/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I\'m ready to answer questions about the website you uploaded. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await ragAPI.query(input);
      const botMessage = { type: 'bot', content: response.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto h-[600px] flex flex-col">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <Bot className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold">WebBot Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-primary-600' : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\* (.*?)\n/g, '• $1<br>')
                    .replace(/\n/g, '<br>')
                }} />
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about the website..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-4 py-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}