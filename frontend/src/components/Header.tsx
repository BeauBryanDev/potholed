import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

/**
 * Header Component Props
 * @property {string} [title] - Header title (default: "Pothole_Guard // HUD")
 * @property {ReactNode} [logo] - Custom logo element (default: Activity icon)
 * @property {ReactNode} [rightContent] - Custom right side content
 * @property {boolean} [showLogout] - Show logout button (default: true)
 * @property {boolean} [showUserInfo] - Show user information (default: true)
 * @property {string} [className] - Additional CSS classes
 * @property {Function} [onLogout] - Custom logout handler (default: useAuth logout)
 */
interface HeaderProps {
  title?: string;
  logo?: ReactNode;
  rightContent?: ReactNode;
  showLogout?: boolean;
  showUserInfo?: boolean;
  className?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = "Pothole_Guard // HUD",
  logo = <Activity className="text-cyber-red animate-pulse w-5 h-5" />,
  rightContent,
  showLogout = true,
  showUserInfo = true,
  className = "",
  onLogout,
}) => {
  const { user, logout } = useAuth();
  const handleLogout = onLogout || logout;

  return (
    <header className={`h-16 bg-cyber-black border-b border-cyber-red/30 flex items-center justify-between px-6 font-mono z-20 relative ${className}`}>
      {/* Left Section - Logo & Title */}
      <div className="flex items-center space-x-4">
        {logo}
        <span className="text-cyber-red font-bold tracking-[0.2em] uppercase text-sm">
          {title}
        </span>
      </div>

      {/* Right Section - User Info & Logout */}
      {rightContent ? (
        rightContent
      ) : (
        <div className="flex items-center space-x-6">
          {showUserInfo && (
            <div className="flex flex-col text-right">
              <span className="text-gray-400 text-xs tracking-widest flex items-center justify-end">
                <UserIcon className="w-3 h-3 mr-2" />
                Agent: {user?.username || 'UNKNOWN'}
              </span>
              <span className="text-green-500 text-[10px] uppercase tracking-widest">
                Network: Connected
              </span>
            </div>
          )}
          
          {showLogout && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-cyber-red hover:bg-cyber-red/10 border border-transparent hover:border-cyber-red/50 transition-all rounded-sm"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;