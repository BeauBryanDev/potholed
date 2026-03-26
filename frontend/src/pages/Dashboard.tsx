import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Activity, AlertTriangle, Crosshair, Map as MapIcon } from 'lucide-react';
import analyticService, { DashboardMetrics } from '../services/analyticService';

/**
 * Custom Cyberpunk Tooltip for Recharts
 * Ensures the hover details match the HUD aesthetic.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-black border border-cyber-red p-3 shadow-neon-red font-mono text-xs uppercase">
        <p className="text-gray-400 mb-1">&gt; {label}</p>
        <p className="text-cyber-red font-bold">
          Count: {payload[0].value}
        </p>
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
        <Activity className="w-8 h-8 animate-spin mb-4" />
        <p className="tracking-[0.2em] uppercase text-sm animate-pulse">Initializing_Telemetry...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-cyber-red">
        <div className="border border-cyber-red bg-cyber-red/10 p-6 flex items-center">
          <AlertTriangle className="mr-4 w-6 h-6" />
          <p className="uppercase tracking-widest">{error}</p>
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
    <div className="flex flex-col gap-6 font-mono text-gray-300">
      
      {/* HUD Header section */}
      <div className="flex justify-between items-end border-b border-cyber-red/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-cyber-red tracking-[0.2em] uppercase shadow-neon-red">
            Tactical_Overview
          </h1>
          <p className="text-xs text-cyber-red-dim tracking-widest mt-1">
            System Status: Nominal // Data Stream: Active
          </p>
        </div>
      </div>

      {/* Top KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-cyber-black border border-cyber-red/30 p-5 relative overflow-hidden group hover:border-cyber-red transition-colors duration-300">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <Crosshair className="text-cyber-red w-12 h-12" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Total_Anomalies_Detected</p>
          <p className="text-5xl font-bold text-cyber-red tracking-tighter">
            {metrics.overview.total_potholes}
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-cyber-black border border-cyber-red/30 p-5 relative overflow-hidden group hover:border-cyber-red transition-colors duration-300">
           <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <Activity className="text-cyber-red w-12 h-12" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">AI_Confidence_Index</p>
          <p className="text-5xl font-bold text-cyber-red tracking-tighter">
            {(metrics.overview.average_confidence * 100).toFixed(1)}%
          </p>
        </div>

        {/* KPI 3 (Static placeholder for future map sync) */}
        <div className="bg-cyber-black border border-cyber-red/30 p-5 relative overflow-hidden group hover:border-cyber-red transition-colors duration-300">
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <MapIcon className="text-cyber-red w-12 h-12" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Active_Zones_Monitored</p>
          <p className="text-5xl font-bold text-cyber-red tracking-tighter">
            {metrics.charts.towns_distribution.length}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        
        {/* Chart 1: Top Streets Bar Chart */}
        <div className="bg-cyber-black border border-cyber-red/30 p-4 flex flex-col">
          <p className="text-xs uppercase tracking-[0.2em] text-cyber-red mb-4 border-b border-cyber-red/20 pb-2">
            Critical_Sectors_Ranking
          </p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.top_streets} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="street" type="category" axisLine={false} tickLine={false} tick={{ fill: '#ff0000', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#ff0000" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution Donut */}
        <div className="bg-cyber-black border border-cyber-red/30 p-4 flex flex-col">
          <p className="text-xs uppercase tracking-[0.2em] text-cyber-red mb-4 border-b border-cyber-red/20 pb-2">
            Threat_Level_Distribution
          </p>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="square" wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#666' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center HUD Element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Crosshair className="text-cyber-red/30 w-12 h-12" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;