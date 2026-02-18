import React from 'react';
import { ExternalLink, Trash2, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const LeadTableRow = ({ lead, onDelete, isSelected, onSelect }: any) => (
  <tr className={`hover:bg-slate-50/50 transition-all group ${isSelected ? 'bg-blue-50/30' : ''} border-b border-slate-100/60`}>
    <td className="px-3 py-2 w-10">
      <input 
        type="checkbox" 
        className="h-3 w-3 rounded-none border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer" 
        checked={isSelected}
        onChange={onSelect}
      />
    </td>
    <td className="px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-none bg-blue-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm uppercase shrink-0 transition-transform group-hover:scale-105 tracking-widest">
          {lead.lead_data?.full_name?.charAt(0) || 'L'}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-900 tracking-tight leading-none mb-0.5 truncate max-w-[140px]">
            {lead.lead_data?.full_name || 'N/A'}
          </p>
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
            <span className="h-0.5 w-0.5 rounded-full bg-blue-400"></span>
            {lead.platform || 'General'}
          </p>
        </div>
      </div>
    </td>
    <td className="px-3 py-2">
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
          <Phone size={8} className="text-blue-500/70" /> {lead.lead_data?.phone || lead.lead_data?.phone_number || 'N/A'}
        </p>
        <p className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 truncate max-w-[120px]">
          <Mail size={8} className="text-slate-300/70" /> {lead.lead_data?.email || 'N/A'}
        </p>
      </div>
    </td>
    <td className="px-3 py-2">
      <span className="inline-flex px-1.5 py-0.5 rounded-none bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] font-black uppercase tracking-wider">
        {(lead.lead_data?.which_services_do_you_prefer || 'General Inquiry').replace(/_/g, ' ')}
      </span>
    </td>
    <td className="px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
        <div className="h-4 w-4 rounded-none bg-slate-100 flex items-center justify-center shrink-0">
          <Globe size={8} className="text-slate-400" />
        </div>
        <span className="capitalize">{lead.platform || 'Direct'}</span>
      </div>
    </td>
    <td className="px-3 py-2">
      <div className="space-y-0">
        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{lead.ad_name || 'Manual Entry'}</p>
        <p className="text-[8px] text-slate-400 font-bold italic truncate max-w-[120px]">
          {lead.form_name ? `Form: ${lead.form_name}` : 'No form data'}
        </p>
      </div>
    </td>
    <td className="px-3 py-2 text-right">
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-none transition-all active:scale-95">
          <ExternalLink size={12} />
        </button>
        <button onClick={() => onDelete(lead.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-none transition-all active:scale-95">
          <Trash2 size={12} />
        </button>
      </div>
    </td>
  </tr>
);