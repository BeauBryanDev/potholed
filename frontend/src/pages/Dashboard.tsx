import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, AlertTriangle, Crosshair, Map as MapIcon } from 'lucide-react';
import analyticService, { DashboardMetrics } from '../services/analyticService';

/**
 * Custom Cyberpunk Tooltip for Recharts
 * Enlarged and enhanced with Town/City telemetry.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-cyber-black border-2 border-cyber-red p-4 shadow-[0_0_20px_rgba(255,0,0,0.4)] font-mono uppercase">
        <p className="text-gray-400 text-xs mb-1 tracking-widest">&gt; Sector: <span className="text-gray-200">{label}</span></p>
        {data.town && (
          <p className="text-gray-400 text-xs mb-2 tracking-widest">&gt; City : <span className="text-cyber-neon">{data.town}</span></p>
        )}
        <div className="border-t border-cyber-red/30 pt-2">
          <p className="text-cyber-red font-bold text-sm flex justify-between items-center">
            <span>Anomalies_Detected:</span>
            <span className="ml-4 tabular-nums">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await analyticService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('[Dashboard] Error fetching metrics:', err);
        setError('DATA_STREAM_INTERRUPTED // COULD NOT FETCH METRICS');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-cyber-red h-full">
        <Activity className="w-10 h-10 animate-spin mb-4" />
        <p className="tracking-[0.3em] uppercase text-sm animate-pulse">Initializing_Telemetry_Matrix...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-cyber-red">
        <div className="border-2 border-cyber-red bg-cyber-red/5 p-8 flex items-center shadow-neon-red">
          <AlertTriangle className="mr-6 w-8 h-8" />
          <p className="uppercase tracking-[0.2em] font-bold">{error}</p>
        </div>
      </div>
    );
  }

  // Transform severity object into an array for Recharts PieChart
  const severityData = [
    { name: 'HIGH_RISK (Large)', value: metrics.charts.severity_distribution.large, color: '#ff0000' },
    { name: 'MEDIUM_RISK', value: metrics.charts.severity_distribution.medium, color: '#ff4d4d' },
    { name: 'LOW_RISK (Small)', value: metrics.charts.severity_distribution.small, color: '#800000' },
  ];

  return (
    <div className="flex flex-col gap-8 font-mono text-gray-300 relative">
      {/* HUD Header section */}
      <div className="flex justify-between items-end border-b-2 border-cyber-red/40 pb-6 relative">
        <div className="absolute -bottom-[2px] left-0 w-24 h-[2px] bg-cyber-red"></div>
        <div>
          <h1 className="text-3xl font-black text-cyber-red tracking-[0.25em] uppercase shadow-neon-red drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
            Tactical_Overview_v.4
          </h1>
          <p className="text-sm text-cyber-red-dim tracking-[0.3em] mt-2 font-bold uppercase opacity-80">
            Node_Status: <span className="text-green-500">Nominal</span> // Data_Feed: <span className="text-cyber-neon animate-pulse">ACTIVE</span>
          </p>
        </div>
        <div className="hidden md:block text-[10px] text-gray-600 tracking-widest text-right">
          LATENCY: 0.0042ms<br />
          SYNC: STABLE
        </div>
      </div>

      {/* Top KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-cyber-black/80 border border-cyber-red/30 p-6 relative overflow-hidden group hover:border-cyber-red transition-all duration-300 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
            <Crosshair className="text-cyber-red w-14 h-14" />
          </div>
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-red"></div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 font-bold">Total_Anomalies_Logged</p>
          <p className="text-6xl font-black text-cyber-red tracking-tighter drop-shadow-sm">
            {metrics.overview.total_potholes}
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-cyber-black/80 border border-cyber-red/30 p-6 relative overflow-hidden group hover:border-cyber-red transition-all duration-300 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
            <Activity className="text-cyber-red w-14 h-14" />
          </div>
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-red"></div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 font-bold">AI_Detection_Precision</p>
          <p className="text-6xl font-black text-cyber-red tracking-tighter drop-shadow-sm">
            {(metrics.overview.average_confidence * 100).toFixed(1)}%
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-cyber-black/80 border border-cyber-red/30 p-6 relative overflow-hidden group hover:border-cyber-red transition-all duration-300 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
            <MapIcon className="text-cyber-red w-14 h-14" />
          </div>
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-red"></div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3 font-bold">Active_Deployment_Zones</p>
          <p className="text-6xl font-black text-cyber-red tracking-tighter drop-shadow-sm">
            {metrics.charts.towns_distribution.length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">

        {/* Chart 1: Top Streets Bar Chart */}
        <div className="bg-cyber-black/60 border border-cyber-red/30 p-6 flex flex-col backdrop-blur-md relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyber-red/20"></div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyber-red font-black mb-6 border-b border-cyber-red/20 pb-3 flex items-center">
            <span className="mr-3 text-lg opacity-50">&gt;</span> CRITICAL_SECTOR_ROSTER
          </p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.top_streets} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="street"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#ff4d4d', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}
                  width={150}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,0,0,0.1)' }} />
                <Bar
                  dataKey="count"
                  fill="#ff0000"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                  className="drop-shadow-[0_0_10px_rgba(255,0,0,0.4)]"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution Donut */}
        <div className="bg-cyber-black/60 border border-cyber-red/30 p-6 flex flex-col backdrop-blur-md relative">
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyber-red/20"></div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyber-red font-black mb-6 border-b border-cyber-red/20 pb-3 flex items-center">
            <span className="mr-3 text-lg opacity-50">&gt;</span> THREAT_CLASSIFICATION_FEED
          </p>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-crosshair"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#ff4d4d',
                    paddingTop: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center HUD Element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-14">
              <Crosshair className="text-cyber-red/20 w-16 h-16 animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* Decorative HUD Footer element */}
      <div className="mt-4 flex justify-between text-[10px] text-cyber-red-dim tracking-[0.5em] font-bold uppercase opacity-30">
        <span>HUD_CONSOLE_INIT_SUCCESS</span>
        <span>SYS_LOG_9921_OK</span>
      </div>
    </div>
  );
};

export default Dashboard;