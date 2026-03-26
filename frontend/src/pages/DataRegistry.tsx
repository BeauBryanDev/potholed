import React, { useState, useEffect } from 'react';
import { Database, Map, MapPin, Plus, Trash2, Activity, ShieldAlert } from 'lucide-react';
import townService, { TownResponse, TownCreate } from '../services/townService';
import streetService, { StreetResponse, StreetCreate } from '../services/streetService';
import { useAuth } from '../hooks/useAuth';

type Tab = 'towns' | 'streets';

const DataRegistry: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('towns');
  const [towns, setTowns] = useState<TownResponse[]>([]);
  const [streets, setStreets] = useState<StreetResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Form State (Admin Only) ---
  const [newTown, setNewTown] = useState<TownCreate>({ name: '', province: '', country: '', code: '' });
  const [newStreet, setNewStreet] = useState<StreetCreate>({ name: '', town_id: 0, segment: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Data Fetching ---
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [townsData, streetsData] = await Promise.all([
        townService.getTowns(),
        streetService.getStreets()
      ]);
      setTowns(townsData);
      setStreets(streetsData);
      
      // Set default town_id for street form if towns exist
      if (townsData.length > 0) setNewStreet(prev => ({ ...prev, town_id: townsData[0].id }));
    } catch (err) {
      console.error('[Registry] Fetch Error:', err);
      setError('DATA_STREAM_INTERRUPTED // UNABLE TO FETCH REGISTRY');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers: Towns ---
  const handleCreateTown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      await townService.createTown(newTown);
      setNewTown({ name: '', province: '', country: '', code: '' });
      await loadData(); // Reload to get new ID
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_WRITE_TOWN_DATA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTown = async (id: number) => {
    if (!isAdmin || !window.confirm('WARNING: PERMANENT DELETION. PROCEED?')) return;
    try {
      await townService.deleteTown(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'DELETION_FAILED // INTEGRITY_LOCKED');
    }
  };

  // --- Handlers: Streets ---
  const handleCreateStreet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      await streetService.createStreet({
        ...newStreet,
        town_id: Number(newStreet.town_id) // Ensure it's a number
      });
      setNewStreet({ name: '', town_id: towns.length > 0 ? towns[0].id : 0, segment: '' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_WRITE_STREET_DATA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStreet = async (id: number) => {
    if (!isAdmin || !window.confirm('WARNING: PERMANENT DELETION. PROCEED?')) return;
    try {
      await streetService.deleteStreet(id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'DELETION_FAILED // INTEGRITY_LOCKED');
    }
  };

  // Helper to map town_id to town name
  const getTownName = (id: number) => towns.find(t => t.id === id)?.name || `ID:${id}`;

  return (
    <div className="flex flex-col gap-6 font-mono text-gray-300 h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red flex items-center">
            <Database className="mr-3 w-6 h-6" /> Data_Registry_Core
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            Access_Level: {isAdmin ? 'ADMINISTRATOR' : 'STANDARD_AGENT'} // Module: Spatial_Hierarchy
          </p>
        </div>
      </div>

      {error && (
        <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start shrink-0">
          <ShieldAlert className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-cyber-red/20 shrink-0">
        <button
          onClick={() => setActiveTab('towns')}
          className={`flex items-center px-4 py-2 uppercase tracking-widest text-xs transition-colors ${activeTab === 'towns' ? 'text-cyber-red border-b-2 border-cyber-red bg-cyber-red/10' : 'text-gray-500 hover:text-cyber-red hover:bg-cyber-red/5'}`}
        >
          <Map className="w-4 h-4 mr-2" /> Municipalities
        </button>
        <button
          onClick={() => setActiveTab('streets')}
          className={`flex items-center px-4 py-2 uppercase tracking-widest text-xs transition-colors ${activeTab === 'streets' ? 'text-cyber-red border-b-2 border-cyber-red bg-cyber-red/10' : 'text-gray-500 hover:text-cyber-red hover:bg-cyber-red/5'}`}
        >
          <MapPin className="w-4 h-4 mr-2" /> Street_Sectors
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row gap-6">
        
        {/* Main Table Area */}
        <div className="flex-1 bg-cyber-black border border-cyber-red/30 p-4 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4 border-b border-cyber-red/20 pb-2">
             <h2 className="text-sm uppercase tracking-widest text-cyber-red">
               {activeTab === 'towns' ? '> Registered_Towns' : '> Registered_Streets'}
             </h2>
             <span className="text-[10px] text-gray-500">Total: {activeTab === 'towns' ? towns.length : streets.length}</span>
          </div>

          {isLoading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-cyber-red">
               <Activity className="w-8 h-8 animate-spin mb-4" />
               <p className="animate-pulse tracking-widest uppercase text-xs">Querying_Database...</p>
             </div>
          ) : (
             <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-red scrollbar-track-cyber-black pr-2">
               <table className="w-full text-left text-xs text-gray-400">
                 <thead className="uppercase tracking-widest bg-cyber-red/10 text-cyber-red sticky top-0">
                   {activeTab === 'towns' ? (
                     <tr>
                       <th className="p-3 font-normal border-b border-cyber-red/30">ID</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Name</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Province</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Country</th>
                       {isAdmin && <th className="p-3 font-normal border-b border-cyber-red/30 text-right">Actions</th>}
                     </tr>
                   ) : (
                     <tr>
                       <th className="p-3 font-normal border-b border-cyber-red/30">ID</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Street_Name</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Town</th>
                       <th className="p-3 font-normal border-b border-cyber-red/30">Segment</th>
                       {isAdmin && <th className="p-3 font-normal border-b border-cyber-red/30 text-right">Actions</th>}
                     </tr>
                   )}
                 </thead>
                 <tbody className="divide-y divide-cyber-red/10">
                   {activeTab === 'towns' ? (
                     towns.map(t => (
                       <tr key={t.id} className="hover:bg-cyber-red/5 transition-colors">
                         <td className="p-3">{t.id}</td>
                         <td className="p-3 text-gray-200">{t.name}</td>
                         <td className="p-3">{t.province || '--'}</td>
                         <td className="p-3">{t.country || '--'}</td>
                         {isAdmin && (
                           <td className="p-3 text-right">
                             <button onClick={() => handleDeleteTown(t.id)} className="text-gray-500 hover:text-[#ff0000] transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </td>
                         )}
                       </tr>
                     ))
                   ) : (
                     streets.map(s => (
                       <tr key={s.id} className="hover:bg-cyber-red/5 transition-colors">
                         <td className="p-3">{s.id}</td>
                         <td className="p-3 text-gray-200">{s.name}</td>
                         <td className="p-3">{getTownName(s.town_id)}</td>
                         <td className="p-3">{s.segment || '--'}</td>
                         {isAdmin && (
                           <td className="p-3 text-right">
                             <button onClick={() => handleDeleteStreet(s.id)} className="text-gray-500 hover:text-[#ff0000] transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </td>
                         )}
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          )}
        </div>

        {/* Admin Input Panel (Only visible if user.is_admin === true) */}
        {isAdmin && (
          <div className="xl:w-80 bg-[#0a0a0a] border border-cyber-red/40 p-5 shrink-0 h-fit">
            <h3 className="text-xs uppercase tracking-[0.2em] text-cyber-red mb-4 flex items-center border-b border-cyber-red/20 pb-2">
              <Plus className="w-4 h-4 mr-2" /> 
              {activeTab === 'towns' ? 'Inject_Town_Record' : 'Inject_Street_Record'}
            </h3>

            {activeTab === 'towns' ? (
              <form onSubmit={handleCreateTown} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Name</label>
                  <input type="text" required value={newTown.name} onChange={e => setNewTown({...newTown, name: e.target.value})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Province (Opt)</label>
                  <input type="text" value={newTown.province} onChange={e => setNewTown({...newTown, province: e.target.value})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Country (Opt)</label>
                  <input type="text" value={newTown.country} onChange={e => setNewTown({...newTown, country: e.target.value})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-3 mt-4 hover:bg-cyber-red hover:text-black transition-all">
                  {isSubmitting ? 'Executing...' : 'Commit_Record'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateStreet} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Street_Name</label>
                  <input type="text" required value={newStreet.name} onChange={e => setNewStreet({...newStreet, name: e.target.value})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" placeholder="e.g. AKR 7ma" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Parent_Town</label>
                  <select required value={newStreet.town_id} onChange={e => setNewStreet({...newStreet, town_id: parseInt(e.target.value)})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors">
                    <option value={0} disabled>-- Select Town --</option>
                    {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-gray-500 tracking-widest">Segment (Opt)</label>
                  <input type="text" value={newStreet.segment} onChange={e => setNewStreet({...newStreet, segment: e.target.value})} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors" placeholder="e.g. North Sector" />
                </div>
                <button type="submit" disabled={isSubmitting || towns.length === 0} className="w-full border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-3 mt-4 hover:bg-cyber-red hover:text-black transition-all disabled:opacity-50">
                  {isSubmitting ? 'Executing...' : 'Commit_Record'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default DataRegistry;