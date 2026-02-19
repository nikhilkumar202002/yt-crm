import React from 'react';

interface PipelineMetricProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'dark' | 'white';
  subtext?: string;
}

export const PipelineMetric = ({ label, value, icon, variant = 'white', subtext }: PipelineMetricProps) => {
  const themes = {
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-200',
    dark: 'bg-slate-900 text-white',
    white: 'bg-white border border-slate-200 text-slate-900',
  };



  return (
    <div className={`${themes[variant]} p-4 rounded-none`}>
      <div className="flex justify-between items-start mb-2">
        <div className={variant === 'blue' ? 'text-blue-200' : 'text-slate-500'}>
          {icon}
        </div>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${variant === 'blue' ? 'text-blue-100' : 'text-slate-400'}`}>
        {label}
      </p>
      <p className="text-xl font-bold">{value}</p>
      {subtext && <p className="text-[9px] mt-1 opacity-70">{subtext}</p>}
    </div>
  );
};