import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';


const TempDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-cyber-black flex flex-col items-center justify-center text-cyber-red font-mono relative overflow-hidden">
      <div className="scanline" />
      <h1 className="text-4xl font-bold tracking-[0.2em] uppercase mb-4 shadow-neon-red">
        HUD_DASHBOARD // ONLINE
      </h1>
      <p className="text-gray-400 tracking-widest mb-8">
        Welcome_Agent: {user?.username}
      </p>
      <button
        onClick={logout}
        className="border border-cyber-red px-6 py-2 hover:bg-cyber-red hover:text-black transition-all uppercase tracking-widest"
      >
        Terminate_Session
      </button>
    </div>
  );
};


interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}


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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<TempDashboard />} />
              <Route
                path="/scanner"
                element={<PlaceholderPage title="YOLO_Scanner" subtitle="Road image inference workspace will render here." />}
              />
              <Route
                path="/map"
                element={<PlaceholderPage title="Intel_Map" subtitle="Geo-visual analysis view will render here." />}
              />
              <Route
                path="/registry"
                element={<PlaceholderPage title="Data_Registry" subtitle="Road assets and metadata registry will render here." />}
              />
              <Route
                path="/detections"
                element={<PlaceholderPage title="Detections_Log" subtitle="Detection history and review tooling will render here." />}
              />
              <Route
                path="/profile"
                element={<PlaceholderPage title="User_Profile" subtitle="Authenticated user profile management will render here." />}
              />
              <Route
                path="/admin"
                element={<PlaceholderPage title="Admin_Console" subtitle="Administrative controls will render here." />}
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};


export default App;
