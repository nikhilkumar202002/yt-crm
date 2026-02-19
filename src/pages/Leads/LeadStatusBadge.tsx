

interface LeadStatusBadgeProps {
  status: string;
}

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'new';
    
    switch (normalizedStatus) {
      case 'new': 
        return 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10';
      case 'hot':
        return 'bg-red-50 text-red-600 border-red-100 ring-red-500/10';
      case 'warm':
        return 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/10';
      case 'cold':
        return 'bg-cyan-50 text-cyan-600 border-cyan-100 ring-cyan-500/10';
      case 'qualified': 
      case 'approved':
      case 'won':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10';
      case 'contacted':
      case 'follow up':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10';
      case 'lost':
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10';
      case 'junk':
      case 'spam':
        return 'bg-slate-100 text-slate-500 border-slate-200 ring-slate-500/10';
      default: 
        return 'bg-slate-50 text-slate-400 border-slate-100 ring-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'new';
    if (normalizedStatus === 'hot') return '🔥';
    if (normalizedStatus === 'warm') return '⚡';
    if (normalizedStatus === 'cold') return '❄️';
    if (normalizedStatus === 'won' || normalizedStatus === 'approved') return '✅';
    if (normalizedStatus === 'lost' || normalizedStatus === 'rejected') return '❌';
    return null;
  };

  return (
    <span className={`
      inline-flex items-center justify-center gap-1
      px-2 py-0.5 rounded-none 
      text-[9px] font-black uppercase tracking-wider
      border shadow-sm ring-1 ring-inset transition-all duration-200
      ${getStatusStyle(status)}
    `}>
      {getStatusIcon(status) && <span>{getStatusIcon(status)}</span>}
      {status || 'New'}
    </span>
  );
};