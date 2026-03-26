import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Activity, AlertTriangle, Filter } from 'lucide-react';
import townService, { TownResponse } from '../services/townService';
import detectionService, { GeoJSONFeatureCollection } from '../services/detectionService';

const IntelMap: React.FC = () => {
  const [towns, setTowns] = useState<TownResponse[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default Center: Bogotá, Colombia
  const defaultCenter: L.LatLngExpression = [4.6097, -74.0817];
  const defaultZoom = 12;

  // Load Towns on mount
  useEffect(() => {
    townService.getTowns().then(setTowns).catch(console.error);
  }, []);

  // Fetch GeoJSON when a town is selected
  useEffect(() => {
    if (!selectedTownId) {
      setGeoData(null);
      return;
    }

    const fetchMapData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await detectionService.getTownGeoJSON(parseInt(selectedTownId));
        setGeoData(data);
      } catch (err) {
        console.error('[IntelMap] Failed to fetch GeoJSON:', err);
        setError('GEO_DATA_STREAM_FAILED // UNABLE TO RENDER INTEL');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [selectedTownId]);

  /**
   * Custom rendering for each GeoJSON point.
   * Converts standard pins into Cyberpunk glowing nodes based on severity.
   */
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const isHighSeverity = feature.properties?.severity === 'high';
    const markerColor = isHighSeverity ? '#ff0000' : '#ffcc00';
    const radiusSize = isHighSeverity ? 8 : 5;

    return L.circleMarker(latlng, {
      radius: radiusSize,
      fillColor: markerColor,
      color: markerColor,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };

  /**
   * Binds a popup to each rendered feature to display metadata.
   * Styled to match the HUD aesthetic.
   */
  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { detection_id, pothole_count, confidence_avg, detected_at } = feature.properties;
      const confidencePercent = (confidence_avg * 100).toFixed(1);
      const dateStr = new Date(detected_at).toLocaleDateString();

      // Cyberpunk HTML Popup
      const popupContent = `
        <div style="font-family: monospace; color: #ff0000; background: #0a0a0a; padding: 8px; border: 1px solid #ff0000; text-transform: uppercase;">
          <strong style="color: #666;">ID:</strong> ${detection_id}<br/>
          <strong style="color: #666;">ANOMALIES:</strong> ${pothole_count}<br/>
          <strong style="color: #666;">CONFIDENCE:</strong> ${confidencePercent}%<br/>
          <strong style="color: #666;">LOGGED:</strong> ${dateStr}
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-mono text-gray-300 h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red">
            Geospatial_Intel_Map
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1 flex items-center">
            <MapIcon className="w-3 h-3 mr-2" /> Live_Telemetry_Feed
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={selectedTownId}
            onChange={(e) => setSelectedTownId(e.target.value)}
            className="bg-cyber-black border border-cyber-red/30 text-cyber-red p-2 text-xs focus:outline-none focus:border-cyber-red transition-colors uppercase tracking-widest"
          >
            <option value="">-- Select_Target_Zone --</option>
            {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="border-l-4 border-cyber-red bg-cyber-red/10 p-3 flex items-start shrink-0">
          <AlertTriangle className="text-cyber-red w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase tracking-wider">{error}</p>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative border border-cyber-red/30 bg-cyber-black overflow-hidden z-0">
        
        {isLoading && (
          <div className="absolute inset-0 bg-cyber-black/80 z-50 flex flex-col items-center justify-center text-cyber-red">
            <Activity className="w-12 h-12 animate-spin mb-4" />
            <p className="animate-pulse tracking-widest uppercase">Rendering_GeoData...</p>
          </div>
        )}

        {/* Note: MapContainer needs a fixed height to render properly */}
        <MapContainer 
          center={defaultCenter} 
          zoom={defaultZoom} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false} // Disable default controls to add them manually if needed, or keep false for cleaner UI
        >
          {/* CartoDB Dark Matter Base Map - Perfect for Cyberpunk */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Render GeoJSON if data exists. 
              The 'key' prop forces React to re-mount the component when data changes, 
              ensuring Leaflet updates the markers. */}
          {geoData && (
            <GeoJSON 
              key={selectedTownId + geoData.features.length} 
              data={geoData} 
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Floating HUD Legends */}
        <div className="absolute bottom-4 left-4 z-[400] bg-cyber-black/90 border border-cyber-red/30 p-3 text-[10px] uppercase tracking-widest">
          <p className="text-gray-500 mb-2 border-b border-cyber-red/20 pb-1">Threat_Legend</p>
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-[#ff0000] border border-[#ff0000] mr-2 shadow-[0_0_5px_#ff0000]"></span>
            High_Risk (&gt;3 Anomalies)
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-[#ffcc00] border border-[#ffcc00] mr-2 ml-0.5"></span>
            Medium_Risk
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelMap;