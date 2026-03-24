import { Activity, AlertTriangle, MapPin, ShieldAlert } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-cyber-black p-8 relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="scanline" />

      {/* Header HUD */}
      <header className="border-b border-cyber-red/30 pb-4 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-cyber-red text-2xl font-bold tracking-tighter uppercase italic">
            Pothole Guard // System v1.0
          </h1>
          <p className="text-cyber-red-dim text-xs font-mono">Status: Scanning_Infrastructure...</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs">Auth_User: BEAU_04</p>
          <p className="text-green-500 text-xs">Network: Online</p>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="border border-cyber-red/20 bg-cyber-gray/50 p-6 rounded-sm hover:border-cyber-red/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <ShieldAlert className="text-cyber-red group-hover:animate-pulse" />
            <h2 className="text-white text-sm uppercase tracking-widest">Total_Detections</h2>
          </div>
          <p className="text-4xl font-bold text-cyber-red">--</p>
        </div>

        {/* Card 2 */}
        <div className="border border-cyber-red/20 bg-cyber-gray/50 p-6 rounded-sm">
          <div className="flex items-center gap-4 mb-4">
            <Activity className="text-cyber-red" />
            <h2 className="text-white text-sm uppercase tracking-widest">System_Latency</h2>
          </div>
          <p className="text-4xl font-bold text-cyber-red">0ms</p>
        </div>

        {/* Card 3 */}
        <div className="border border-cyber-red/20 bg-cyber-gray/50 p-6 rounded-sm">
          <div className="flex items-center gap-4 mb-4">
            <MapPin className="text-cyber-red" />
            <h2 className="text-white text-sm uppercase tracking-widest">Active_Zones</h2>
          </div>
          <p className="text-4xl font-bold text-cyber-red">0</p>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="absolute bottom-4 left-8 right-8 flex justify-between text-[10px] text-gray-600 font-mono uppercase tracking-widest">
        <span>&gt; DB_Connected: PostgreSQL</span>
        <span>&gt; AI_Engine: YOLOv8-ONNX</span>
        <span>&gt; Lat_Long: 4.6097, -74.0817</span>
      </footer>
    </div>
  )
}

export default App