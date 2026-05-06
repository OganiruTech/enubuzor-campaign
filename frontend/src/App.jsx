// src/App.jsx

import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ToastProvider from '@/lib/ToastProvider';
import CampaignLayout from './components/layout/CampaignLayout';
import Home from './pages/Home';
import CommunityIssues from './pages/CommunityIssues';
import VolunteerSignup from './pages/VolunteerSignup';
import Event from './pages/Event';
import Media from './pages/Media';
import Donate from './pages/Donate';
import Chart from './pages/Chart';
import Admin from './pages/Admin';

// This is a public campaign site — all routes are accessible without login.
// Auth is only used to gate the /admin page (checked inside Admin.jsx itself).
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ToastProvider>
        <Router>
          <Routes>
            <Route element={<CampaignLayout />}>
              <Route path="/"          element={<Home />} />
              <Route path="/issues"    element={<CommunityIssues />} />
              <Route path="/volunteer" element={<VolunteerSignup />} />
              <Route path="/events"    element={<Event />} />
              <Route path="/media"     element={<Media />} />
              <Route path="/donate"    element={<Donate />} />
              <Route path="/chat"      element={<Chart />} />
              <Route path="/admin"     element={<Admin />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        </ToastProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;