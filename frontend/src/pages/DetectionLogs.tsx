import React, { useState, useEffect } from 'react';
import { FileText, Activity, AlertTriangle, Crosshair, MapPin, Eye } from 'lucide-react';
import detectionService from '../services/detectionService';
import { useAuth } from '../hooks/useAuth';

const DetectionLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await detectionService.getDetections(0, 50); // Fetching top 50 for now
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

  return (
    <div className="flex flex-col gap-6 font-mono text-gray-300 h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red flex items-center">
            <FileText className="mr-3 w-6 h-6" /> Detection_Telemetry_Logs
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            Access_Level: {user?.is_admin ? 'GLOBAL_OVERRIDE (ADMIN)' : 'RESTRICTED_AGENT_VIEW'}
          </p>
        </div>
        <div className="bg-cyber-red/10 border border-cyber-red/30 px-4 py-2 text-xs uppercase tracking-widest">
          Total_Records_Visible: <span className="text-cyber-red font-bold">{logs.length}</span>
        </div>
      </div>

      {error && (
        <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start shrink-0">
          <AlertTriangle className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="flex-1 bg-cyber-black border border-cyber-red/30 p-4 flex flex-col overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-cyber-black/80 z-10 flex flex-col items-center justify-center text-cyber-red">
            <Activity className="w-10 h-10 animate-spin mb-4" />
            <p className="animate-pulse tracking-widest uppercase text-xs">Accessing_Mainframe...</p>
          </div>
        ) : logs.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
              <Crosshair className="w-12 h-12 mb-4 opacity-20" />
              <p className="uppercase tracking-widest text-xs">No_Anomalies_Found_In_Your_Sector</p>
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-red scrollbar-track-cyber-black pr-2">
            <table className="w-full text-left text-xs text-gray-400">
              <thead className="uppercase tracking-widest bg-cyber-red/10 text-cyber-red sticky top-0 z-20 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                <tr>
                  <th className="p-3 font-normal border-b border-cyber-red/30">Log_ID</th>
                  <th className="p-3 font-normal border-b border-cyber-red/30 text-center">Anomalies</th>
                  <th className="p-3 font-normal border-b border-cyber-red/30">AI_Confidence</th>
                  <th className="p-3 font-normal border-b border-cyber-red/30">Latency (ms)</th>
                  <th className="p-3 font-normal border-b border-cyber-red/30">Coordinates</th>
                  <th className="p-3 font-normal border-b border-cyber-red/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-red/10">
                {logs.map(log => {
                  const confidence = log.confidence_avg ? (log.confidence_avg * 100).toFixed(1) + '%' : '--';
                  const isHighThreat = log.pothole_count > 3;
                  
                  return (
                    <tr key={log.id} className="hover:bg-cyber-red/5 transition-colors group">
                      <td className="p-3 text-gray-500">#{log.id}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-1 ${isHighThreat ? 'bg-[#ff0000]/20 text-[#ff0000] border border-[#ff0000]/50' : 'text-gray-300'}`}>
                          {log.pothole_count}
                        </span>
                      </td>
                      <td className="p-3">{confidence}</td>
                      <td className="p-3 text-cyber-neon">{log.inference_time_ms ? log.inference_time_ms.toFixed(1) : '--'}</td>
                      <td className="p-3 text-[10px] text-gray-500 flex items-center">
                        {log.estimated_lat ? (
                          <>
                            <MapPin className="w-3 h-3 mr-1 text-cyber-red-dim" />
                            {log.estimated_lat.toFixed(4)}, {log.estimated_lon.toFixed(4)}
                          </>
                        ) : 'DATA_MISSING'}
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-gray-600 hover:text-cyber-red transition-colors flex items-center justify-end w-full">
                          <Eye className="w-4 h-4 mr-1" /> <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">INSPECT</span>
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
    </div>
  );
};

export default DetectionLogs;