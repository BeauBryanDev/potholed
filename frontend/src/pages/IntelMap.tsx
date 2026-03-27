import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Activity, AlertTriangle, Filter, Crosshair, ZoomIn, Layers } from 'lucide-react';
import townService, { TownResponse } from '../services/townService';
import detectionService, { GeoJSONFeatureCollection } from '../services/detectionService';

/**
 * Bounds Refitter Component
 * Automatically zooms the map to fit the current GeoJSON features.
 */
const BoundsRefitter = ({ geoData }: { geoData: GeoJSONFeatureCollection | null }) => {
  const map = useMap();
  useEffect(() => {
    if (geoData && geoData.features.length > 0) {
      const bounds = L.geoJSON(geoData).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
      }
    }
  }, [geoData, map]);
  return null;
};

const IntelMap: React.FC = () => {
  const [towns, setTowns] = useState<TownResponse[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Default Center: Bogotá
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
        console.log(`[IntelMap] Data received: ${data.features.length} features.`);
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
   */
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const isHigh = feature.properties?.pothole_count > 3;
    const markerColor = isHigh ? '#ff0000' : '#ffa500';

    return L.circleMarker(latlng, {
      radius: isHigh ? 10 : 7,
      fillColor: markerColor,
      color: markerColor,
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.6,
      className: isHigh ? 'pulse-marker-high' : 'pulse-marker-med'
    });
  };

  /**
   * HUD-themed Popups
   */
  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { detection_id, pothole_count, confidence_avg, detected_at } = feature.properties;
      const confidencePercent = (confidence_avg * 100).toFixed(1);
      const dateStr = new Date(detected_at).toLocaleString();

      const popupContent = `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 12px; border: 2px solid #ff0000; min-width: 200px; box-shadow: 0 0 15px rgba(255,0,0,0.5);">
          <div style="border-bottom: 1px solid #ff000033; padding-bottom: 6px; margin-bottom: 8px; font-weight: 900; letter-spacing: 0.1em; color: #ff0000;">
            > ANOMALY_REPORT_${detection_id}
          </div>
          <div style="font-size: 11px; line-height: 1.6;">
            <p style="margin: 2px 0;"><span style="color: #666;">COUNT:</span> <span style="color: #ff0000; font-weight: bold;">${pothole_count}</span></p>
            <p style="margin: 2px 0;"><span style="color: #666;">ACCURACY:</span> ${confidencePercent}%</p>
            <p style="margin: 2px 0; border-top: 1px solid #333; margin-top: 6px; padding-top: 6px; color: #aaa;">${dateStr}</p>
          </div>
        </div>
      `;
      layer.bindPopup(popupContent, { className: 'cyber-popup', closeButton: false });
    }
  };

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 h-[calc(100vh-8rem)] relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[-1]"></div>

      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-cyber-red/40 pb-6 shrink-0 relative gap-4">
        <div className="absolute -bottom-[2px] left-0 w-32 h-[2px] bg-cyber-red"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
            Geospatial_Intel_Center
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-bold uppercase opacity-90 flex items-center">
            <Activity className="w-4 h-4 mr-2 animate-pulse text-cyber-neon" /> Node: <span className="text-gray-100 mx-2">COL_HUB_01</span> // Feed: <span className="text-cyber-neon ml-2">ENCRYPTED</span>
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-4 bg-cyber-black/80 border border-cyber-red/20 p-2 backdrop-blur-sm">
          <div className="flex items-center px-3 border-r border-cyber-red/20">
            <Filter className="w-4 h-4 text-cyber-red mr-3" />
            <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">Sector_Selection</span>
          </div>
          <select
            value={selectedTownId}
            onChange={(e) => setSelectedTownId(e.target.value)}
            className="bg-transparent border-none text-gray-100 p-2 text-sm focus:outline-none focus:ring-0 uppercase tracking-widest cursor-pointer hover:text-cyber-red transition-colors min-w-[200px]"
          >
            <option value="" className="bg-cyber-black italic">-- Deploy_Sector --</option>
            {towns.map(t => <option key={t.id} value={t.id} className="bg-cyber-black">{t.name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="border border-cyber-red/50 bg-cyber-red/5 p-4 flex items-start shrink-0 relative overflow-hidden animate-alert-flash">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyber-red"></div>
          <AlertTriangle className="text-cyber-red w-5 h-5 mr-4 flex-shrink-0" />
          <p className="text-cyber-red text-xs uppercase font-black tracking-widest">{error}</p>
        </div>
      )}

      {/* Main Map HUB */}
      <div className="flex-1 relative border-2 border-cyber-red/20 bg-cyber-black overflow-hidden z-0 shadow-2xl">

        {isLoading && (
          <div className="absolute inset-0 bg-cyber-black/90 z-[500] flex flex-col items-center justify-center text-cyber-red backdrop-blur-sm">
            <Crosshair className="w-16 h-16 animate-spin mb-6 text-cyber-neon" />
            <p className="animate-pulse tracking-[0.5em] text-lg font-black uppercase">Syncing_Orbital_Telemetry...</p>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%', zIndex: 1, cursor: 'crosshair' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <BoundsRefitter geoData={geoData} />

          {geoData && (
            <GeoJSON
              key={selectedTownId + (geoData.features.length || 0)}
              data={geoData}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <div className="bg-cyber-black/80 border border-cyber-red/30 p-2 flex items-center justify-center cursor-pointer hover:bg-cyber-red/20 transition-all text-cyber-red" title="Zoom_Home" onClick={() => window.location.reload()}>
              <ZoomIn className="w-5 h-5" />
            </div>
            <div className="bg-cyber-black/80 border border-cyber-red/30 p-2 flex items-center justify-center cursor-pointer hover:bg-cyber-red/20 transition-all text-cyber-red">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </MapContainer>

        {/* Legend Panel */}
        <div className="absolute bottom-6 left-6 z-[400] bg-cyber-black/95 border-2 border-cyber-red/40 p-5 backdrop-blur-md min-w-[220px]">
          <div className="flex items-center mb-4 border-b border-cyber-red/20 pb-2">
            <Crosshair className="w-4 h-4 text-cyber-red mr-3" />
            <span className="text-xs font-black text-cyber-red tracking-[0.2em] uppercase">Anomaly_Classification</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center group">
              <span className="w-4 h-4 rounded-full bg-red-600 mr-3 border-2 border-red-400 shadow-[0_0_10px_#ff0000] animate-pulse"></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-100 tracking-wider uppercase">Critical_Sector</span>
                <span className="text-[9px] text-gray-500 tracking-widest uppercase">&gt; 3 Active_Anomalies</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-orange-500 mr-4 border border-orange-300 shadow-[0_0_5px_#ffa500]"></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-200 tracking-wider uppercase">Active_Anomaly</span>
                <span className="text-[9px] text-gray-500 tracking-widest uppercase">Verified_Standard_Risk</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyber-red/10 flex justify-between items-center text-[9px] text-cyber-red-dim font-bold tracking-[0.3em]">
            <span>SYSTEM_ARMED</span>
            <span>GPS: LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelMap;