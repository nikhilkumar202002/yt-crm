import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Filter, UserPlus, Download, Clock, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, UserCheck 
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
  const hasFetched = useRef(false);

  const fetchLeads = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getLeads(page); //
      
      const leadArray = result?.data?.data || []; //
      setLeads(leadArray);
      setPagination(result?.data); //
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
      alert('Excel file imported successfully');
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

  // Selection Handlers
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
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads & Pipeline</h1>
          <p className="text-[11px] text-slate-500 font-medium">Real-time lead synchronization</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FileImportModal onImport={handleImport} isLoading={isUploading} />
          <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">
            <Download size={14} /> Export
          </Button>
          <Button variant="primary" size="sm" className="flex-1 sm:flex-none">
            <UserPlus size={14} /> Add Lead
          </Button>
        </div>
      </div>

      {/* 2. Key Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PipelineMetric label="Sync Status" value="Active" variant="blue" icon={<Clock size={16} />} />
        <PipelineMetric 
          label="Total Records" 
          value={pagination?.total?.toString() || leads.length.toString()} 
          variant="dark" 
          icon={<CheckCircle2 size={16} />} 
        />
        <PipelineMetric label="System Health" value="100%" variant="white" icon={<AlertCircle size={16} />} />
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-blue-500" 
            placeholder="Search leads..." 
          />
        </div>
        <Button variant="secondary" size="sm"><Filter size={14} /> Filters</Button>
        
        {/* Conditional Assign Button */}
        {selectedLeads.length > 0 && (
          <Button 
            variant="primary" 
            size="sm" 
            className="animate-in slide-in-from-right-2"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <UserCheck size={14} /> Assign ({selectedLeads.length})
          </Button>
        )}
      </div>

      {/* 4. Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Directory...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300" 
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4">Lead Identity</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Service Interest</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Ad Campaign</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map(lead => (
                    <LeadTableRow 
                      key={lead.id} 
                      lead={lead} 
                      onDelete={handleDelete}
                      isSelected={selectedLeads.includes(lead.id)}
                      onSelect={() => toggleSelectLead(lead.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} leads
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={!pagination.prev_page_url}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1">
                    {pagination.links.filter((l: any) => !isNaN(Number(l.label))).map((link: any) => (
                      <button
                        key={link.label}
                        onClick={() => setCurrentPage(Number(link.label))}
                        className={`h-8 w-8 rounded-lg text-[11px] font-bold transition-all ${
                          link.active 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                            : 'text-slate-400 hover:bg-white border border-transparent hover:border-slate-200'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={!pagination.next_page_url}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assignment Modal Component */}
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