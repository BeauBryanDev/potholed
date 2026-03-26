import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // Ensure 'react-dropzone' is installed
import { UploadCloud, CheckCircle, AlertTriangle, Activity, MapPin, Layers3, ImageIcon } from 'lucide-react';
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
    <div className="flex flex-col gap-6 font-mono text-gray-300">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red">
            YOLO_Inference_Scanner
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            Engine: YOLOv8-9k // Status: Ready_for_Input
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Left Column: Configuration & Upload --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Location Configuration */}
          <div className="bg-cyber-black border border-cyber-red/30 p-5 space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-cyber-red flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Geo_Telemetry_Config
            </h2>
            
            {/* Town Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Select Municipality</label>
              <select 
                value={selectedTownId}
                onChange={(e) => setSelectedTownId(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors"
              >
                <option value="">-- Select Town --</option>
                {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Street Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Select Target Street</label>
              <select 
                value={selectedStreetId}
                onChange={(e) => setSelectedStreetId(e.target.value)}
                disabled={isProcessing || !selectedTownId}
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors disabled:opacity-50"
              >
                <option value="">-- Select Street --</option>
                {streets.map(s => <option key={s.id} value={s.id}>{s.name} (Segment: {s.segment})</option>)}
              </select>
            </div>

            {/* Segment Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-gray-500 tracking-widest">Current Segment (1-10)</label>
              <input 
                type="number" min="1" max="10"
                value={currentSegment}
                onChange={(e) => setCurrentSegment(parseInt(e.target.value))}
                disabled={isProcessing}
                className="w-full bg-cyber-black border border-cyber-red/30 text-gray-300 p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors"
              />
            </div>
          </div>

          {/* 2. Image Acquisition (Dropzone) */}
          <div {...getRootProps()} className={`bg-cyber-black border-2 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-48 ${
            isDragActive ? 'border-cyber-neon border-solid bg-cyber-red/5' : 'border-cyber-red/30 border-dashed hover:border-cyber-red hover:bg-cyber-red/5'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input {...getInputProps()} />
            
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-36 object-cover mb-3 border border-cyber-red/50" />
            ) : (
              <UploadCloud className={`w-12 h-12 mb-3 ${isDragActive ? 'text-cyber-neon' : 'text-cyber-red'}`} />
            )}

            <p className="text-xs uppercase tracking-wider text-gray-400">
              {isDragActive ? 'Drop_Data_Payload...' : 'Drag_Image_or_Click'}
            </p>
            <p className="text-[10px] text-gray-700 mt-1">JPEG, PNG only (Max 10MB)</p>
          </div>

          {/* 3. Action Button */}
          {error && (
            <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start">
              <AlertTriangle className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
            </div>
          )}

          <button
            onClick={handleRunInference}
            disabled={isProcessing || !file || !selectedStreetId}
            className={`w-full flex items-center justify-center border border-cyber-red text-cyber-red uppercase tracking-[0.2em] font-bold p-4 transition-all duration-300 hover:bg-cyber-red hover:text-black hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] ${
              (isProcessing || !file || !selectedStreetId) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <><Activity className="w-5 h-5 animate-spin mr-3" /> Processing_Network...</>
            ) : (
              'Initialize_AI_Inference'
            )}
          </button>
          
          {predictionResult && (
             <button onClick={resetScanner} className="w-full text-center text-xs text-gray-600 hover:text-cyber-red uppercase tracking-widest mt-2">
               &gt; Scan_New_Anomaly
             </button>
          )}

        </div>

        {/* --- Right Column: Inference Output (HUD) --- */}
        <div className="lg:col-span-2 bg-cyber-black border border-cyber-red/30 p-5 flex flex-col">
          <h2 className="text-sm uppercase tracking-widest text-cyber-red flex items-center mb-4 border-b border-cyber-red/20 pb-2">
            <ImageIcon className="w-4 h-4 mr-2" /> Inference_Engine_Output
          </h2>

          <div className="flex-1 border border-cyber-red/20 relative min-h-96 bg-gray-950 flex items-center justify-center overflow-hidden">
            {isProcessing && (
                <div className="absolute inset-0 bg-cyber-black/80 z-10 flex flex-col items-center justify-center text-cyber-red">
                    <Activity className="w-12 h-12 animate-spin mb-4" />
                    <p className="animate-pulse tracking-widest uppercase">Analyzing_Visual_Data...</p>
                </div>
            )}
            
            {predictionResult ? (
              // Display annotated image returned by backend
              <img src={predictionResult.image_url} alt="Annotated Result" className="absolute inset-0 w-full h-full object-contain z-0" />
            ) : previewUrl ? (
                // Display local preview before upload
               <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain opacity-40 z-0" />
            ) : (
              // Placeholder
              <div className="flex flex-col items-center text-gray-700 text-center p-10">
                <Layers3 className="w-16 h-16 mb-4 opacity-20" />
                <p className="uppercase tracking-widest text-xs">Waiting_for_Image_Data</p>
                <p className="text-[10px] mt-1">Configure telemetry and acquire image to begin analysis.</p>
              </div>
            )}
          </div>

          {/* Results Summary HUD */}
          {predictionResult && (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-cyber-red/30 pt-4 font-mono text-xs uppercase">
                <div className="bg-cyber-gray/50 p-3 border border-cyber-red/10">
                    <p className="text-gray-500 mb-1">&gt; Status</p>
                    <p className="text-green-500 font-bold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Anomalies_Saved
                    </p>
                </div>
                <div className="bg-cyber-gray/50 p-3 border border-cyber-red/10">
                    <p className="text-gray-500 mb-1">&gt; Anomalies_Found</p>
                    <p className="text-cyber-red font-bold text-lg">
                        {predictionResult.potholes_found}
                    </p>
                </div>
                <div className="bg-cyber-gray/50 p-3 border border-cyber-red/10">
                    <p className="text-gray-500 mb-1">&gt; Latency</p>
                    <p className="text-cyber-neon font-bold">
                        {predictionResult.inference_time_ms.toFixed(2)} ms
                    </p>
                </div>
                 <div className="bg-cyber-gray/50 p-3 border border-cyber-red/10">
                    <p className="text-gray-500 mb-1">&gt; Est_Coordinates</p>
                    <p className="text-cyber-red font-bold text-[10px]">
                        {predictionResult.estimated_lat.toFixed(5)}, {predictionResult.estimated_lon.toFixed(5)}
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