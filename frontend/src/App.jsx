import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import HotelSearchPage from './pages/HotelSearchPage';
import ResortSearchPage from './pages/ResortSearchPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HotelAIAssistantPage from './pages/HotelAIAssistantPage';
import ResortAIAssistantPage from './pages/ResortAIAssistantPage';
import SanityAdminPage from './pages/SanityAdminPage';

// Scroll restoration component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          
          {/* New hotel-specific routes */}
          <Route path="/hotels/search" element={<HotelSearchPage />} />
          <Route path="/hotels/ai-assistant" element={<HotelAIAssistantPage />} />
          
          {/* New resort-specific routes */}
          <Route path="/resorts/search" element={<ResortSearchPage />} />
          <Route path="/resorts/ai-assistant" element={<ResortAIAssistantPage />} />
          {/* Admin */}
          <Route path="/admin" element={<SanityAdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
