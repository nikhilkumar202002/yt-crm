import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
}

export const StatCard = ({ label, value, icon, trend, colorClass = 'border-blue-500' }: StatCardProps) => (
  <div className={`bg-white p-4 rounded-none shadow-sm border-l-2 ${colorClass} hover:shadow-md transition-shadow`}>
    <div className="flex justify-between items-center mb-3">
      <div className="p-1.5 bg-slate-50 rounded-none">{icon}</div>
      {trend && <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-none">{trend}</span>}
    </div>
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</h3>
    <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
  </div>
);