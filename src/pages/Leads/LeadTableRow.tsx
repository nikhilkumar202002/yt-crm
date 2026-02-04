import React from 'react';
import { ExternalLink, Trash2, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const LeadTableRow = ({ lead, onDelete, isSelected, onSelect }: any) => (
  <tr className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-blue-50/30' : ''}`}>
    <td className="px-6 py-4">
      <input 
        type="checkbox" 
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
        checked={isSelected}
        onChange={onSelect}
      />
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase">
          {lead.lead_data?.full_name?.charAt(0) || 'L'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
            {lead.lead_data?.full_name || 'N/A'}
          </p>
          <p className="text-[9px] text-slate-400 mt-1.5 font-medium uppercase tracking-tight flex items-center gap-1">
            <Globe size={8} /> {lead.platform}
          </p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-600 font-bold flex items-center gap-1.5">
          <Phone size={10} className="text-blue-500" /> {lead.lead_data?.phone || lead.lead_data?.phone_number || 'N/A'}
        </p>
        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate max-w-[150px]">
          <Mail size={10} className="text-slate-400" /> {lead.lead_data?.email || 'N/A'}
        </p>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100 text-[9px] font-bold uppercase tracking-wider">
        {(lead.lead_data?.which_services_do_you_prefer || 'General Inquiry').replace(/_/g, ' ')}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 truncate max-w-[100px]">
        <MapPin size={10} className="text-red-400" />
        <span className="capitalize">{lead.lead_data?.city || 'Unknown'}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{lead.ad_name}</p>
        <p className="text-[9px] text-slate-400 italic truncate max-w-[120px]">Form: {lead.form_name}</p>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex items-center justify-end gap-2">
        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><ExternalLink size={14} /></button>
        <button onClick={() => onDelete(lead.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
      </div>
    </td>
  </tr>
);