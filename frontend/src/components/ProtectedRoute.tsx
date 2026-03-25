import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';


export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a cyberpunk loading state while checking the token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center font-mono text-cyber-red relative overflow-hidden">
        <div className="scanline" />
        <p className="animate-pulse tracking-widest uppercase">
          &gt; Decrypting_Token...
        </p>
      </div>
    );
  }

  // Route protection logic
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};