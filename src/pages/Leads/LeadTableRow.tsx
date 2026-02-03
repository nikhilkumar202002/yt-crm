import React from 'react';
import { ExternalLink } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';

interface Lead {
  id: number;
  name: string;
  source: string;
  status: string;
  assigned: string;
  date: string;
}

export const LeadTableRow = ({ lead }: { lead: Lead }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
          {lead.name.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 leading-none">{lead.name}</p>
          <p className="text-[10px] text-slate-400 mt-1 italic">Contact ID: #L-00{lead.id}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-[11px] font-medium text-slate-600">{lead.source}</td>
    <td className="px-6 py-4 text-[11px] text-slate-500">{lead.date}</td>
    <td className="px-6 py-4">
      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
        {lead.assigned}
      </span>
    </td>
    <td className="px-6 py-4">
      <LeadStatusBadge status={lead.status} />
    </td>
    <td className="px-6 py-4 text-right">
      <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
        <ExternalLink size={14} />
      </button>
    </td>
  </tr>
);