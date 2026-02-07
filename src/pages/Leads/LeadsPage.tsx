import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, UserPlus, Download, Clock, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, UserCheck, ChevronDown 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LeadTableRow } from './LeadTableRow';
import { PipelineMetric } from './PipelineMetric';
import { FileImportModal } from './FileImportModal';
import { AssignLeadsModal } from './components/AssignLeadsModal';
import { getLeads, uploadLeads, deleteLead } from '../../api/services/microService';

const LeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchLeads = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getLeads(page);
      const leadArray = result?.data?.data || [];
      setLeads(leadArray);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage, fetchLeads]);

  const handleImport = async (file: File) => {
    try {
      setIsUploading(true);
      await uploadLeads(file);
      fetchLeads(1); 
    } catch (error) {
      alert('Upload failed. Check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this lead?')) {
      try {
        await deleteLead(id);
        fetchLeads(currentPage);
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length && leads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: number) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Leads & Pipeline</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest leading-none">Master Lead Directory</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FileImportModal onImport={handleImport} isLoading={isUploading} />
          <Button variant="secondary" size="sm" className="h-8 border-slate-200 text-[10px] font-bold px-3">
            <Download size={12} /> EXPORT
          </Button>
          <Button variant="primary" size="sm" className="h-8 text-[10px] font-bold shadow-sm px-3">
            <UserPlus size={12} /> ADD LEAD
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics - High Density */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PipelineMetric label="Sync Status" value="Active" variant="blue" icon={<Clock size={14} />} />
        <PipelineMetric 
          label="Total Records" 
          value={pagination?.total?.toString() || leads.length.toString()} 
          variant="white" 
          icon={<CheckCircle2 size={14} className="text-green-500" />} 
        />
        <PipelineMetric label="Health Index" value="99.4%" variant="white" icon={<AlertCircle size={14} className="text-blue-500" />} />
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200/60 flex gap-2 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={13} />
          <input 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent rounded-md text-[11px] font-medium outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-400" 
            placeholder="Search leads..." 
          />
        </div>
        
        {selectedLeads.length > 0 && (
          <Button 
            variant="primary" 
            size="sm" 
            className="h-8 text-[10px] bg-indigo-600 hover:bg-indigo-700 animate-in zoom-in-95 font-bold"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <UserCheck size={12} /> ASSIGN ({selectedLeads.length})
          </Button>
        )}
        
        <Button variant="secondary" size="sm" className="h-8 border-slate-200 text-[10px] font-bold px-3">
          <Filter size={12} /> FILTERS
        </Button>
      </div>

      {/* 4. Table Section - Removed min-h-[400px] to allow growth */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={20} />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Updating Registry...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer" 
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-5 py-3">Lead Identity</th>
                <th className="px-5 py-3">Engagement</th>
                <th className="px-5 py-3">Preferences</th>
                <th className="px-5 py-3">Origin</th>
                <th className="px-5 py-3">Campaign Data</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.length > 0 ? (
                leads.map(lead => (
                  <LeadTableRow 
                    key={lead.id} 
                    lead={lead} 
                    onDelete={handleDelete}
                    isSelected={selectedLeads.includes(lead.id)}
                    onSelect={() => toggleSelectLead(lead.id)}
                  />
                ))
              ) : !loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[11px] text-slate-400 italic font-medium">
                    No lead records found in current synchronization.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - High Density */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-5 py-2.5 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {pagination.from}-{pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={!pagination.prev_page_url}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all active:scale-95"
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex gap-1">
                {pagination.links.filter((l: any) => !isNaN(Number(l.label))).map((link: any) => (
                  <button
                    key={link.label}
                    onClick={() => setCurrentPage(Number(link.label))}
                    className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all ${
                      link.active 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <button
                disabled={!pagination.next_page_url}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all active:scale-95"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AssignLeadsModal 
        isOpen={isAssignModalOpen} 
        onOpenChange={setIsAssignModalOpen}
        selectedLeadIds={selectedLeads}
        onSuccess={() => {
          setSelectedLeads([]);
          fetchLeads(currentPage);
        }}
      />
    </div>
  );
};

export default LeadsPage;