import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Globe, Shield, Edit3, Save, X, Activity, Terminal, Crosshair, Zap } from 'lucide-react';
import userService, { UserResponse, UserUpdate } from '../services/userService';
import { useAuth } from '../hooks/useAuth';



const UserProfile: React.FC = () => {
  const { user: authUser } = useAuth(); // Global auth state
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserUpdate>({});

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getMe();
        setProfile(data);
        // Initialize form data with current values
        setFormData({
          username: data.username,
          email: data.email,
          name: data.name || '',
          gender: data.gender || '',
          phone_number: data.phone_number || '',
          city: data.city || '',
          country: data.country || '',
          address: data.address || ''
        });
      } catch (err: any) {
        console.error('[Profile] Fetch Error:', err);
        setError('DATA_STREAM_LOST // UNABLE TO FETCH DOSSIER');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProfile = await userService.patchMe(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('DOSSIER_UPDATED // CHANGES_COMMITTED_TO_MAINFRAME');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[Profile] Update Error:', err);
      setError(err.response?.data?.detail || 'UPDATE_FAILED // INTEGRITY_CHECK_ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
        name: profile.name || '',
        gender: profile.gender || '',
        phone_number: profile.phone_number || '',
        city: profile.city || '',
        country: profile.country || '',
        address: profile.address || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-cyber-red h-full">
        <Activity className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
        <p className="tracking-[0.6em] uppercase text-lg font-black animate-pulse">Decrypting_Agent_File...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-10 font-mono text-gray-300 h-full max-w-6xl mx-auto relative pb-12">
      {/* Background HUD Decor */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.01)_1px,transparent_1px)] bg-[size:50px_50px] z-[-1]"></div>

      {/* Top Identity HUD Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center border-b-2 border-cyber-red/40 pb-10 shrink-0 relative">
        <div className="absolute -bottom-[2px] left-0 w-48 h-[2px] bg-cyber-red shadow-[0_0_10px_#ff0000]"></div>

        {/* Profile Avatar / Brand Icon Frame */}
        <div className="relative shrink-0 group">
          <div className="absolute inset-0 bg-cyber-red animate-pulse opacity-10 rounded-none transform rotate-45 scale-75 blur-2xl"></div>
          <div className="w-40 h-40 border-2 border-cyber-red relative overflow-hidden bg-cyber-gray/20 shadow-[0_0_20px_rgba(255,0,0,0.15)]">
            {/* Corner markings */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-red"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-red"></div>

            <img
              src='../../publics/cv_pothole_img.jpg'
              alt="Profile Icon"
              className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
            />
            <div className="absolute bottom-1 right-1 px-1 bg-cyber-red text-black text-[8px] font-black uppercase">SYNCED</div>
          </div>
        </div>

        {/* Big Name & Meta Terminal */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <p className="text-[10px] text-cyber-red-dim font-black tracking-[0.5em] uppercase mb-1 flex items-center justify-center md:justify-start">
              <Shield className="w-3 h-3 mr-2 text-cyber-red" /> Authorized_Entity_Signal
            </p>
            <h1 className="text-5xl font-black text-cyber-red tracking-[0.1em] uppercase shadow-neon-red drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
              {profile.name || profile.username}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              <p className="text-lg font-black text-gray-100 tracking-widest uppercase flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-cyber-neon" /> {profile.city || 'UNDEFINED_SECTOR'}, {profile.country || 'NULL_GEO'}
              </p>
              <span className="px-3 py-1 bg-cyber-red/10 border border-cyber-red/30 text-[10px] font-black tracking-widest text-cyber-red uppercase">
                Clearance: {profile.is_admin ? 'LVL_09_ADMIN' : 'LVL_03_OPERATIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Protocol Controls */}
        <div className="flex gap-4 self-center md:self-end">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="group relative overflow-hidden flex items-center border-2 border-cyber-red text-cyber-red px-8 py-3 text-xs font-black uppercase tracking-[0.3em] hover:bg-cyber-red hover:text-black transition-all shadow-neon-red active:scale-95"
            >
              <Edit3 className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" /> Override_Dossier
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={cancelEdit}
                disabled={isSaving}
                className="flex items-center border-2 border-gray-600 text-gray-400 px-6 py-3 text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-600 hover:text-white transition-all active:scale-95 disabled:opacity-30"
              >
                <X className="w-4 h-4 mr-3" /> Abort
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="group relative overflow-hidden flex items-center border-2 border-cyber-neon text-cyber-neon px-8 py-3 text-xs font-black uppercase tracking-[0.3em] hover:bg-cyber-neon hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,185,0.3)] active:scale-95 disabled:opacity-30"
              >
                {isSaving ? <Activity className="w-4 h-4 mr-3 animate-spin" /> : <Save className="w-4 h-4 mr-3" />}
                Commit_Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic System Feedback */}
      {(error || success) && (
        <div className={`border-2 p-5 flex items-start animate-alert-flash relative overflow-hidden ${error ? 'border-cyber-red/50 bg-cyber-red/5' : 'border-cyber-neon/50 bg-cyber-neon/5'}`}>
          <div className={`absolute top-0 left-0 w-2 h-full ${error ? 'bg-cyber-red' : 'bg-cyber-neon'}`}></div>
          <Terminal className={`${error ? 'text-cyber-red' : 'text-cyber-neon'} w-6 h-6 mr-4 flex-shrink-0`} />
          <p className={`${error ? 'text-cyber-red' : 'text-cyber-neon'} text-xs uppercase font-black tracking-widest leading-relaxed`}>
            {error || success}
          </p>
        </div>
      )}

      {/* Main Content: Tactical Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Terminal Block 01: Core Verification */}
        <div className="bg-cyber-black/80 border-2 border-cyber-red/20 hover:border-cyber-red/40 p-8 relative overflow-hidden transition-all group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-3 opacity-20"><Zap className="w-5 h-5 text-cyber-neon" /></div>
          <h2 className="text-xs uppercase tracking-[0.4em] font-black text-cyber-red flex items-center border-b border-cyber-red/10 pb-4 mb-8">
            <UserIcon className="w-5 h-5 mr-4 text-cyber-neon" /> Identity_Verification_Module
          </h2>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Agent_Alias</label>
              {isEditing ? (
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest" />
              ) : (
                <p className="text-xl text-gray-100 font-black tracking-tighter uppercase group-hover:text-cyber-neon transition-colors">@{profile.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Comm_Stream (Email)</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all tracking-widest lowercase" />
              ) : (
                <p className="text-sm text-gray-300 font-bold flex items-center tracking-widest"><Mail className="w-4 h-4 mr-3 text-cyber-red" /> {profile.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Gender_Signal</label>
                {isEditing ? (
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all text-xs uppercase tracking-widest cursor-pointer">
                    <option value="" className="bg-cyber-black">-- UNK --</option>
                    <option value="M" className="bg-cyber-black">MALE</option>
                    <option value="F" className="bg-cyber-black">FEMALE</option>
                    <option value="X" className="bg-cyber-black">NON_BINARY</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-100 font-black tracking-widest border-l-2 border-cyber-red/20 pl-3">{profile.gender || 'UNDEFINED'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Network_Link</label>
                <p className="text-sm text-cyber-neon font-bold tracking-widest uppercase flex items-center border-l-2 border-cyber-neon/20 pl-3">
                  Active_Sync
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Block 02: Geo-Telemetry */}
        <div className="bg-cyber-black/80 border-2 border-cyber-red/20 hover:border-cyber-red/40 p-8 relative overflow-hidden transition-all group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-3 opacity-20"><Crosshair className="w-5 h-5 text-cyber-red" /></div>
          <h2 className="text-xs uppercase tracking-[0.4em] font-black text-cyber-red flex items-center border-b border-cyber-red/10 pb-4 mb-8">
            <Globe className="w-5 h-5 mr-4 text-cyber-neon" /> Spatial_Telemetry_Dossier
          </h2>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Encrypted_Voice_Line</label>
              {isEditing ? (
                <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all tracking-widest font-black" placeholder="+00 000 0000" />
              ) : (
                <p className="text-lg text-gray-100 font-bold flex items-center"><Phone className="w-4 h-4 mr-3 text-cyber-red" /> {profile.phone_number || 'SIGNAL_LOST'}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Base_Operational_Address</label>
              {isEditing ? (
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest" />
              ) : (
                <p className="text-sm text-gray-300 font-bold tracking-widest border-l-2 border-cyber-red/20 pl-4 bg-cyber-red/5 py-2">
                  {profile.address || 'UNDECLARED_SAFEHOUSE'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Sector (City)</label>
                {isEditing ? (
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest" />
                ) : (
                  <p className="text-sm text-gray-100 font-black tracking-[0.2em] uppercase">{profile.city || 'NULL'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-600 tracking-[0.3em] font-black">Region (Country)</label>
                {isEditing ? (
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-cyber-gray/10 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest" />
                ) : (
                  <p className="text-sm text-gray-100 font-black tracking-[0.2em] uppercase">{profile.country || 'NULL'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="border-t border-cyber-red/10 pt-6 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em]">
        <span>Node: PROFILE_DOSSIER_v2.09</span>
        <span>Encryption: AES_256_ACTIVE</span>
        <span>Sync_Status: NOMINAL</span>
      </div>
    </div>
  );
};

export default UserProfile;
