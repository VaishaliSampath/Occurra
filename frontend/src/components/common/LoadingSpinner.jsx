import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ uploadProgress }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Uploading raw video stream', trigger: uploadProgress < 100 },
    { label: 'Initializing YOLO11 detector & loading neural network', trigger: uploadProgress === 100 },
    { label: 'Applying ByteTrack object tracking & assigning IDs', trigger: false },
    { label: 'Compiling spatial heatmap & mapping coordinates', trigger: false },
    { label: 'Structuring analytics JSON response & saving cache', trigger: false },
  ];

  useEffect(() => {
    if (uploadProgress < 100) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(1);

    // Simulate the computer vision steps since server takes a few seconds
    const t1 = setTimeout(() => setCurrentStep(2), 2500);
    const t2 = setTimeout(() => setCurrentStep(3), 4800);
    const t3 = setTimeout(() => setCurrentStep(4), 6800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [uploadProgress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto p-8 rounded-2xl glass-card text-center space-y-8">
      {/* Outer Glow Spinner */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-400 border-b-transparent border-l-transparent"
        ></motion.div>
        {uploadProgress < 100 ? (
          <span className="text-lg font-bold text-blue-400">{uploadProgress}%</span>
        ) : (
          <FiLoader className="w-8 h-8 text-blue-400 animate-spin" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Processing Video Analytics</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          AI pipeline is analyzing movement vectors. This may take a moment depending on length.
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="w-full text-left space-y-3.5 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div key={idx} className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center space-x-3">
                {isDone ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <FiCheck className="w-2.5 h-2.5" />
                  </div>
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"></div>
                )}
                <span className={isDone ? 'text-slate-500 line-through' : isActive ? 'text-blue-400' : 'text-slate-400'}>
                  {step.label}
                </span>
              </div>
              {isActive && (
                <span className="text-[10px] text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingSpinner;
