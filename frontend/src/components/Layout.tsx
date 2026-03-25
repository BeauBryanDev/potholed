import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-cyber-black overflow-hidden relative">
      {/* Global Background Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      <div className="scanline pointer-events-none z-10" />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 relative z-20 overflow-hidden">
        <Header />
        
        {/* Dynamic View Injection */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyber-red scrollbar-track-cyber-black">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;