import React, { useState, useEffect } from 'react';
import { FileText, Activity, AlertTriangle, Crosshair, MapPin, Eye, X, Shield, Clock, Zap } from 'lucide-react';
import detectionService from '../services/detectionService';
import imageService, { ImageResponse } from '../services/imageService';
import { useAuth } from '../hooks/useAuth';

const DetectionLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detail View State
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await detectionService.getDetections(0, 50);
        setLogs(data);
      } catch (err: any) {
        console.error('[DetectionLogs] Failed to fetch:', err);
        setError('DATABASE_CONNECTION_LOST // UNABLE TO RETRIEVE LOGS');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleInspect = async (log: any) => {
    setSelectedLog(log);
    setIsDetailLoading(true);
    setSelectedImage(null);
    try {
      const imageData = await imageService.getImageById(log.image_id);
      setSelectedImage(imageData);
    } catch (err) {
      console.error('[DetectionLogs] Failed to fetch image:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 h-full relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[-1]"></div>

      {/* Header HUD */}
      <div className="flex justify-between items-end border-b-2 border-cyber-red/40 pb-6 shrink-0 relative">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-cyber-red shadow-[0_0_10px_#ff0000]"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] flex items-center">
            <FileText className="mr-5 w-8 h-8 text-cyber-red" /> Detection_Telemetry_v.9
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-bold uppercase opacity-90 flex items-center">
            <Activity className="w-4 h-4 mr-2 animate-pulse text-cyber-neon" />
            Classification: <span className="text-gray-100 ml-2">{user?.is_admin ? 'GLOBAL_ADMIN' : 'FIELD_OPERATOR'}</span>
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 bg-cyber-black/8 border border-cyber-red/20 px-6 py-3 backdrop-blur-sm">
          <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Total_Analyzed_Nodes</span>
          <span className="text-cyber-red text-xl font-black drop-shadow-md">{logs.length.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {error && (
        <div className="border border-cyber-red/50 bg-cyber-red/5 p-4 flex items-start shrink-0 relative overflow-hidden animate-alert-flash">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-red"></div>
          <AlertTriangle className="text-cyber-red w-5 h-5 mr-4 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase font-black tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      {/* Main Terminal (Table) */}
      <div className="flex-1 bg-cyber-black/80 border border-cyber-red/30 p-6 flex flex-col overflow-hidden relative backdrop-blur-sm shadow-2xl">
        {/* Corner Markings */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-red/30"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-red/30"></div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-cyber-red">
            <Activity className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
            <p className="animate-pulse tracking-[0.6em] text-sm font-black uppercase">Syncing_Mainframe_Database...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 text-center p-12">
            <Crosshair className="w-32 h-32 mb-8 opacity-5 animate-pulse text-cyber-red" />
            <p className="uppercase tracking-[0.8em] text-lg font-black opacity-30">No_Active_Anomalies_Logged</p>
            <p className="max-w-md text-xs mt-4 uppercase tracking-[0.2em] opacity-20 font-bold leading-relaxed">System scan complete. Your current sector shows zero recorded pothole anomalies in the spatial hierarchy.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <table className="w-full text-left font-mono">
              <thead className="sticky top-0 z-10">
                <tr className="bg-cyber-red/10 text-cyber-red text-[16px] uppercase tracking-[0.4em] font-black border-b border-cyber-red/30">
                  <th className="p-5 font-black border-b border-cyber-red/20">Log_ID</th>
                  <th className="p-5 font-black border-b border-cyber-red/20 text-center">Anomalies</th>
                  <th className="p-5 font-black border-b border-cyber-red/20">AI_Accuracy</th>
                  <th className="p-5 font-black border-b border-cyber-red/20">Engine_Latency</th>
                  <th className="p-5 font-black border-b border-cyber-red/20">Geo_Coordinates</th>
                  <th className="p-5 font-black border-b border-cyber-red/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map(log => {
                  const confidence = log.confidence_avg ? (log.confidence_avg * 100).toFixed(1) + '%' : '--';
                  const isHighThreat = log.pothole_count > 3;

                  return (
                    <tr key={log.id} className="border-b border-cyber-red/5 hover:bg-cyber-red/10 transition-all group cursor-default">
                      <td className="p-5 text-gray-600 font-bold tracking-tighter">#{log.id.toString().padStart(4, '0')}</td>
                      <td className="p-5 text-center">
                        <span className={`inline-block px-4 py-1 font-black text-md tracking-[0.1em] ${isHighThreat ? 'bg-[#ff0000]/20 text-[#ff0000] border border-[#ff0000]/50 shadow-neon-red ring-2 ring-red-600/20' : 'text-gray-300'}`}>
                          {log.pothole_count.toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-100 font-bold">{confidence}</span>
                          <div className="w-16 h-1 bg-gray-800 relative hidden sm:block">
                            <div className="absolute inset-y-0 left-0 bg-cyber-red" style={{ width: confidence }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`font-bold tracking-widest ${log.inference_time_ms < 200 ? 'text-green-500' : log.inference_time_ms < 400 ? 'text-yellow-500' : 'text-red-600'}`}>
                          {log.inference_time_ms ? log.inference_time_ms.toFixed(1) : '--'} <span className="text-[10px] ml-1">MS</span>
                        </span>
                      </td>
                      <td className="p-5 flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-cyber-red animate-pulse" />
                        <span className="text-gray-100 font-black tracking-widest text-[12px] uppercase">
                          {log.estimated_lat ? (
                            `${log.estimated_lat.toFixed(5)} , ${log.estimated_lon.toFixed(5)}`
                          ) : 'GEODATA_NULL'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleInspect(log)}
                          className="px-4 py-2 bg-cyber-red/5 border border-cyber-red/20 text-gray-400 hover:text-cyber-neon hover:border-cyber-neon hover:bg-cyber-neon/5 transition-all flex items-center justify-center gap-2 ml-auto group/inspect"
                        >
                          <Eye className="w-4 h-4 transition-transform group-hover/inspect:scale-110" />
                          <span className="text-[10px] font-black tracking-[0.2em]">INSPECT</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Overlay Terminal (Modal) */}
      {selectedLog && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={closeDetail}></div>

          <div className="relative w-full max-w-6xl bg-cyber-black border-2 border-cyber-red/50 shadow-[0_0_50px_rgba(255,0,0,0.2)] flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-cyber-red/10 border-b border-cyber-red/30 p-6">
              <div>
                <h2 className="text-2xl font-black text-cyber-red tracking-[0.3em] uppercase">
                  Log_Detailed_Analysis_{selectedLog.id}
                </h2>
                <p className="text-xs text-cyber-red-dim tracking-[0.2em] font-bold mt-1 uppercase flex items-center">
                  <Shield className="w-3 h-3 mr-2" /> Verification_Status: <span className="text-cyber-neon ml-2">VERIFIED_ANOMALY</span>
                </p>
              </div>
              <button onClick={closeDetail} className="text-gray-500 hover:text-cyber-red transition-colors p-2 hover:bg-cyber-red/10 border border-transparent hover:border-cyber-red/30">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">

              {/* Visual Intel Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center border-b border-gray-800 pb-3">
                  <Zap className="w-4 h-4 mr-3 text-cyber-neon" /> Visual_Intel_Display
                </h3>
                <div className="aspect-video bg-gray-950 border-2 border-cyber-red/20 relative flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 pointer-events-none z-10 border border-cyber-red/10 m-3 group-hover:border-cyber-red/30 transition-all">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-red/40"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-red/40"></div>
                  </div>

                  {isDetailLoading ? (
                    <div className="flex flex-col items-center justify-center text-cyber-red">
                      <Activity className="w-12 h-12 animate-spin mb-4" />
                      <p className="text-[10px] font-black tracking-widest uppercase">Fetching_Visual_Streams...</p>
                    </div>
                  ) : selectedImage ? (
                    <img
                      src={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/${selectedImage.annotated_path}` : `http://localhost:8000/${selectedImage.annotated_path}`}
                      alt="Annotated Intel"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8 opacity-20">
                      <Shield className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Image_Data_Purged_Or_Missing</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Telemetry Metadata Section */}
              <div className="space-y-8">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] flex items-center border-b border-gray-800 pb-3">
                  <Crosshair className="w-4 h-4 mr-3 text-cyber-red" /> Telemetry_Metadata
                </h3>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Detection_Count</p>
                    <p className="text-3xl font-black text-cyber-red drop-shadow-md">{selectedLog.pothole_count}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Neural_Confidence</p>
                    <p className="text-3xl font-black text-cyber-neon drop-shadow-md">{(selectedLog.confidence_avg * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-5 bg-cyber-red/5 p-6 border-l-4 border-cyber-red">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest flex items-center"><Clock className="w-3 h-3 mr-2" /> Precise_Timestamp</span>
                    <span className="text-gray-200">{(new Date(selectedLog.detected_at)).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest flex items-center"><Zap className="w-3 h-3 mr-2" /> Inference_Time</span>
                    <span className="text-cyber-neon">{selectedLog.inference_time_ms.toFixed(2)} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-gray-500 uppercase tracking-widest flex items-center"><MapPin className="w-3 h-3 mr-2" /> Deployment_ID</span>
                    <span className="text-gray-400 font-black tracking-tighter">SEC_{selectedLog.id}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Geospatial_Fixed_Position</p>
                  <div className="bg-cyber-gray/20 border-l-2 border-cyber-neon p-4 font-black tracking-[0.2em] text-md text-gray-100 uppercase">
                    Lat: {selectedLog.estimated_lat.toFixed(6)} <br />
                    Lon: {selectedLog.estimated_lon.toFixed(6)}
                  </div>
                  <p className="text-[9px] text-gray-600 italic">Global Positioning System Locked. Verified on COL_MAP_BOG_01.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer Decorative */}
            <div className="bg-cyber-red/10 p-4 border-t border-cyber-red/30 flex justify-between items-center">
              <span className="text-[8px] font-black text-cyber-red-dim tracking-[0.5em] uppercase">SYSTEM_ENCRYPTION_ACTIVE // 256_BIT_AES</span>
              <span className="text-[8px] font-black text-gray-600 tracking-[0.2em] uppercase">Session_Token: {Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionLogs;