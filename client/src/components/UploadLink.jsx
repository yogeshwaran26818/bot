import { useState } from 'react';
import { linkAPI } from '../services/api';
import { Upload, Loader2 } from 'lucide-react';

export default function UploadLink({ onUploadSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await linkAPI.upload(url);
      if (response.data.alreadyScraped) {
        setMessage(`✅ ${response.data.message}`);
      } else {
        setMessage(`✅ Successfully scraped ${response.data.anchorCount} pages!`);
      }
      setUrl('');
      onUploadSuccess?.(url);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold">Upload Website</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Website URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Scrape
            </>
          )}
        </button>
      </form>
      
      {message && (
        <div className="mt-4 p-3 rounded-lg bg-gray-100 text-sm">
          {message}
        </div>
      )}
    </div>
  );
}