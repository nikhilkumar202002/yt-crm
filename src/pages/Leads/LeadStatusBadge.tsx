import React from 'react';

interface LeadStatusBadgeProps {
  status: string;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Qualified': return 'bg-green-50 text-green-600 border-green-100';
      case 'Contacted': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[9px] font-bold border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};