import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FiMap, FiTrendingUp, FiBarChart2, FiPieChart, FiAlertCircle } from 'react-icons/fi';
import { getApiBaseUrl } from '../services/api';

const HeatmapAnalytics = ({ latestAnalysis }) => {
  if (!latestAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center border border-slate-700/50">
          <FiAlertCircle className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-bold text-white">No Analytics Data Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please navigate to the Video Analysis tab, upload a surveillance video, and run the pipeline to populate this page.
          </p>
        </div>
      </div>
    );
  }

  // Formatting Zone data for Recharts Bar & Pie charts
  const zoneData = [
    { name: 'Left Zone', count: latestAnalysis.zoneCounts?.left || 0, fill: '#3b82f6' },
    { name: 'Center Zone', count: latestAnalysis.zoneCounts?.center || 0, fill: '#10b981' },
    { name: 'Right Zone', count: latestAnalysis.zoneCounts?.right || 0, fill: '#f59e0b' },
  ];

  const totalZoneVisits = zoneData.reduce((acc, curr) => acc + curr.count, 0);

  // Custom tooltips for a premium dark-themed aesthetic
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur border border-slate-800 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-300">{label ? `Time: ${label}` : ''}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || '#3b82f6' }} className="font-semibold">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Heatmap & Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">
          Spatial occupancy mapping and zone-based tracking visualizations.
        </p>
      </div>

      {/* Main Grid: Heatmap + Trend Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Heatmap Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2">
            <FiMap className="text-blue-400" />
            <span>Spatial Density Heatmap</span>
          </h3>
          <div className="rounded-xl overflow-hidden border border-slate-900 bg-black aspect-video flex items-center justify-center shadow-lg relative group">
            <img
              src={`${getApiBaseUrl()}${latestAnalysis.heatmap}`}
              alt="Spatial Heatmap Overlay"
              className="w-full h-full object-contain"
            />
            {/* Visual description badge */}
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] text-slate-400 font-bold uppercase py-1 px-2.5 rounded-lg tracking-wider">
              Heat intensity matches tracked dwell time
            </div>
          </div>
        </motion.div>

        {/* Occupancy Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2">
            <FiTrendingUp className="text-emerald-400" />
            <span>Occupancy Trend vs Time</span>
          </h3>
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latestAnalysis.occupancyTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: 10, fontWeight: 500 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  name="Occupancy"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#1e293b', strokeWidth: 1.5, fill: '#3b82f6' }}
                  activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Zone Analytics Cards and Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zone Statistics Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2 pb-2 border-b border-slate-800/80">
            <span>Zone Statistics (People Visited)</span>
          </h3>
          
          <div className="space-y-4">
            {zoneData.map((zone, idx) => {
              const percentage = totalZoneVisits > 0 ? ((zone.count / totalZoneVisits) * 100).toFixed(0) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">{zone.name}</span>
                    <span className="text-white">{zone.count} people ({percentage}%)</span>
                  </div>
                  {/* Progress bar representer */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: zone.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-white block mb-1">Spatial Distribution Profile:</span>
            By partitioning width into Left, Center, and Right intervals, the tracker tracks which region each unique track ID enters.
          </div>
        </motion.div>

        {/* Zone Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2">
            <FiBarChart2 className="text-blue-400" />
            <span>Zone Distribution (Bar)</span>
          </h3>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 10, fontWeight: 500 }} />
                <YAxis stroke="#64748b" style={{ fontSize: 10, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Unique Count" radius={[4, 4, 0, 0]}>
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Zone Share Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2">
            <FiPieChart className="text-amber-400" />
            <span>Occupancy Share (Proportional)</span>
          </h3>
          <div className="h-[230px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zoneData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeatmapAnalytics;
