import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiVideo, FiActivity, FiMap, FiInfo } from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Video Analysis', path: '/analysis', icon: <FiVideo className="w-5 h-5" /> },
    { name: 'Heatmap Analytics', path: '/heatmap', icon: <FiMap className="w-5 h-5" /> },
    { name: 'Insights', path: '/insights', icon: <FiActivity className="w-5 h-5" /> },
    { name: 'About', path: '/about', icon: <FiInfo className="w-5 h-5" /> },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 glass-panel border-r border-slate-800 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
              O
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Occurra
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                Occupancy AI
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border-l-4 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-l-4 border-transparent'
                }`
              }
            >
              <span className="transition-transform group-hover:scale-110 duration-200">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/20 text-center">
        <p className="text-xs text-slate-500">Occurra System v1.0.0</p>
        <p className="text-[10px] text-blue-400/70 font-semibold mt-1 uppercase tracking-wider">
          Hackathon Edition
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
