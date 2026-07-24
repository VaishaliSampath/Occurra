import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiClock, FiActivity, FiVideo, FiTrash2, FiEye } from 'react-icons/fi';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = ({ latestAnalysis, history, clearHistory }) => {
  const navigate = useNavigate();

  // Find peak time or other helper subtexts
  const getAverageOccupancyText = () => {
    if (!latestAnalysis) return 'No active video';
    return `Across ${latestAnalysis.occupancyTrend?.length || 0} seconds`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy metrics and historical trend summaries.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-rose-400 font-semibold text-xs border border-slate-700 transition"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={() => navigate('/analysis')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition duration-150"
          >
            <FiVideo className="w-4 h-4" />
            <span>Analyze New Video</span>
          </button>
        </div>
      </div>

      {/* Main Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Current Occupancy"
          value={latestAnalysis ? latestAnalysis.currentOccupancy : 0}
          icon={<FiUsers className="w-5 h-5" />}
          description="Active in final frame"
          status="primary"
          delay={0.05}
        />
        <StatCard
          title="Peak Occupancy"
          value={latestAnalysis ? latestAnalysis.peakOccupancy : 0}
          icon={<FiTrendingUp className="w-5 h-5" />}
          description="Max simultaneous count"
          status="warning"
          delay={0.1}
        />
        <StatCard
          title="Average Occupancy"
          value={latestAnalysis ? latestAnalysis.averageOccupancy : 0}
          icon={<FiActivity className="w-5 h-5" />}
          description={getAverageOccupancyText()}
          status="success"
          delay={0.15}
        />
        <StatCard
          title="Unique People"
          value={latestAnalysis ? latestAnalysis.uniquePeople : 0}
          icon={<FiUsers className="w-5 h-5" />}
          description="Total tracked individuals"
          status="primary"
          delay={0.2}
        />
        <StatCard
          title="Processing Time"
          value={latestAnalysis ? `${latestAnalysis.processingTime}s` : '0.0s'}
          icon={<FiClock className="w-5 h-5" />}
          description="CV model execution time"
          status="danger"
          delay={0.25}
        />
      </div>

      {/* Bottom Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Analyses */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-lg font-bold text-white">Recent Analyses</h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-semibold">
              {history.length} Saved Run(s)
            </span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                <FiVideo className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-300">No analyses recorded yet</p>
                <p className="text-xs text-slate-500">Upload a video to populate your occupancy dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Video Name</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-center">Unique People</th>
                    <th className="py-3 px-4 text-center">Peak Count</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {history.map((item) => {
                    const isActive = latestAnalysis && latestAnalysis.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-800/30 transition-colors ${
                          isActive ? 'bg-blue-600/5 text-blue-400' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-semibold truncate max-w-[180px]">
                          {item.fileName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{item.timestamp}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{item.uniquePeople}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{item.peakOccupancy}</td>
                        <td className="py-3.5 px-4 text-right">
                          {isActive ? (
                            <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                // Load this run as active analysis
                                localStorage.setItem('occurra_latest', JSON.stringify(item));
                                window.location.reload();
                              }}
                              className="text-slate-400 hover:text-blue-400 flex items-center space-x-1 ml-auto"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              <span className="font-semibold">View</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Start Guide & Active Info */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h3 className="text-lg font-bold text-white">Active Profile</h3>
          </div>

          {latestAnalysis ? (
            <div className="space-y-5 flex-grow">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current File</span>
                <p className="text-sm font-bold text-white truncate">{latestAnalysis.fileName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">AI Assessment</span>
                <div className="p-3.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/15 text-xs leading-relaxed font-medium">
                  {latestAnalysis.recommendation}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/30">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Left</span>
                  <span className="text-sm font-bold text-white">{latestAnalysis.zoneCounts?.left || 0}</span>
                </div>
                <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/30">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Center</span>
                  <span className="text-sm font-bold text-white">{latestAnalysis.zoneCounts?.center || 0}</span>
                </div>
                <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/30">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Right</span>
                  <span className="text-sm font-bold text-white">{latestAnalysis.zoneCounts?.right || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center space-y-3 py-10">
              <FiActivity className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-xs text-slate-400 max-w-[200px]">
                No active analysis file. Go to the Video Analysis page to upload and process a file.
              </p>
            </div>
          )}

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2.5 leading-relaxed">
            <span className="font-semibold text-white block">Pipeline Steps:</span>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Upload local surveillance video.</li>
              <li>Neural net models frame detections.</li>
              <li>Assign unique persistent trajectory IDs.</li>
              <li>Compute coordinates, heatmaps, and zone counts.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
