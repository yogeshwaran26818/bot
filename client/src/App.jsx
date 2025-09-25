import { useState, useEffect } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import { authAPI } from './services/api';

const CLERK_PUBLISHABLE_KEY = 'pk_test_bm90ZWQtamF3ZmlzaC0xNi5jbGVyay5hY2NvdW50cy5kZXYk';

function AppContent() {
  const { isSignedIn, user } = useUser();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentLinkId, setCurrentLinkId] = useState(null);

  useEffect(() => {
    if (isSignedIn && user) {
      // Register user in backend
      authAPI.register().catch(console.error);
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return <Home />;
  }

  const handleNavigateToChat = (linkId) => {
    setCurrentLinkId(linkId);
    setCurrentPage('chat');
  };

  const handleBackToDashboard = () => {
    setCurrentLinkId(null);
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard onNavigateToChat={handleNavigateToChat} />
      )}
      {currentPage === 'chat' && (
        <Chat 
          onBackToDashboard={handleBackToDashboard} 
          linkId={currentLinkId}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;