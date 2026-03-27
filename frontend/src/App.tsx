import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import { AdminRoute } from './components/AdminRoute';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import YoloScanner from './pages/YoloScanner';
import IntelMap from './pages/IntelMap';
import DataRegistry from './pages/DataRegistry';
import DetectionLogs from './pages/DetectionLogs';
import UserProfile from './pages/UserProfile';
import AdminConsole from './pages/AdminConsole';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scanner" element={<YoloScanner />} />
              <Route path="/map" element={<IntelMap />} />
              <Route path="/registry" element={<DataRegistry />} />
              <Route path="/detections" element={<DetectionLogs />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminConsole />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
