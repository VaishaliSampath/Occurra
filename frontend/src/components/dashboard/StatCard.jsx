import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, description, trend, status = 'info', delay = 0 }) => {
  const getColors = () => {
    switch (status) {
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          glow: 'group-hover:shadow-emerald-500/5',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          glow: 'group-hover:shadow-amber-500/5',
        };
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          glow: 'group-hover:shadow-rose-500/5',
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          glow: 'group-hover:shadow-blue-500/5',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-6 rounded-2xl flex items-start justify-between group ${colors.glow}`}
    >
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-white">
            {value}
          </span>
          {trend && (
            <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {description}
        </p>
      </div>
      <div className={`p-3.5 rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;
