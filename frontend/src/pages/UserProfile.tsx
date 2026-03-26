import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Globe, Shield, Edit3, Save, X, Activity, Terminal } from 'lucide-react';
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
      // We use patchMe to only update the fields that are sent
      const updatedProfile = await userService.patchMe(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('DOSSIER_UPDATED // CHANGES_COMMITTED_TO_MAINFRAME');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[Profile] Update Error:', err);
      setError(err.response?.data?.detail || 'UPDATE_FAILED // INTEGRITY_CHECK_ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    // Revert form data back to current profile state
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
        <Activity className="w-8 h-8 animate-spin mb-4" />
        <p className="tracking-[0.2em] uppercase text-sm animate-pulse">Decrypting_Agent_File...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6 font-mono text-gray-300 h-full max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red flex items-center">
            <Shield className="mr-3 w-6 h-6" /> Agent_Dossier
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            Clearance: {profile.is_admin ? 'LEVEL_9 (ADMIN)' : 'LEVEL_3 (OPERATOR)'} // Status: {profile.is_active ? 'ACTIVE' : 'SUSPENDED'}
          </p>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center border border-cyber-red/50 text-cyber-red px-4 py-2 text-xs uppercase tracking-widest hover:bg-cyber-red hover:text-black transition-colors"
          >
            <Edit3 className="w-3 h-3 mr-2" /> Override_Data
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={cancelEdit}
              disabled={isSaving}
              className="flex items-center border border-gray-600 text-gray-400 px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-600 hover:text-white transition-colors"
            >
              <X className="w-3 h-3 mr-2" /> Abort
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center border border-cyber-red text-cyber-red px-4 py-2 text-xs uppercase tracking-widest hover:bg-cyber-red hover:text-black transition-colors"
            >
              {isSaving ? <Activity className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />} 
              Commit
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start">
          <Terminal className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="border-l-4 border-cyber-neon bg-cyber-neon/10 p-3 flex items-start">
          <Terminal className="text-cyber-neon w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-neon text-xs uppercase tracking-wider">{success}</p>
        </div>
      )}

      {/* Profile Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identity Block */}
        <div className="bg-cyber-black border border-cyber-red/30 p-5 relative overflow-hidden">
          <h2 className="text-sm uppercase tracking-widest text-cyber-red flex items-center border-b border-cyber-red/20 pb-2 mb-4">
            <UserIcon className="w-4 h-4 mr-2" /> Core_Identity
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Username</label>
              {isEditing ? (
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" />
              ) : (
                <p className="text-lg text-gray-200">{profile.username}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Comm_Link (Email)</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" />
              ) : (
                <p className="text-sm text-gray-300 flex items-center"><Mail className="w-3 h-3 mr-2 text-cyber-red-dim" /> {profile.email}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Legal_Designation (Name)</label>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" placeholder="Enter full name" />
              ) : (
                <p className="text-sm text-gray-300">{profile.name || '-- UNREGISTERED --'}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Gender_Marker</label>
              {isEditing ? (
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1">
                  <option value="">-- UNKNOWN --</option>
                  <option value="M">MALE</option>
                  <option value="F">FEMALE</option>
                  <option value="X">NON_BINARY</option>
                </select>
              ) : (
                <p className="text-sm text-gray-300">{profile.gender || '--'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Contact Block */}
        <div className="bg-cyber-black border border-cyber-red/30 p-5 relative overflow-hidden">
          <h2 className="text-sm uppercase tracking-widest text-cyber-red flex items-center border-b border-cyber-red/20 pb-2 mb-4">
            <Globe className="w-4 h-4 mr-2" /> Telemetry_&_Location
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest flex items-center">
                <Phone className="w-3 h-3 mr-1" /> Encrypted_Channel (Phone)
              </label>
              {isEditing ? (
                <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" placeholder="+00 000 0000" />
              ) : (
                <p className="text-sm text-gray-300">{profile.phone_number || '-- UNREGISTERED --'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-widest">Base_City</label>
                {isEditing ? (
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" />
                ) : (
                  <p className="text-sm text-gray-300 flex items-center"><MapPin className="w-3 h-3 mr-2 text-cyber-red-dim" /> {profile.city || '--'}</p>
                )}
              </div>
              
              <div>
                <label className="text-[10px] uppercase text-gray-500 tracking-widest">Country_Code</label>
                {isEditing ? (
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" />
                ) : (
                  <p className="text-sm text-gray-300">{profile.country || '--'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Safehouse_Coordinates (Address)</label>
              {isEditing ? (
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors mt-1" />
              ) : (
                <p className="text-sm text-gray-300">{profile.address || '-- UNREGISTERED --'}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;

