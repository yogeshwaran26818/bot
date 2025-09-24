import { useState, useEffect } from 'react';
import { linkAPI, ragAPI } from '../services/api';
import { ExternalLink, MessageCircle, Loader2 } from 'lucide-react';

export default function ScrapedLinks({ uploadedUrl, onChatClick }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [isTrained, setIsTrained] = useState(false);

  useEffect(() => {
    if (uploadedUrl) {
      fetchScrapedLinks();
    }
  }, [uploadedUrl]);

  const fetchScrapedLinks = async () => {
    setLoading(true);
    try {
      const response = await linkAPI.getScrapedLinks(uploadedUrl);
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching scraped links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      await ragAPI.train(uploadedUrl);
      setIsTrained(true);
      alert('Training completed successfully!');
    } catch (error) {
      console.error('Training error:', error);
      alert('Training failed. Please try again.');
    } finally {
      setTraining(false);
    }
  };

  const handleStartChat = () => {
    if (!isTrained) {
      alert('Please train the model first before starting chat.');
      return;
    }
    onChatClick?.();
  };

  if (!uploadedUrl) {
    return (
      <div className="card max-w-4xl mx-auto text-center">
        <p className="text-gray-500">Upload a website to see scraped links</p>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scraped Links ({links.length})</h2>
        <div className="flex gap-3">
          <button
            onClick={handleTrain}
            disabled={training || links.length === 0 || isTrained}
            className={`btn-primary flex items-center gap-2 ${isTrained ? 'bg-green-600' : ''}`}
          >
            {training ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Training...
              </>
            ) : isTrained ? (
              '✅ Trained'
            ) : (
              '🧠 Train Model'
            )}
          </button>
          <button
            onClick={handleStartChat}
            disabled={!isTrained}
            className={`btn-primary flex items-center gap-2 ${!isTrained ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MessageCircle className="w-4 h-4" />
            Start Chat
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {links.map((link, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.anchorText}</p>
                <p className="text-sm text-gray-500 truncate">{link.anchorUrl}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}