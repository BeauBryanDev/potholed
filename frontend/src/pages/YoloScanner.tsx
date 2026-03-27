import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Ensure 'react-dropzone' is installed
import { UploadCloud, CheckCircle, AlertTriangle, Activity, MapPin, Layers3, ImageIcon, Crosshair } from 'lucide-react';
import townService, { TownResponse } from '../services/townService';
import streetService, { StreetResponse } from '../services/streetService';
import detectionService, { DetectionPredictResponse } from '../services/detectionService';

const YoloScanner: React.FC = () => {
  // --- UI & Upload State ---
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<DetectionPredictResponse | null>(null);

  // --- Cascading Location State ---
  const [towns, setTowns] = useState<TownResponse[]>([]);
  const [streets, setStreets] = useState<StreetResponse[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [selectedStreetId, setSelectedStreetId] = useState<string>('');
  const [currentSegment, setCurrentSegment] = useState<number>(5); // Default segment

  // Load Towns on mount
  useEffect(() => {
    townService.getTowns().then(setTowns).catch(console.error);
  }, []);

  // Load Streets when Town changes
  useEffect(() => {
    if (selectedTownId) {
      streetService.getStreets(0, 100, parseInt(selectedTownId))
        .then(setStreets)
        .catch(console.error);
      setSelectedStreetId(''); // Reset street
    } else {
      setStreets([]);
    }
  }, [selectedTownId]);

  // Setup Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Create local preview
      setPredictionResult(null); // Reset previous results
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    multiple: false,
    disabled: isProcessing
  });

  // --- Execute Inference ---
  const handleRunInference = async () => {
    if (!file || !selectedStreetId) {
      setError('CONFIGURATION_INCOMPLETE // Missing Image or Street_ID');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPredictionResult(null);

    try {
      // Call the detection Service with FormData
      const result = await detectionService.predictPotholes(
        file,
        parseInt(selectedStreetId),
        currentSegment
      );
      console.log('[Scanner] Inference Complete:', result);
      setPredictionResult(result);
    } catch (err: any) {
      console.error('[Scanner] Inference Failed:', err);
      const msg = err.response?.data?.detail || 'INFERENCE_ENGINE_FAILURE // Contact Admin';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setPredictionResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 relative">
      {/* Background HUD Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] z-[-1]"></div>
      
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-cyber-red/40 pb-6 relative">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-cyber-red"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
            YOLO_Neural_Scanner_v.9
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-bold uppercase opacity-90">
            Engine: <span className="text-cyber-neon animate-pulse">YOLOv8-9k_ONNX</span> // Mode: <span className="text-gray-200">ACTIVE_RECON</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Configuration & Upload (Tactical Input) --- */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* 1. Location Configuration Container */}
          <div className="bg-cyber-black/80 border border-cyber-red/30 p-6 space-y-5 relative backdrop-blur-sm group hover:border-cyber-red/60 transition-colors">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-red"></div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-cyber-red font-black flex items-center mb-2">
              <MapPin className="w-5 h-5 mr-3" /> Geo_Telemetry_Config
            </h2>
            
            {/* Town Select */}
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-400 tracking-[0.2em] font-bold">Select_Municipality</label>
              <select 
                value={selectedTownId}
                onChange={(e) => setSelectedTownId(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest"
              >
                <option value="" className="bg-cyber-black italic">-- Select_Target_Zone --</option>
                {towns.map(t => <option key={t.id} value={t.id} className="bg-cyber-black">{t.name}</option>)}
              </select>
            </div>

            {/* Street Select */}
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-400 tracking-[0.2em] font-bold">Target_Logistical_Street</label>
              <select 
                value={selectedStreetId}
                onChange={(e) => setSelectedStreetId(e.target.value)}
                disabled={isProcessing || !selectedTownId}
                className="w-full bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
              >
                <option value="" className="bg-cyber-black">-- Select_Target_Street --</option>
                {streets.map(s => <option key={s.id} value={s.id} className="bg-cyber-black">{s.name} (SEG_{s.segment})</option>)}
              </select>
            </div>

            {/* Segment Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-400 tracking-[0.2em] font-bold">Current_Deployment_Segment (1-10)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" min="1" max="10"
                  value={currentSegment}
                  onChange={(e) => setCurrentSegment(parseInt(e.target.value))}
                  disabled={isProcessing}
                  className="flex-1 bg-cyber-gray/20 border-l-2 border-cyber-red/40 text-gray-100 p-3 text-sm focus:outline-none focus:border-cyber-red focus:bg-cyber-red/5 transition-all font-bold"
                />
                <div className="hidden sm:block text-[10px] text-cyber-red-dim animate-pulse opacity-50 font-bold">SEG_ID_0{currentSegment}</div>
              </div>
            </div>
          </div>

          {/* 2. Image Acquisition (Dropzone HUD) */}
          <div {...getRootProps()} className={`relative bg-cyber-black/80 border-2 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] backdrop-blur-sm group overflow-hidden ${
            isDragActive ? 'border-cyber-neon border-solid bg-cyber-neon/5' : 'border-cyber-red/30 border-dashed hover:border-cyber-red hover:bg-cyber-red/10'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input {...getInputProps()} />
            
            {/* Corner markings for dropzone */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyber-red opacity-30"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyber-red opacity-30"></div>
            
            {previewUrl ? (
              <div className="relative p-1 bg-cyber-red/20 border border-cyber-red/40">
                <img src={previewUrl} alt="Preview" className="max-h-40 object-cover shadow-2xl" />
                <div className="absolute top-0 right-0 bg-cyber-red text-black text-[8px] font-bold px-1 uppercase tracking-tighter">DATA_ACQUIRED</div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <div className="absolute inset-0 animate-ping opacity-20 bg-cyber-red rounded-full"></div>
                  <UploadCloud className={`relative w-14 h-14 ${isDragActive ? 'text-cyber-neon' : 'text-cyber-red shadow-neon-red'}`} />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] font-black text-gray-200 group-hover:text-cyber-red transition-colors">
                  {isDragActive ? 'SYNCING_PAYLOAD...' : 'LOAD_VISUAL_INTEL'}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-bold tracking-widest uppercase opacity-70">JPEG_PNG_ENCRYPTION_ONLY // MAX: 10MB</p>
              </>
            )}
          </div>

          {/* 3. Action Section */}
          <div className="space-y-4">
            {error && (
              <div className="border border-cyber-red/50 bg-cyber-red/5 p-4 flex items-start animate-alert-flash relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyber-red"></div>
                <AlertTriangle className="text-cyber-red w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-cyber-red text-[10px] uppercase font-black tracking-[0.2em] mb-1">Critical_Terminal_Handshake_Error</p>
                  <p className="text-cyber-red-dim text-xs uppercase font-bold tracking-widest leading-tight">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleRunInference}
              disabled={isProcessing || !file || !selectedStreetId}
              className={`relative overflow-hidden w-full border-2 border-cyber-red text-cyber-red group h-16 transition-all duration-300 ${
                (isProcessing || !file || !selectedStreetId) ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95 shadow-neon-red cursor-pointer'
              }`}
            >
              <div className="absolute inset-0 bg-cyber-red/10 group-hover:bg-cyber-red transition-colors duration-300"></div>
              <span className="relative z-10 flex items-center justify-center uppercase tracking-[0.4em] font-black text-sm group-hover:text-black">
                {isProcessing ? (
                  <><Activity className="w-6 h-6 animate-spin mr-3" /> ANALYZING_DATASTREAMS...</>
                ) : (
                  'EXECUTE_AI_DIAGNOSTICS'
                )}
              </span>
            </button>
            
            {predictionResult && (
               <button 
                onClick={resetScanner} 
                className="w-full text-center text-[10px] font-black text-gray-600 hover:text-cyber-neon transition-all uppercase tracking-[0.5em] mt-2 block"
              >
                 &gt; CLEAR_ENGINE_CACHE_FOR_NEW_SCAN
               </button>
            )}
          </div>
        </div>

        {/* --- Right Column: Inference Output (Main HUD Display) --- */}
        <div className="lg:col-span-2 bg-cyber-black/90 border border-cyber-red/30 p-6 flex flex-col relative backdrop-blur-md">
          <div className="absolute top-0 right-0 p-2 opacity-30 flex items-center gap-2">
            <span className="text-[8px] tracking-tighter">DISPLAY_OUTPUT_PORT_1</span>
            <Layers3 className="w-4 h-4" />
          </div>
          
          <h2 className="text-sm uppercase tracking-[0.4em] text-cyber-red font-black flex items-center mb-5 border-b-2 border-cyber-red/20 pb-4">
            <ImageIcon className="w-5 h-5 mr-3 text-cyber-neon" /> Main_Diagnostic_Visuals
          </h2>

          <div className="flex-1 border-2 border-cyber-red/10 relative min-h-[450px] bg-gray-950/80 flex items-center justify-center overflow-hidden shadow-inner group">
            {/* Visual HUD element overlays */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-30 border border-cyber-red/10 m-2">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-red/40"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-red/40"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-red/40"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-red/40"></div>
              <div className="absolute top-1/2 left-0 w-2 h-px bg-cyber-red/40"></div>
              <div className="absolute top-1/2 right-0 w-2 h-px bg-cyber-red/40"></div>
              <div className="absolute left-1/2 top-0 w-px h-2 bg-cyber-red/40"></div>
              <div className="absolute left-1/2 bottom-0 w-px h-2 bg-cyber-red/40"></div>
            </div>

            {isProcessing && (
                <div className="absolute inset-0 bg-cyber-black/90 z-20 flex flex-col items-center justify-center text-cyber-red">
                    <Activity className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
                    <p className="animate-pulse tracking-[0.6em] text-lg font-black uppercase">Decrypting_Pixel_Telemetry...</p>
                    <div className="mt-4 w-48 h-1 bg-cyber-red/20 relative">
                       <div className="absolute inset-y-0 left-0 bg-cyber-red animate-process-bar"></div>
                    </div>
                </div>
            )}
            
            {predictionResult ? (
              <img 
                src={predictionResult.image_url} 
                alt="Annotated Result" 
                className="absolute inset-0 w-full h-full object-contain z-0 transition-all duration-700 group-hover:scale-[1.02]" 
              />
            ) : previewUrl ? (
               <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain opacity-20 grayscale z-0" />
            ) : (
              <div className="flex flex-col items-center text-gray-800 text-center p-12 relative">
                <Crosshair className="w-24 h-24 mb-6 opacity-10 animate-pulse text-cyber-red" />
                <p className="uppercase tracking-[0.6em] text-md font-black opacity-40">Awaiting_Optic_Input</p>
                <p className="text-xs mt-3 uppercase tracking-widest opacity-30 font-bold max-w-xs leading-relaxed">System standby. Visual recognition engine ready for high-resolution pothole telemetry acquisition.</p>
              </div>
            )}
          </div>

          {/* Results Summary HUD Bar */}
          {predictionResult && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t-2 border-cyber-red/20 font-mono uppercase">
                <div className="bg-cyber-gray/40 p-4 border-l-4 border-green-500 shadow-sm">
                    <p className="text-gray-400 text-[10px] mb-2 font-black tracking-widest">&gt; Status</p>
                    <p className="text-green-500 font-bold text-sm flex items-center gap-1 drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">
                        <CheckCircle className="w-4 h-4" /> SUCCESS_LOGGED
                    </p>
                </div>
                <div className="bg-cyber-gray/40 p-4 border-l-4 border-cyber-red shadow-sm">
                    <p className="text-gray-400 text-[10px] mb-2 font-black tracking-widest">&gt; Anomalies</p>
                    <p className="text-cyber-red font-black text-2xl drop-shadow-[0_0_8px_rgba(255,0,0,0.4)]">
                        {predictionResult.potholes_found}
                    </p>
                </div>
                {/* Enhanced & Color-Coded Latency HUD */}
                <div className={`bg-cyber-gray/40 p-4 border-l-4 shadow-sm ${
                  predictionResult.inference_time_ms < 200 ? 'border-green-500' :
                  predictionResult.inference_time_ms < 400 ? 'border-yellow-500' : 'border-red-600'
                }`}>
                    <p className="text-gray-400 text-[10px] mb-2 font-black tracking-widest">&gt; Engine_Latency</p>
                    <p className={`font-black text-lg drop-shadow-md ${
                      predictionResult.inference_time_ms < 200 ? 'text-green-500' :
                      predictionResult.inference_time_ms < 400 ? 'text-yellow-500' : 'text-red-600'
                    }`}>
                        {predictionResult.inference_time_ms.toFixed(1)} <span className="text-xs">ms</span>
                    </p>
                </div>
                 <div className="bg-cyber-gray/40 p-4 border-l-4 border-gray-600 shadow-sm">
                    <p className="text-gray-400 text-[10px] mb-2 font-black tracking-widest">&gt; GPS_Ref</p>
                    <p className="text-gray-300 font-bold text-[10px] tracking-tighter leading-tight">
                        {predictionResult.estimated_lat.toFixed(5)}<br/>
                        {predictionResult.estimated_lon.toFixed(5)}
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoloScanner;