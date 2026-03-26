import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Plus, Trash2, Activity, Terminal, Lock, UserCheck, Shield } from 'lucide-react';
import userService, { UserResponse, UserUpdate } from '../services/userService';
import { useAuth } from '../hooks/useAuth';


const AdminConsole: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.is_admin === true;

  // --- State Management ---
  const [agents, setAgents] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Form State ---
  const [newAgent, setNewAgent] = useState<UserUpdate & { username: string; email: string }>({
    username: '',
    email: '',
    password: '',
    name: ''
  });

  // --- Data Fetching ---
  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllByAdmin();
      setAgents(data);
    } catch (err: any) {
      console.error('[AdminConsole] Fetch Error:', err);
      setError('MAINFRAME_CONNECTION_REFUSED // UNABLE TO FETCH AGENT ROSTER');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAgents();
    }
  }, [isAdmin]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAgent({ ...newAgent, [e.target.name]: e.target.value });
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.createByAdmin(newAgent);
      setSuccess(`AGENT_PROVISIONED // ${newAgent.username} ADDED TO NETWORK`);
      setNewAgent({ username: '', email: '', password: '', name: '' }); // Reset form
      await fetchAgents(); // Refresh the grid
      
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'PROVISIONING_FAILED // CHECK_CREDENTIAL_DUPLICATION');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (id: number, username: string) => {
    if (id === currentUser?.id) {
      setError('CRITICAL_ERROR // CANNOT_TERMINATE_OWN_SESSION');
      return;
    }
    
    if (!window.confirm(`WARNING: PERMANENT DELETION OF AGENT [${username}]. PROCEED?`)) return;
    
    try {
      await userService.deleteByAdmin(id);
      setSuccess(`AGENT_TERMINATED // ${username} REMOVED FROM NETWORK`);
      await fetchAgents();
      
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'TERMINATION_FAILED // INTEGRITY_LOCKED');
    }
  };

  // --- Security Lockdown View ---
  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-cyber-red h-full bg-[#050000]">
        <Lock className="w-16 h-16 mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold tracking-[0.2em] uppercase mb-2">Access_Denied</h1>
        <p className="tracking-widest uppercase text-sm border border-cyber-red/50 bg-cyber-red/10 px-4 py-2 mt-4">
          SECURITY_CLEARANCE_LEVEL_9_REQUIRED
        </p>
      </div>
    );
  }

  // --- Main Admin View ---
  return (
    <div className="flex flex-col gap-6 font-mono text-gray-300 h-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red flex items-center">
            <ShieldAlert className="mr-3 w-6 h-6" /> Mainframe_Admin_Console
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            Global_Override: ENABLED // Module: Agent_Management
          </p>
        </div>
        <div className="bg-cyber-red/10 border border-cyber-red/30 px-4 py-2 text-xs uppercase tracking-widest">
          Active_Agents: <span className="text-cyber-red font-bold">{agents.length}</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start shrink-0">
          <Terminal className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="border-l-4 border-cyber-neon bg-cyber-neon/10 p-3 flex items-start shrink-0">
          <Terminal className="text-cyber-neon w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-neon text-xs uppercase tracking-wider">{success}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row gap-6">
        
        {/* Roster Table Area */}
        <div className="flex-1 bg-cyber-black border border-cyber-red/30 p-4 flex flex-col overflow-hidden relative">
          <h2 className="text-sm uppercase tracking-widest text-cyber-red mb-4 border-b border-cyber-red/20 pb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" /> Registered_Agents_Roster
          </h2>

          {isLoading ? (
            <div className="absolute inset-0 bg-cyber-black/80 z-10 flex flex-col items-center justify-center text-cyber-red">
              <Activity className="w-10 h-10 animate-spin mb-4" />
              <p className="animate-pulse tracking-widest uppercase text-xs">Decrypting_User_Database...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-red scrollbar-track-cyber-black pr-2">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="uppercase tracking-widest bg-cyber-red/10 text-cyber-red sticky top-0 z-20">
                  <tr>
                    <th className="p-3 font-normal border-b border-cyber-red/30">ID</th>
                    <th className="p-3 font-normal border-b border-cyber-red/30">Designation</th>
                    <th className="p-3 font-normal border-b border-cyber-red/30">Comm_Link</th>
                    <th className="p-3 font-normal border-b border-cyber-red/30">Clearance</th>
                    <th className="p-3 font-normal border-b border-cyber-red/30 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-red/10">
                  {agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-cyber-red/5 transition-colors">
                      <td className="p-3 text-gray-500">#{agent.id}</td>
                      <td className="p-3 text-gray-200 font-bold">{agent.username}</td>
                      <td className="p-3">{agent.email}</td>
                      <td className="p-3">
                        {agent.is_admin ? (
                          <span className="flex items-center text-cyber-neon"><Shield className="w-3 h-3 mr-1" /> ADMIN</span>
                        ) : (
                          <span className="flex items-center text-gray-500"><UserCheck className="w-3 h-3 mr-1" /> OPERATOR</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {agent.id !== currentUser?.id && (
                           <button 
                             onClick={() => handleDeleteAgent(agent.id, agent.username)} 
                             className="text-gray-600 hover:text-[#ff0000] transition-colors"
                             title="Terminate Agent"
                           >
                             <Trash2 className="w-4 h-4 inline-block" />
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Provisioning Form Area */}
        <div className="xl:w-80 bg-[#0a0a0a] border border-cyber-red/40 p-5 shrink-0 h-fit">
          <h3 className="text-xs uppercase tracking-[0.2em] text-cyber-red mb-4 flex items-center border-b border-cyber-red/20 pb-2">
            <Plus className="w-4 h-4 mr-2" /> Provision_New_Agent
          </h3>

          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Username</label>
              <input 
                type="text" name="username" required value={newAgent.username} onChange={handleInputChange} 
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Email</label>
              <input 
                type="email" name="email" required value={newAgent.email} onChange={handleInputChange} 
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Initial_Password</label>
              <input 
                type="password" name="password" required value={newAgent.password} onChange={handleInputChange} 
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Full_Name (Optional)</label>
              <input 
                type="text" name="name" value={newAgent.name} onChange={handleInputChange} 
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-3 mt-4 hover:bg-cyber-red hover:text-black transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Execute_Provisioning'}
            </button>
          </form>
          
          <div className="mt-4 pt-4 border-t border-cyber-red/20 text-[10px] text-gray-500 tracking-widest">
             <p>&gt; NOTE: New agents are provisioned with standard OPERATOR clearance by default.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminConsole;

