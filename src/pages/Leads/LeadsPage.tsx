import React, { useState } from 'react';
import { Search, Filter, UserPlus, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LeadTableRow } from './LeadTableRow';
import { PipelineMetric } from './PipelineMetric';
import { FileImportModal } from './FileImportModal';

const LeadsPage = () => {
  const [leads] = useState([
    { id: 1, name: 'Alex Rivera', source: 'Meta Ads', status: 'New', assigned: 'Sales A', date: '2024-02-03' },
    { id: 2, name: 'Sarah Chen', source: 'Website', status: 'Qualified', assigned: 'Sales B', date: '2024-02-02' },
    // ... more leads
  ]);

  const handleImport = (file: File) => {
    console.log('Processing file:', file.name);
    // Here you would typically call your apiService to send the file to /leads/capture
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leads & Pipeline</h1>
          <p className="text-[11px] text-slate-500">Manage lead capture and auto-assignment</p>
        </div>
        <div className="flex gap-2">
            <FileImportModal onImport={handleImport} />
          <Button variant="secondary" size="sm"><Download size={14} /> Export</Button>
          <Button variant="primary" size="sm"><UserPlus size={14} /> Add Lead</Button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-[11px]" placeholder="Search leads..." />
        </div>
        <Button variant="secondary" size="sm"><Filter size={14} /> Filters</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Lead Name</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map(lead => <LeadTableRow key={lead.id} lead={lead} />)}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PipelineMetric label="Avg. Response" value="14.2m" variant="blue" icon={<Clock size={16} />} />
        <PipelineMetric label="Qualification" value="68%" variant="dark" icon={<CheckCircle2 size={16} />} />
        <PipelineMetric label="High-Priority" value="3 Pending" variant="white" icon={<AlertCircle size={16} />} />
      </div>
    </div>
  );
};

export default LeadsPage;