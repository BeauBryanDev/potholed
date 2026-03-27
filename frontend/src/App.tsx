import React , { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import { AdminRoute } from './components/AdminRoute';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from  './pages/Dashboard';
import YoloScanner from './pages/YoloScanner';
import IntelMap from './pages/IntelMap';
import DataRegistry from './pages/DataRegistry';
import DetectionLogs from './pages/DetectionLogs';
import UserProfile from './pages/UserProfile';
import AdminConsole from './pages/AdminConsole';  



//const Dashboard = lazy(() => import('./pages/Dashboard'));
//const IntelMap = lazy(() => import('./pages/IntelMap'));
//const YoloScanner = lazy(() => import('./pages/YoloScanner'));

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}

const FallbackLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center font-mono text-cyber-red bg-cyber-black min-h-screen">
    <div className="scanline" />
    <p className="animate-pulse tracking-widest uppercase">Downloading_Module...</p>
  </div>
);

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle }) => {
  return (
    <div className="min-h-full bg-cyber-black border border-cyber-red/20 p-8 font-mono text-cyber-red shadow-[0_0_20px_rgba(255,0,0,0.08)]">
      <p className="text-xs uppercase tracking-[0.3em] text-cyber-red-dim mb-4">
        Module_Standby
      </p>
      <h1 className="text-3xl font-bold uppercase tracking-[0.18em] mb-4">{title}</h1>
      <p className="text-sm text-gray-400 tracking-widest">{subtitle}</p>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard"  />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scanner" element={<YoloScanner />} />
              <Route path="/map" element={<IntelMap />} />
              <Route path="/registry" element={<DataRegistry />} />
              <Route  path="/detections" element={<DetectionLogs />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminConsole />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};


export default App;
