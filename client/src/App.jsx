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

  useEffect(() => {
    if (isSignedIn && user) {
      // Register user in backend
      authAPI.register().catch(console.error);
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return <Home />;
  }

  return (
    <>
      {currentPage === 'dashboard' && (
        <Dashboard onNavigateToChat={() => setCurrentPage('chat')} />
      )}
      {currentPage === 'chat' && (
        <Chat onBackToDashboard={() => setCurrentPage('dashboard')} />
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