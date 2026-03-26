import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Crosshair, Map as MapIcon, Database, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Define navigation modules
  const navItems = [
    { path: '/dashboard', label: 'Main_Dashboard', icon: LayoutDashboard },
    { path: '/scanner', label: 'YOLO_Scanner', icon: Crosshair },
    { path: '/map', label: 'Intel_Map', icon: MapIcon },
    { path: '/registry', label: 'Data_Registry', icon: Database },
    { path: '/detections', label: 'Detections_Log', icon: Database },
    { path : '/profile', label: 'User_Profile', icon: Database },
  ];

  return (
    <aside className="w-64 bg-cyber-black border-r border-cyber-red/30 h-screen flex flex-col font-mono relative z-20">
      <div className="p-6 border-b border-cyber-red/30">
        <h2 className="text-cyber-red font-bold text-lg tracking-widest uppercase">
          Menu_Sys
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 transition-all uppercase tracking-wider text-xs ${
                isActive
                  ? 'bg-cyber-red/20 text-cyber-red border-l-2 border-cyber-red shadow-[inset_4px_0_10px_rgba(255,0,0,0.2)]'
                  : 'text-gray-500 hover:text-cyber-red hover:bg-cyber-red/5'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Only Section */}
        {user?.is_admin && (
          <div className="pt-4 mt-4 border-t border-cyber-red/20">
            <p className="text-[10px] text-cyber-red-dim mb-2 uppercase tracking-widest px-3">
              Admin_Override
            </p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 transition-all uppercase tracking-wider text-xs ${
                  isActive
                    ? 'bg-cyber-red/20 text-cyber-red border-l-2 border-cyber-red'
                    : 'text-gray-500 hover:text-cyber-red hover:bg-cyber-red/5'
                }`
              }
            >
              <Shield className="w-4 h-4" />
              <span>Access_Control</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
