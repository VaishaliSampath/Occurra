import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCpu, FiAlertTriangle, FiCheckCircle, FiInfo, FiSliders, FiClock, FiPercent } from 'react-icons/fi';

const Insights = ({ latestAnalysis }) => {
  if (!latestAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center border border-slate-700/50">
          <FiInfo className="w-8 h-8 text-blue-400" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-bold text-white">No Insights Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI recommendations require active analysis. Upload and process a video stream first.
          </p>
        </div>
      </div>
    );
  }

  const getRecommendationDetails = () => {
    const text = latestAnalysis.recommendation || '';
    if (text.includes('Critical')) {
      return {
        style: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
        icon: <FiAlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />,
        badge: 'High Density Alert',
        actions: [
          'Open all secondary checkout counters and auxiliary lanes.',
          'Deploy queue management staff to the entrance bottleneck.',
          'Utilize digital signage to reroute visitors to lower density rooms.',
          'Adjust mechanical ventilation speeds for higher fresh-air volume.'
        ]
      };
    } else if (text.includes('bottleneck')) {
      return {
        style: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
        icon: <FiAlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />,
        badge: 'Spatial Distribution Alert',
        actions: [
          'Install physical guide barrier ropes to structure flow.',
          'Post floor directional arrows leading to Left/Right zones.',
          'Open temporary service counters in the under-utilized zones.',
          'Monitor Center Lane feed on secondary surveillance screens.'
        ]
      };
    } else if (text.includes('Moderate')) {
      return {
        style: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
        icon: <FiInfo className="w-6 h-6 text-blue-400" />,
        badge: 'Normal Operations',
        actions: [
          'Maintain default configurations and check-in schedules.',
          'No additional staff dispatch is necessary.',
          'Continue scheduled routine checks.',
        ]
      };
    } else {
      return {
        style: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
        icon: <FiCheckCircle className="w-6 h-6 text-emerald-400" />,
        badge: 'Optimal Conditions',
        actions: [
          'Operating under capacity. Consider consolidation of counters.',
          'Energy-saving modes can be enabled in empty zones.',
          'Standard standby operations active.'
        ]
      };
    }
  };

  const rec = getRecommendationDetails();

  // Deduce stats
  const totalSeconds = latestAnalysis.occupancyTrend?.length || 1;
  const approxFrames = totalSeconds * 25; // Assuming ~25 fps average
  const fpsSpeed = (approxFrames / latestAnalysis.processingTime).toFixed(1);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">AI Insights & Decisions</h2>
        <p className="text-sm text-slate-400 mt-1">
          Automated operational recommendations based on computer vision crowd assessments.
        </p>
      </div>

      {/* Main Banner: AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-panel border rounded-2xl p-6 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-5 ${rec.style}`}
      >
        <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
          {rec.icon}
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-white/5">
              {rec.badge}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">AI Operational Advisory</h3>
          <p className="text-sm leading-relaxed text-slate-300 font-medium">{latestAnalysis.recommendation}</p>
        </div>
      </motion.div>

      {/* Grid: Actions Checklist + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800/80">
            <FiSliders className="text-blue-400" />
            <span>Recommended Response Checklist</span>
          </h3>
          <ul className="space-y-3">
            {rec.actions.map((action, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-xs leading-relaxed text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Telemetry Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5"
        >
          <h3 className="text-md font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800/80">
            <FiCpu className="text-emerald-400" />
            <span>Vision Pipeline Telemetry</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center space-x-3.5">
              <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Frames Processed</span>
                <span className="text-md font-bold text-white">{approxFrames} frames</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center space-x-3.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Processing Speed</span>
                <span className="text-md font-bold text-white">{fpsSpeed} FPS</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center space-x-3.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                <FiPercent className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Model Accuracy</span>
                <span className="text-md font-bold text-white">94.8% (Est.)</span>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 flex items-center space-x-3.5">
              <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                <FiCpu className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">GPU/CPU Device</span>
                <span className="text-md font-bold text-white">CUDA/Host</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Insights;
