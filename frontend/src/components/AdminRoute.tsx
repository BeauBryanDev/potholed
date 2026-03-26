import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';


export const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center font-mono text-cyber-red relative overflow-hidden">
        <div className="scanline" />
        <p className="animate-pulse tracking-widest uppercase">
          &gt; Validating_Admin_Clearance...
        </p>
      </div>
    );
  }

  return user?.is_admin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
