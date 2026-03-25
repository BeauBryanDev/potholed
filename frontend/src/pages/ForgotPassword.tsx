import React, { useState } from 'react';
import { Terminal, ShieldAlert, Mail } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    setIsError(false);

    // Simulation of API call
    setTimeout(() => {
      // In a real scenario, it must call your API here:
      // await authService.requestPasswordReset(email);
      setIsError(false);
      setStatusMsg(`RESET_LINK_DISPATCHED // Check comm-link: ${email}`);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="scanline" />

      <div className="relative z-10 w-full max-w-md bg-cyber-black border border-cyber-red/40 p-8 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
        
        <div className="flex flex-col items-center mb-6 border-b border-cyber-red/30 pb-4">
          <ShieldAlert className="text-cyber-red w-10 h-10 mb-2" />
          <h1 className="text-cyber-red text-xl font-bold tracking-[0.2em] uppercase text-center">
            Security_Override
          </h1>
          <p className="text-gray-500 text-[10px] tracking-widest mt-2 text-center">
            Enter your registered comm-link to request a temporary access bypass token.
          </p>
        </div>

        {statusMsg && (
          <div className={`mb-6 border-l-4 p-3 flex items-start ${isError ? 'border-cyber-red bg-cyber-red/10 text-cyber-red' : 'border-green-500 bg-green-500/10 text-green-500'}`}>
            <Terminal className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs uppercase tracking-wider">{statusMsg}</p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-500 text-xs uppercase tracking-widest flex items-center">
              <Mail className="w-3 h-3 mr-2" /> Comm_Link
            </label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-3 focus:outline-none focus:border-cyber-red focus:shadow-[0_0_10px_rgba(255,0,0,0.3)] transition-all placeholder-gray-700"
              placeholder="agent@network.com"
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className={`w-full border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-3 mt-2 transition-all hover:bg-cyber-red hover:text-black hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'Transmitting...' : 'Initiate_Override'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-cyber-red/20 text-center text-xs">
          <a href="/login" className="text-gray-500 hover:text-cyber-red transition-colors uppercase tracking-widest">
            &lt; Abort_Override (Back to Login)
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;