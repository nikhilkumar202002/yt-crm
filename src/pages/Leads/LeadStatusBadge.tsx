import React from 'react';

interface LeadStatusBadgeProps {
  status: string;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    // Standardizing status to lowercase for robust matching
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'new': 
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'qualified': 
      case 'approved':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'contacted': 
      case 'warm':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'hot':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'cold':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      default: 
        return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <span className={`
      inline-flex items-center justify-center
      px-2 py-0.5 rounded-full 
      text-[9px] font-black uppercase tracking-tighter
      border shadow-sm transition-all duration-200
      ${getStatusStyle(status)}
    `}>
      {status}
    </span>
  );
};