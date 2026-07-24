import React from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiChevronRight, FiCpu, FiLayout, FiSliders } from 'react-icons/fi';

const About = () => {
  const steps = [
    { title: 'Video Upload', desc: 'Securely receives surveillance H.264 streams on the backend.' },
    { title: 'YOLO Detection', desc: 'Runs advanced deep learning object detection to identify coordinates of people.' },
    { title: 'ByteTrack Tracking', desc: 'Applies Kalman filters and Hungarian algorithms to assign persistent motion IDs.' },
    { title: 'Heatmap Overlay', desc: 'Accumulates coordinates and applies blur + JET colormapping onto reference frames.' },
    { title: 'Telemetry Output', desc: 'Compiles coordinates, peaks, averages, and zone trends into single source-of-truth JSON.' },
  ];

  const stack = [
    { name: 'Ultralytics YOLO11', category: 'Vision Model', desc: 'State-of-the-art person detection (COCO class 0) optimized for fast inference.' },
    { name: 'ByteTrack Tracker', category: 'Object Tracking', desc: 'High-performance tracking algorithm maintaining persistent IDs across occlusions.' },
    { name: 'OpenCV Python', category: 'Frame Rendering', desc: 'Generates real heatmaps and overlays color boundaries onto output video streams.' },
    { name: 'FastAPI & Uvicorn', category: 'Backend Server', desc: 'High-performance API server with static video streaming support and SHA256 caching.' },
    { name: 'React 19 & Tailwind v4', category: 'Frontend Shell', desc: 'Modern user interface utilizing Framer Motion and Recharts for dynamic visual telemetry.' },
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">About Occurra</h2>
        <p className="text-sm text-slate-400 mt-1">
          Technical architecture, computer vision workflows, and project technologies.
        </p>
      </div>

      {/* Purpose */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
      >
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <FiInfo className="text-blue-400" />
          <span>Operational Concept</span>
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Occurra is built to address critical logistics, queue congestion, and security bottlenecks. 
          By combining deep learning object detectors with coordinate tracking systems, Occurra maps 
          the exact spatial dwell times of guests, giving managers visual density maps and automated operational recommendations.
        </p>
      </motion.div>

      {/* Pipeline Diagram */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <FiSliders className="text-emerald-400" />
          <span>AI Vision Pipeline Workflow</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3 relative group hover:border-slate-700"
            >
              <div>
                <span className="text-[10px] text-blue-500 font-extrabold uppercase">Step 0{idx + 1}</span>
                <h4 className="text-xs font-bold text-white mt-1">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-[50%] -translate-y-[50%] -right-2 text-slate-700 z-10 font-bold">
                  <FiChevronRight className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <FiCpu className="text-amber-400" />
          <span>Technology Blueprint</span>
        </h3>
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
          {stack.map((item, idx) => (
            <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-800/10 transition">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {item.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-1.5">{item.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
