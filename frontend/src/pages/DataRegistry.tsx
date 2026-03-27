import React, { useState, useEffect } from 'react';
import { Database, Map, MapPin, Plus, Trash2, Activity, ShieldAlert, Edit, X, Check, Crosshair } from 'lucide-react';
import townService, { TownResponse, TownCreate, TownUpdate } from '../services/townService';
import streetService, { StreetResponse, StreetCreate, StreetUpdate } from '../services/streetService';
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

  // --- CRUD State ---
  const [newTown, setNewTown] = useState<TownCreate>({ name: '', province: '', country: '', code: '' });
  const [newStreet, setNewStreet] = useState<StreetCreate>({ name: '', town_id: 0, segment: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Edit State ---
  const [editingTown, setEditingTown] = useState<TownResponse | null>(null);
  const [editingStreet, setEditingStreet] = useState<StreetResponse | null>(null);

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

      if (townsData.length > 0 && newStreet.town_id === 0) {
        setNewStreet(prev => ({ ...prev, town_id: townsData[0].id }));
      }
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
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_WRITE_TOWN_DATA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingTown) return;
    setIsSubmitting(true);
    try {
      const updateData: TownUpdate = {
        name: editingTown.name,
        province: editingTown.province,
        country: editingTown.country,
        code: editingTown.code
      };
      await townService.updateTown(editingTown.id, updateData);
      setEditingTown(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_UPDATE_TOWN');
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
        town_id: Number(newStreet.town_id)
      });
      setNewStreet({ name: '', town_id: towns.length > 0 ? towns[0].id : 0, segment: '' });
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_WRITE_STREET_DATA');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStreet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingStreet) return;
    setIsSubmitting(true);
    try {
      const updateData: StreetUpdate = {
        name: editingStreet.name,
        town_id: editingStreet.town_id,
        segment: editingStreet.segment
      };
      await streetService.updateStreet(editingStreet.id, updateData);
      setEditingStreet(null);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'FAILED_TO_UPDATE_STREET');
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

  const getTownName = (id: number) => towns.find(t => t.id === id)?.name || `ID:${id}`;

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 h-full relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-[-1]"></div>

      {/* Header HUD */}
      <div className="flex justify-between items-end border-b-2 border-cyber-red/40 pb-6 shrink-0 relative">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-cyber-red shadow-[0_0_10px_#ff0000]"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] flex items-center">
            <Database className="mr-5 w-8 h-8 text-cyber-red" /> Data_Registry_v.4
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-bold uppercase opacity-90 flex items-center">
            <Activity className="w-4 h-4 mr-2 animate-pulse text-cyber-neon" />
            Auth_Signal: <span className="text-gray-100 ml-2">{isAdmin ? 'ADMINISTRATOR' : 'FIELD_AGENT'}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-cyber-red/50 bg-cyber-red/5 p-4 flex items-start shrink-0 relative overflow-hidden animate-alert-flash">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-red"></div>
          <ShieldAlert className="text-cyber-red w-5 h-5 mr-4 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase font-black tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      {/* Primary HUD Tabs */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => { setActiveTab('towns'); setEditingTown(null); setEditingStreet(null); }}
          className={`group relative overflow-hidden px-8 py-3 uppercase tracking-[0.3em] font-black text-xs transition-all border-b-2 ${activeTab === 'towns' ? 'text-cyber-red border-cyber-red bg-cyber-red/10' : 'text-gray-600 border-transparent hover:text-cyber-red-dim'
            }`}
        >
          <div className="flex items-center">
            <Map className="w-4 h-4 mr-3" /> Municipalities
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('streets'); setEditingTown(null); setEditingStreet(null); }}
          className={`group relative overflow-hidden px-8 py-3 uppercase tracking-[0.3em] font-black text-xs transition-all border-b-2 ${activeTab === 'streets' ? 'text-cyber-red border-cyber-red bg-cyber-red/10' : 'text-gray-600 border-transparent hover:text-cyber-red-dim'
            }`}
        >
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-3" /> Street_Sectors
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col xl:flex-row gap-8">

        {/* Main Central Terminal (Table) */}
        <div className="flex-1 bg-cyber-black/80 border border-cyber-red/30 p-6 flex flex-col overflow-hidden relative backdrop-blur-sm">
          {/* Corner Elements */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-red/40"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-red/40"></div>

          <div className="flex justify-between items-center mb-6 border-b border-cyber-red/10 pb-4">
            <h2 className="text-sm uppercase tracking-[0.4em] font-black text-cyber-red flex items-center">
              <Crosshair className="w-4 h-4 mr-3 text-cyber-neon" />
              {activeTab === 'towns' ? 'Verified_Municipal_Entities' : 'Active_Street_Encrypted_Logs'}
            </h2>
            <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase bg-cyber-red/5 px-3 py-1 border border-cyber-red/10">
              Total_Nodes: {activeTab === 'towns' ? towns.length : streets.length}
            </span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-cyber-red">
              <Activity className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
              <p className="animate-pulse tracking-[0.6em] text-sm font-black uppercase">Decrypting_Registry_Data...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              <table className="w-full text-left font-mono">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-cyber-red/10 text-cyber-red text-[10px] uppercase tracking-[0.3em] font-black">
                    {activeTab === 'towns' ? (
                      <>
                        <th className="p-4 border-b border-cyber-red/30">ID</th>
                        <th className="p-4 border-b border-cyber-red/30">Name</th>
                        <th className="p-4 border-b border-cyber-red/30">Province</th>
                        <th className="p-4 border-b border-cyber-red/30">Country</th>
                        {isAdmin && (
                          <>
                            <th className="p-4 border-b border-cyber-red/30 text-center">Edit</th>
                            <th className="p-4 border-b border-cyber-red/30 text-center">Delete</th>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <th className="p-4 border-b border-cyber-red/30">ID</th>
                        <th className="p-4 border-b border-cyber-red/30">Name</th>
                        <th className="p-4 border-b border-cyber-red/30">Town</th>
                        <th className="p-4 border-b border-cyber-red/30">Segment</th>
                        {isAdmin && (
                          <>
                            <th className="p-4 border-b border-cyber-red/30 text-center">Edit</th>
                            <th className="p-4 border-b border-cyber-red/30 text-center">Delete</th>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {(activeTab === 'towns' ? towns : streets).map((item: any) => (
                    <tr key={item.id} className="border-b border-cyber-red/5 hover:bg-cyber-red/5 transition-all group">
                      <td className="p-4 text-gray-600 font-bold tracking-tighter">#{item.id.toString().padStart(3, '0')}</td>
                      <td className="p-4 text-gray-100 font-black tracking-wide uppercase group-hover:text-cyber-neon transition-colors">
                        {activeTab === 'streets' ? item.name : item.name}
                      </td>
                      <td className="p-4 text-gray-400 font-bold uppercase tracking-widest">
                        {activeTab === 'towns' ? (item.province || '--') : getTownName(item.town_id)}
                      </td>
                      <td className="p-4 text-gray-400 font-bold uppercase tracking-widest">
                        {activeTab === 'towns' ? (item.country || '--') : (item.segment || '--')}
                      </td>
                      {isAdmin && (
                        <>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => activeTab === 'towns' ? setEditingTown(item) : setEditingStreet(item)}
                              className="p-2 text-gray-600 hover:text-cyber-neon transition-all hover:scale-110"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => activeTab === 'towns' ? handleDeleteTown(item.id) : handleDeleteStreet(item.id)}
                              className="p-2 text-gray-600 hover:text-[#ff0000] transition-all hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tactical Input / Edit Sidebar */}
        {isAdmin && (
          <div className="xl:w-96 bg-cyber-black border-2 border-cyber-red/40 p-6 flex flex-col relative shadow-[0_0_20px_rgba(255,0,0,0.1)] backdrop-blur-sm h-fit">
            <div className="absolute top-[-2px] left-[-2px] right-[-2px] h-[2px] bg-cyber-red shadow-[0_0_10px_#ff0000]"></div>

            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-cyber-red mb-6 flex items-center border-b border-cyber-red/20 pb-4">
              {editingTown || editingStreet ? (
                <><Edit className="w-5 h-5 mr-3" /> Modifying_Node_Record</>
              ) : (
                <><Plus className="w-5 h-5 mr-3 text-cyber-neon" /> Register_New_Node</>
              )}
            </h3>

            {activeTab === 'towns' ? (
              <form onSubmit={editingTown ? handleUpdateTown : handleCreateTown} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Designation_Name</label>
                  <input
                    type="text" required
                    value={editingTown ? editingTown.name : newTown.name}
                    onChange={e => editingTown ? setEditingTown({ ...editingTown, name: e.target.value }) : setNewTown({ ...newTown, name: e.target.value })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Province_Sector</label>
                  <input
                    type="text"
                    value={editingTown ? (editingTown.province || '') : (newTown.province || '')}
                    onChange={e => editingTown ? setEditingTown({ ...editingTown, province: e.target.value }) : setNewTown({ ...newTown, province: e.target.value })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Country_Entity</label>
                  <input
                    type="text"
                    value={editingTown ? (editingTown.country || '') : (newTown.country || '')}
                    onChange={e => editingTown ? setEditingTown({ ...editingTown, country: e.target.value }) : setNewTown({ ...newTown, country: e.target.value })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex-1 border-2 border-cyber-red bg-cyber-red/10 text-cyber-red font-black py-4 uppercase tracking-[0.3em] text-[11px] hover:bg-cyber-red hover:text-black transition-all shadow-neon-red flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : (editingTown ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                    {editingTown ? 'Update_Record' : 'Commit_Record'}
                  </button>
                  {editingTown && (
                    <button
                      type="button"
                      onClick={() => setEditingTown(null)}
                      className="border-2 border-gray-600 text-gray-500 p-4 hover:bg-gray-800 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={editingStreet ? handleUpdateStreet : handleCreateStreet} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Logistical_Street_Name</label>
                  <input
                    type="text" required
                    value={editingStreet ? editingStreet.name : newStreet.name}
                    onChange={e => editingStreet ? setEditingStreet({ ...editingStreet, name: e.target.value }) : setNewStreet({ ...newStreet, name: e.target.value })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Associated_Municipality</label>
                  <select
                    required
                    value={editingStreet ? editingStreet.town_id : newStreet.town_id}
                    onChange={e => editingStreet ? setEditingStreet({ ...editingStreet, town_id: parseInt(e.target.value) }) : setNewStreet({ ...newStreet, town_id: parseInt(e.target.value) })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  >
                    <option value={0} disabled className="bg-cyber-black italic">-- Select Base Node --</option>
                    {towns.map(t => <option key={t.id} value={t.id} className="bg-cyber-black">{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 tracking-[0.3em] font-black">Segment_Classification</label>
                  <input
                    type="text"
                    value={editingStreet ? (editingStreet.segment || '') : (newStreet.segment || '')}
                    onChange={e => editingStreet ? setEditingStreet({ ...editingStreet, segment: e.target.value }) : setNewStreet({ ...newStreet, segment: e.target.value })}
                    className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit" disabled={isSubmitting || (towns.length === 0 && !editingStreet)}
                    className="flex-1 border-2 border-cyber-red bg-cyber-red/10 text-cyber-red font-black py-4 uppercase tracking-[0.3em] text-[11px] hover:bg-cyber-red hover:text-black transition-all shadow-neon-red flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : (editingStreet ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                    {editingStreet ? 'Update_Log' : 'Commit_Log'}
                  </button>
                  {editingStreet && (
                    <button
                      type="button"
                      onClick={() => setEditingStreet(null)}
                      className="border-2 border-gray-600 text-gray-500 p-4 hover:bg-gray-800 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Tactical Footer Decor */}
            <div className="mt-8 border-t border-cyber-red/10 pt-4 flex justify-between items-center opacity-40">
              <span className="text-[8px] tracking-[0.2em] font-black uppercase text-gray-500">System_Status: Optimal</span>
              <div className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-cyber-neon animate-pulse' : 'bg-gray-800'}`}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRegistry;