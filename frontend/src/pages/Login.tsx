import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Terminal, ShieldAlert, Lock, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const getLoginErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        return 'Invalid username or password.';
      }

      if (err.response?.data?.detail) {
        return String(err.response.data.detail);
      }

      if (err.request) {
        return 'Unable to reach the backend. Check that the API is running and that CORS is configured for the frontend origin.';
      }
    }

    return 'Login failed due to an unexpected error. Please try again.';
  };

  /**
   * Handles the form submission, triggers authentication,
   * and manages loading/error states.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // FastAPI expects username, but your backend accepts email in this field too
      await login(username, password);
      navigate('/dashboard', { replace: true });
      console.log('[Auth] Access Granted. JWT Stored.');
    } catch (err: unknown) {
      console.error('[Auth] Access Denied:', err);
      setErrorMsg(getLoginErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background Grid & Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="scanline" />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md bg-cyber-black border border-cyber-red/40 p-8 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 border-b border-cyber-red/30 pb-4">
          <ShieldAlert className="text-cyber-red w-12 h-12 mb-2 animate-pulse" />
          <h1 className="text-cyber-red text-2xl font-bold tracking-[0.2em] uppercase">
            Pothole_Guard
          </h1>
          <p className="text-cyber-red-dim text-xs tracking-widest mt-1">
            v1.0.0 // RESTRICTED_AREA
          </p>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="mb-6 border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start">
            <Terminal className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-cyber-red text-xs uppercase tracking-wider">{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username / Email Input */}
          <div className="space-y-2">
            <label className="text-gray-500 text-xs uppercase tracking-widest flex items-center">
              <UserIcon className="w-3 h-3 mr-2" /> Identification_String
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-3 focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all placeholder-gray-700"
              placeholder="Enter Username or Email"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-gray-500 text-xs uppercase tracking-widest flex items-center">
              <Lock className="w-3 h-3 mr-2" /> Security_Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-3 focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all placeholder-gray-700"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full border border-cyber-red text-cyber-red uppercase tracking-[0.3em] font-bold p-4 mt-4 transition-all duration-300 hover:bg-cyber-red hover:text-black hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Authenticating...' : 'Initialize_Session'}
          </button>
        </form>

        {/* Navigation Links */}
        <div className="mt-8 pt-4 border-t border-cyber-red/20 flex flex-col space-y-2 text-center text-xs">
          <a href="/forgot-password" className="text-gray-500 hover:text-cyber-red transition-colors cursor-pointer uppercase tracking-widest">
            &gt; Bypass_Security (Forgot Password?)
          </a>
          <a href="/register" className="text-gray-500 hover:text-cyber-red transition-colors cursor-pointer uppercase tracking-widest">
            &gt; Request_Access (Register)
          </a>
        </div>

      </div>
    </div>
  );
};

export default Login;
