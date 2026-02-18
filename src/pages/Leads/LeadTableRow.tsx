import React from 'react';
import { ExternalLink, Trash2, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const LeadTableRow = ({ lead, onDelete, isSelected, onSelect }: any) => (
  <tr className={`hover:bg-slate-50/50 transition-all group ${isSelected ? 'bg-blue-50/30' : ''}`}>
    <td className="px-5 py-3">
      <input 
        type="checkbox" 
        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer" 
        checked={isSelected}
        onChange={onSelect}
      />
    </td>
    <td className="px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm uppercase transition-transform group-hover:scale-105">
          {lead.lead_data?.full_name?.charAt(0) || 'L'}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-900 tracking-tight leading-none mb-1 truncate max-w-[140px]">
            {lead.lead_data?.full_name || 'N/A'}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-blue-400"></span>
            {lead.platform || 'General'}
          </p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
          <Phone size={10} className="text-blue-500/70" /> {lead.lead_data?.phone || lead.lead_data?.phone_number || 'N/A'}
        </p>
        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 truncate max-w-[180px]">
          <Mail size={10} className="text-slate-300/70" /> {lead.lead_data?.email || 'N/A'}
        </p>
      </div>
    </td>
    <td className="px-5 py-3">
      <span className="inline-flex px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50 text-[9px] font-bold uppercase tracking-wide">
        {(lead.lead_data?.which_services_do_you_prefer || 'General Inquiry').replace(/_/g, ' ')}
      </span>
    </td>
    <td className="px-5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
          <Globe size={10} className="text-slate-400" />
        </div>
        <span className="capitalize">{lead.platform || 'Direct'}</span>
      </div>
    </td>
    <td className="px-5 py-3">
      <div className="space-y-0.5">
        <p className="text-[11px] font-bold text-slate-700 truncate max-w-[140px]">{lead.ad_name || 'Manual Entry'}</p>
        <p className="text-[9px] text-slate-400 font-bold italic truncate max-w-[140px]">
          {lead.form_name ? `Form: ${lead.form_name}` : 'No form data'}
        </p>
      </div>
    </td>
    <td className="px-5 py-3 text-right">
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95">
          <ExternalLink size={14} />
        </button>
        <button onClick={() => onDelete(lead.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95">
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  </tr>
);