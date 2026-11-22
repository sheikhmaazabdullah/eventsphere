import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';           // 🆕
import ProtectedRoute    from './components/common/ProtectedRoute';
import OnboardingTour    from './components/common/OnboardingTour'; // 🆕

// Public
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';

// Admin
import AdminDashboard   from './pages/admin/Dashboard';
import ExpoManagement   from './pages/admin/ExpoManagement';
import FloorPlanEditor  from './pages/admin/FloorPlanEditor';
import ExhibitorManager from './pages/admin/ExhibitorManager';
import SessionManager   from './pages/admin/SessionManager';
import Analytics        from './pages/admin/Analytics';

// Exhibitor
import ExhibitorDashboard from './pages/exhibitor/Dashboard';
import BoothManagement    from './pages/exhibitor/BoothManagement';
import ExhibitorProfile   from './pages/exhibitor/Profile';
import ExhibitorMessages  from './pages/exhibitor/Messages';
import LeadScanner        from './pages/exhibitor/LeadScanner';  // 🆕

// Attendee
import AttendeeDashboard from './pages/attendee/Dashboard';
import EventBrowse       from './pages/attendee/EventBrowse';
import SessionBooking    from './pages/attendee/SessionBooking';
import QRBadge           from './pages/attendee/QRBadge';
import AIRecommendations from './pages/attendee/AIRecommendations';
import VirtualTour       from './pages/attendee/VirtualTour';

export default function App() {
  return (
    <ThemeProvider>                {/* 🆕 */}
      <AuthProvider>
        <BrowserRouter>
          <OnboardingTour />      {/* 🆕 */}
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin"                          element={<AdminDashboard />} />
              <Route path="/admin/expos"                    element={<ExpoManagement />} />
              <Route path="/admin/expos/:expoId/floor"      element={<FloorPlanEditor />} />
              <Route path="/admin/expos/:expoId/exhibitors" element={<ExhibitorManager />} />
              <Route path="/admin/expos/:expoId/sessions"   element={<SessionManager />} />
              <Route path="/admin/analytics"                element={<Analytics />} />
            </Route>

            {/* Exhibitor */}
            <Route element={<ProtectedRoute roles={['exhibitor']} />}>
              <Route path="/exhibitor"                     element={<ExhibitorDashboard />} />
              <Route path="/exhibitor/booth/:expoId"       element={<BoothManagement />} />
              <Route path="/exhibitor/profile"             element={<ExhibitorProfile />} />
              <Route path="/exhibitor/messages"            element={<ExhibitorMessages />} />
              <Route path="/exhibitor/scanner/:expoId"     element={<LeadScanner />} />   {/* 🆕 */}
            </Route>

            {/* Attendee */}
            <Route element={<ProtectedRoute roles={['attendee']} />}>
              <Route path="/attendee"                          element={<AttendeeDashboard />} />
              <Route path="/attendee/events"                   element={<EventBrowse />} />
              <Route path="/attendee/sessions/:expoId"         element={<SessionBooking />} />
              <Route path="/attendee/badge/:expoId"            element={<QRBadge />} />
              <Route path="/attendee/recommendations/:expoId"  element={<AIRecommendations />} />
              <Route path="/attendee/tour/:expoId"             element={<VirtualTour />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}