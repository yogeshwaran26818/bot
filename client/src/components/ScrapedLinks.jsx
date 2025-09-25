import { useState, useEffect } from 'react';
import { linkAPI, ragAPI } from '../services/api';
import { ExternalLink, MessageCircle, Loader2 } from 'lucide-react';

export default function ScrapedLinks({ uploadedUrl, onChatClick }) {
  const [linkData, setLinkData] = useState(null);
  const [websiteData, setWebsiteData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [isTrained, setIsTrained] = useState(false);

  useEffect(() => {
    if (uploadedUrl) {
      fetchLinkData();
    }
  }, [uploadedUrl]);

  const fetchLinkData = async () => {
    setLoading(true);
    try {
      const response = await linkAPI.getUserLinks();
      const matchingLink = response.data.find(link => link.originalUrl === uploadedUrl);
      
      if (matchingLink) {
        setLinkData(matchingLink);
        setIsTrained(matchingLink.isEmbedded);
        
        // Fetch actual website data
        const websiteResponse = await linkAPI.getWebsiteData(matchingLink.linkId);
        setWebsiteData(websiteResponse.data);
      } else {
        setLinkData(null);
        setWebsiteData([]);
      }
    } catch (error) {
      console.error('Error fetching link data:', error);
      setLinkData(null);
      setWebsiteData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!linkData?.linkId) {
      alert('No link data found');
      return;
    }
    
    setTraining(true);
    try {
      await ragAPI.trainLink(linkData.linkId);
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
    onChatClick?.(linkData?.linkId);
  };

  if (!uploadedUrl) {
    return (
      <div className="card max-w-4xl mx-auto text-center">
        <p className="text-gray-500">Upload a website to see scraped pages</p>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scraped Pages ({linkData?.anchorCount || 0})</h2>
        <div className="flex gap-3">
          {!isTrained && (
            <button
              onClick={handleTrain}
              disabled={training || !linkData?.anchorCount}
              className="btn-primary flex items-center gap-2"
            >
              {training ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Training...
                </>
              ) : (
                '🧠 Train Model'
              )}
            </button>
          )}
          {isTrained && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              ✅ Already Trained
            </div>
          )}
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
          {websiteData.length > 0 ? (
            websiteData.map((data, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{data.text || `Page ${index + 1}`}</p>
                  <p className="text-sm text-gray-500 truncate">{data.url}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No pages found</p>
          )}
        </div>
      )}
    </div>
  );
}