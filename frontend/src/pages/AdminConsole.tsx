import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Plus, Trash2, Activity, Terminal, Lock, UserCheck, Shield, Edit, X, Check, Search, Power, Settings } from 'lucide-react';
import userService, { UserResponse, UserUpdate } from '../services/userService';
import { useAuth } from '../hooks/useAuth';


const AdminConsole: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.is_admin === true;

  // --- State Management ---
  const [agents, setAgents] = useState<UserResponse[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- CRUD State ---
  const [newAgent, setNewAgent] = useState<UserUpdate & { username: string; email: string }>({
    username: '',
    email: '',
    password: '',
    name: ''
  });

  const [editingAgent, setEditingAgent] = useState<UserResponse | null>(null);

  // --- Data Fetching ---
  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllByAdmin();
      setAgents(data);
      setFilteredAgents(data);
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

  // --- Filtering ---
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = agents.filter(a =>
      a.username.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.name && a.name.toLowerCase().includes(term))
    );
    setFilteredAgents(filtered);
  }, [searchTerm, agents]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingAgent) {
      setEditingAgent({ ...editingAgent, [e.target.name]: e.target.value });
    } else {
      setNewAgent({ ...newAgent, [e.target.name]: e.target.value });
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.createByAdmin(newAgent);
      setSuccess(`AGENT_PROVISIONED // ${newAgent.username} ADDED TO NETWORK`);
      setNewAgent({ username: '', email: '', password: '', name: '' });
      await fetchAgents();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'PROVISIONING_FAILED // CHECK_CREDENTIAL_DUPLICATION');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const updateData: any = {
        name: editingAgent.name,
        email: editingAgent.email,
        is_active: editingAgent.is_active,
        is_admin: editingAgent.is_admin
      };

      // Only include password if provided
      if ((editingAgent as any).password) {
        updateData.password = (editingAgent as any).password;
      }

      await userService.updateByAdmin(editingAgent.id, updateData);
      setSuccess(`AGENT_MODIFIED // ${editingAgent.username} UPDATED`);
      setEditingAgent(null);
      await fetchAgents();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'MODIFICATION_FAILED');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgentStatus = async (agent: UserResponse) => {
    if (agent.id === currentUser?.id) return;
    try {
      await userService.updateByAdmin(agent.id, { is_active: !agent.is_active });
      await fetchAgents();
    } catch (err) {
      console.error('Failed to toggle status');
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

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-cyber-red min-h-[80vh] bg-black">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-cyber-red/20 blur-3xl animate-pulse"></div>
          <Lock className="w-24 h-24 relative z-10 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
        </div>
        <h1 className="text-4xl font-black tracking-[0.4em] uppercase mb-4 text-cyber-red shadow-neon-red">Access_Denied</h1>
        <div className="border-2 border-cyber-red/50 bg-cyber-red/5 px-8 py-4 mt-6 backdrop-blur-md">
          <p className="tracking-[0.3em] uppercase text-xs font-black">
            CRITICAL: SECURITY_CLEARANCE_LVL_9_REQUIRED
          </p>
        </div>
        <p className="mt-8 text-gray-700 text-[10px] uppercase tracking-widest animate-pulse font-bold">&gt; UNIDENTIFIED_HANDSHAKE_DETECTED // REPORTING_TO_GLOBAL_SECURITY</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 h-full relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-[-1]"></div>

      {/* Header HUD */}
      <div className="flex justify-between items-end border-b-2 border-cyber-red/40 pb-6 shrink-0 relative">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-cyber-red shadow-[0_0_10px_#ff0000]"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] flex items-center">
            <ShieldAlert className="mr-5 w-8 h-8 text-cyber-red" /> Mainframe_Command_Center
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-black uppercase opacity-90 flex items-center">
            <Activity className="w-4 h-4 mr-2 animate-pulse text-cyber-neon" />
            System_Override: <span className="text-gray-100 ml-2">ACTIVE_ROOT_SESSION</span>
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-6 bg-cyber-black/80 border border-cyber-red/20 px-6 py-3 backdrop-blur-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Verified_Network_Nodes</span>
            <span className="text-cyber-red text-xl font-black">{agents.length.toString().padStart(3, '0')}</span>
          </div>
          <div className="w-px h-8 bg-cyber-red/20"></div>
          <Settings className="w-6 h-6 text-cyber-red animate-spin-slow" />
        </div>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className={`border-2 p-4 flex items-start shrink-0 relative overflow-hidden animate-alert-flash ${error ? 'border-cyber-red/50 bg-cyber-red/5' : 'border-cyber-neon/50 bg-cyber-neon/5'}`}>
          <div className={`absolute top-0 left-0 w-1.5 h-full ${error ? 'bg-cyber-red' : 'bg-cyber-neon'}`}></div>
          <Terminal className={`${error ? 'text-cyber-red' : 'text-cyber-neon'} w-5 h-5 mr-4 flex-shrink-0`} />
          <p className={`${error ? 'text-cyber-red' : 'text-cyber-neon'} text-xs uppercase font-black tracking-widest leading-relaxed`}>{error || success}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row gap-8">

        {/* Roster Terminal (Main Area) */}
        <div className="flex-1 bg-cyber-black/80 border border-cyber-red/30 p-6 flex flex-col overflow-hidden relative backdrop-blur-sm shadow-2xl">
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyber-red/30"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyber-red/30"></div>

          {/* Search & Utility Bar */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-cyber-red/10 pb-4">
            <h2 className="text-sm uppercase tracking-[0.4em] font-black text-cyber-red flex items-center">
              <Users className="w-5 h-5 mr-3 text-cyber-neon" /> Agent_Sector_Registry
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-red/50" />
              <input
                type="text"
                placeholder="FILTER_BY_DESIGNATION_OR_COMM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 pl-10 text-[10px] focus:outline-none focus:border-cyber-neon focus:bg-cyber-neon/5 transition-all uppercase tracking-widest placeholder:text-gray-700"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-cyber-red">
              <Activity className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
              <p className="animate-pulse tracking-[0.6em] text-sm font-black uppercase">Decrypting_User_Biometrics...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <table className="w-full text-left font-mono">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-cyber-red/10 text-cyber-red text-[10px] uppercase tracking-[0.4em] font-black border-b border-cyber-red/20">
                    <th className="p-4 border-b border-cyber-red/30">ID</th>
                    <th className="p-4 border-b border-cyber-red/30">Designation</th>
                    <th className="p-4 border-b border-cyber-red/30">Comm_Link</th>
                    <th className="p-4 border-b border-cyber-red/30 text-center">Protocol</th>
                    <th className="p-4 border-b border-cyber-red/30 text-center">Status</th>
                    <th className="p-4 border-b border-cyber-red/30 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredAgents.map(agent => (
                    <tr key={agent.id} className="border-b border-cyber-red/5 hover:bg-cyber-red/5 transition-all group">
                      <td className="p-4 text-gray-600 font-bold tracking-tighter">#{agent.id.toString().padStart(3, '0')}</td>
                      <td className="p-4">
                        <p className="text-gray-100 font-black tracking-widest uppercase group-hover:text-cyber-neon transition-colors">{agent.username}</p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase">{agent.name || '-- UNNAMED --'}</p>
                      </td>
                      <td className="p-4 text-gray-400 font-bold tracking-widest uppercase">{agent.email}</td>
                      <td className="p-4 text-center">
                        {agent.is_admin ? (
                          <span className="inline-flex items-center text-cyber-neon border border-cyber-neon/30 bg-cyber-neon/5 px-3 py-1 font-black text-[9px] tracking-widest uppercase shadow-[0_0_10px_rgba(0,255,185,0.1)]">
                            <Shield className="w-3 h-3 mr-2" /> Global_Root
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-500 border border-gray-700 bg-gray-900/50 px-3 py-1 font-black text-[9px] tracking-widest uppercase">
                            <UserCheck className="w-3 h-3 mr-2" /> 0perator
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleAgentStatus(agent)}
                          disabled={agent.id === currentUser?.id}
                          className={`group relative flex items-center justify-center w-full max-w-[120px] mx-auto py-1 px-3 border border-current transition-all text-[9px] font-black tracking-widest disabled:opacity-30 ${agent.is_active ? 'text-green-500 hover:bg-green-500 hover:text-black' : 'text-red-600 hover:bg-red-600 hover:text-black'
                            }`}
                        >
                          <Power className="w-3 h-3 mr-2 group-hover:rotate-90 transition-transform" />
                          {agent.is_active ? 'ACTIVE_SYNC' : 'SUSPENDED'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingAgent(agent); setSuccess(null); }}
                            className="p-2 text-gray-600 hover:text-cyber-neon transition-all hover:scale-110"
                            title="Modify Agent"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {agent.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteAgent(agent.id, agent.username)}
                              className="p-2 text-gray-600 hover:text-[#ff0000] transition-all hover:scale-110"
                              title="Terminate Agent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tactical Provisioning / Modification Terminal */}
        <div className="xl:w-96 bg-cyber-black border-2 border-cyber-red/40 p-6 flex flex-col relative shadow-[0_0_20px_rgba(255,0,0,0.1)] backdrop-blur-sm h-fit">
          <div className="absolute top-[-2px] left-[-2px] right-[-2px] h-[2.5px] bg-cyber-red shadow-[0_0_15px_#ff0000]"></div>

          <h3 className="text-sm uppercase tracking-[0.3em] font-black text-cyber-red mb-6 flex items-center border-b border-cyber-red/20 pb-4">
            {editingAgent ? (
              <><Edit className="w-5 h-5 mr-3" /> Modifying_Agent_Clearance</>
            ) : (
              <><Plus className="w-5 h-5 mr-3 text-cyber-neon" /> Provison_New_Neural_Link</>
            )}
          </h3>

          <form onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Authorized_Designation</label>
              <input
                type="text" name="username" required
                value={editingAgent ? editingAgent.username : newAgent.username}
                onChange={handleInputChange}
                disabled={!!editingAgent}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all text-xs uppercase tracking-widest disabled:opacity-30"
                placeholder="USER_001"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Secure_Comm_Channel (Email)</label>
              <input
                type="email" name="email" required
                value={editingAgent ? editingAgent.email : newAgent.email}
                onChange={handleInputChange}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all text-xs tracking-widest"
                placeholder="agent@potholed.hq"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Security_Keyphrase (Password)</label>
              <input
                type="password" name="password"
                required={!editingAgent}
                value={(editingAgent as any)?.password || newAgent.password}
                onChange={handleInputChange}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all text-xs tracking-widest"
                placeholder={editingAgent ? "Leave blank to keep current" : "Minimum 8 chars"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Legal_Alias (Full Name)</label>
              <input
                type="text" name="name"
                value={editingAgent ? (editingAgent.name || '') : newAgent.name}
                onChange={handleInputChange}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all text-xs uppercase tracking-widest"
                placeholder="John Matrix"
              />
            </div>

            {editingAgent && (
              <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-cyber-red/10">
                <button
                  type="button"
                  onClick={() => setEditingAgent({ ...editingAgent, is_admin: !editingAgent.is_admin })}
                  className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${editingAgent.is_admin ? 'border-cyber-neon bg-cyber-neon/10 text-cyber-neon shadow-[0_0_10px_rgba(0,255,185,0.2)]' : 'border-gray-800 text-gray-600'}`}
                >
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Admin_Clearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAgentStatus(editingAgent)}
                  className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${editingAgent.is_active ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-red-600 bg-red-600/10 text-red-600'}`}
                >
                  <Power className="w-5 h-5 mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{editingAgent.is_active ? 'Status: Active' : 'Status: Suspended'}</span>
                </button>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="submit" disabled={isSubmitting}
                className="flex-1 border-2 border-cyber-red bg-cyber-red/10 text-cyber-red font-black py-4 uppercase tracking-[0.3em] text-[11px] hover:bg-cyber-red hover:text-black transition-all shadow-neon-red flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : (editingAgent ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                {editingAgent ? 'Update_Permissions' : 'Execute_Provisioning'}
              </button>
              {editingAgent && (
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="border-2 border-gray-600 text-gray-500 p-4 hover:bg-gray-800 transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Tactical Decoder Stats Decor */}
          <div className="mt-8 pt-6 border-t border-cyber-red/10 overflow-hidden relative opacity-30">
            <div className="text-[8px] text-gray-500 font-bold tracking-[0.4em] uppercase mb-2">Protocol_Decoder_Active...</div>
            <div className="flex gap-1">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-1.5 h-6 bg-cyber-red/20 relative">
                  <div className="absolute inset-x-0 bottom-0 bg-cyber-red" style={{ height: `${Math.random() * 100}%` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminConsole;
