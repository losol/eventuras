import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated, isAdmin, handleCallback } from './lib/auth';
import Dashboard from './routes/admin/Dashboard';
import Clients from './routes/admin/Clients';
import Login from './routes/Login';
import Callback from './routes/Callback';
import Home from './routes/Home';
import ErrorPage from './routes/Error';
import Interaction from './routes/interaction/Interaction';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access the admin panel.</p>
        <p>Only users with system administrator or admin reader roles can access this area.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/interaction/:uid" element={<Interaction />} />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
