import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-cyber-black border-b border-cyber-red/30 flex items-center justify-between px-6 font-mono z-20 relative">
      <div className="flex items-center space-x-4">
        <Activity className="text-cyber-red animate-pulse w-5 h-5" />
        <span className="text-cyber-red font-bold tracking-[0.2em] uppercase text-sm">
          Pothole_Guard // HUD
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex flex-col text-right">
          <span className="text-gray-400 text-xs tracking-widest flex items-center justify-end">
            <UserIcon className="w-3 h-3 mr-2" />
            Agent: {user?.username || 'UNKNOWN'}
          </span>
          <span className="text-green-500 text-[10px] uppercase tracking-widest">
            Network: Connected
          </span>
        </div>
        
        <button
          onClick={logout}
          className="p-2 text-gray-500 hover:text-cyber-red hover:bg-cyber-red/10 border border-transparent hover:border-cyber-red/50 transition-all rounded-sm"
          title="Terminate Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;