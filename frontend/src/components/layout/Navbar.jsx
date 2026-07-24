import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiWifi, FiWifiOff, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { getApiBaseUrl } from '../../services/api';

const Navbar = () => {
  const [status, setStatus] = useState('checking');
  const [model, setModel] = useState('YOLO11n');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await axios.get(getApiBaseUrl());
        if (response.data && response.data.status === 'online') {
          setStatus('online');
          if (response.data.model) {
            setModel(response.data.model);
          }
        } else {
          setStatus('offline');
        }
      } catch (err) {
        setStatus('offline');
      }
    };

    checkConnection();
    // Re-check every 15 seconds
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-16 glass-panel border-b border-slate-800 z-10 flex items-center justify-between px-8 bg-slate-950/20">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <FiTrendingUp className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
          Intelligent Occupancy Control Center
        </span>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center space-x-6">
        {/* Model Identifier */}
        <div className="flex items-center space-x-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <FiCpu className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">
            Model: <span className="text-blue-400">{model}</span>
          </span>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center">
          {status === 'online' ? (
            <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <FiWifi className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
            </div>
          ) : status === 'offline' ? (
            <div className="flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <FiWifiOff className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">System Offline</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-800/50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider">Checking API...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
