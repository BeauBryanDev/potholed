import React, { useState } from 'react';
import { Terminal, 
      ShieldAlert,
      Lock, User as UserIcon,
      Mail, UserPlus ,
       MapPin } from 'lucide-react';
import authService, { RegisterData } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    username: '',
    email: '',
    password: '',
    gender: '',
    phone_number: '',
    city: '',
    country: '',
    address: '',
    
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic frontend validation
    if (formData.password !== confirmPassword) {
      setErrorMsg('SECURITY_MISMATCH // Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.register(formData);
      setSuccessMsg('USER_CREATED // Redirecting to login terminal...');
      
      // Redirect to login after a short delay for the cyberpunk effect
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('[Register] Creation Failed:', err);
      const message = err.response?.data?.detail || 'REGISTRATION_FAILED // SYSTEM_ERROR';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="scanline" />

      <div className="relative z-10 w-full max-w-md bg-cyber-black border border-cyber-red/40 p-8 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
        
        <div className="flex flex-col items-center mb-6 border-b border-cyber-red/30 pb-4">
          <UserPlus className="text-cyber-red w-10 h-10 mb-2" />
          <h1 className="text-cyber-red text-xl font-bold tracking-[0.2em] uppercase">
            New_Agent_Registration
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-4 border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start">
            <Terminal className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-cyber-red text-xs uppercase tracking-wider">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 border-l-4 border-green-500 bg-green-500/10 p-3 flex items-start">
            <Terminal className="text-green-500 w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-green-500 text-xs uppercase tracking-wider">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <UserIcon className="w-3 h-3 mr-1" /> Username
            </label>
            <input
              type="text" name="username" required value={formData.username} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <Mail className="w-3 h-3 mr-1" /> Comm_Link (Email)
            </label>
            <input
              type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <Lock className="w-3 h-3 mr-1" /> Security_Key
            </label>
            <input
              type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <Lock className="w-3 h-3 mr-1" /> Confirm_Key
            </label>
            <input
              type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Location
            </label>
            <input
              type="text" name="city" required value={formData.city} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Country
            </label>
            <input
              type="text" name="country" required value={formData.country} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-500 text-[10px] uppercase tracking-widest flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> Address
            </label>
            <input
              type="text" name="address" required value={formData.address} onChange={handleChange}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-sm focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all"
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className={`w-full border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-3 mt-2 transition-all hover:bg-cyber-red hover:text-black hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Execute_Registration'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-red/20 text-center text-xs">
          <a href="/login" className="text-gray-500 hover:text-cyber-red transition-colors uppercase tracking-widest">
            &lt; Return_to_Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;