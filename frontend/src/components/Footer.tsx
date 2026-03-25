import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="h-8 bg-cyber-black border-t border-cyber-red/20 flex items-center px-6 font-mono text-[10px] uppercase tracking-widest text-gray-600 z-20 relative justify-between">
      <span>&gt; Core_System: Active</span>
      <span>&copy; 2026 Pothole_Guard_AI // Authorized_Personnel_Only</span>
      <span>Latency: 12ms</span>
    </footer>
  );
};

export default Footer;