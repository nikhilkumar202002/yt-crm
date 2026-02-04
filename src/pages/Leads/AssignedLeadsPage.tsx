import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, Mail, Phone, User, Hash, Globe, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { getAssignedLeads, updateLeadStatus, updateLeadComment, updateLeadRequirements } from '../../api/services/microService';
import { LeadDescriptionModal } from './components/LeadDescriptionModal';
import { Button } from '../../components/common/Button';

const AssignedLeadsPage = () => {
  const { roleName } = useAppSelector((state) => state.auth);
  const isAdminOrHead = ['ADMIN', 'DM HEAD'].includes(roleName?.toUpperCase() || '');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [commentModal, setCommentModal] = useState<{isOpen: boolean, id: number | null, text: string, requirements: string[]}>({
    isOpen: false, id: null, text: '', requirements: []
  });

  const fetchAssignments = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getAssignedLeads(page);
      setAssignments(result?.data?.data || []);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) { 
      console.error("Fetch error", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchAssignments(currentPage); }, [currentPage, fetchAssignments]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === "") return;
    try {
      await updateLeadStatus(id, newStatus.toLowerCase()); 
      fetchAssignments(currentPage); 
    } catch (error) { alert("Error updating status"); }
  };

  const handleSaveData = async () => {
    if (!commentModal.id) return;
    try {
      await Promise.all([
        updateLeadComment(commentModal.id, commentModal.text),
        updateLeadRequirements(commentModal.id, commentModal.requirements)
      ]);
      setCommentModal(prev => ({ ...prev, isOpen: false }));
      fetchAssignments(currentPage); 
    } catch (error) { alert("Failed to save data."); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Leads</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage and track follow-ups</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[450px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">#</th>
                  <th className="px-6 py-4 min-w-[200px]">Lead Identity</th>
                  {isAdminOrHead && (
                    <th className="px-6 py-4">Assignment Info</th>
                  )}
                  <th className="px-6 py-4 text-center">Lead Status</th>
                  <th className="px-6 py-4">Requirements</th>
                  <th className="px-6 py-4">Last note</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.map((item, index) => {
                  const slNo = pagination ? (pagination.from + index) : (index + 1);
                  const leadData = item.lead?.lead_data;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-400">{slNo}</td>
                      
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-none mb-2 truncate max-w-[150px]">
                            {leadData?.full_name || 'Anonymous Lead'}
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                              <Mail size={12} className="text-blue-400" /> {leadData?.email || 'N/A'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                              <Phone size={12} className="text-green-500" /> {leadData?.phone || leadData?.phone_number || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Combined Assignment Column for Admin View */}
                      {isAdminOrHead && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                                <User size={12} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{item.user?.name}</span>
                            </div>
                            <span className="w-fit px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200">
                              {item.status || 'assigned'}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 text-center">
                        {isAdminOrHead ? (
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase shadow-sm ${
                            item.user_status?.toLowerCase() === 'hot' ? 'bg-red-500 text-white border-red-600' :
                            item.user_status?.toLowerCase() === 'warm' ? 'bg-amber-400 text-white border-amber-500' :
                            item.user_status?.toLowerCase() === 'cold' ? 'bg-sky-500 text-white border-sky-600' :
                            'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>{item.user_status || 'New'}</span>
                        ) : (
                          <select 
                            value={item.user_status?.toLowerCase() || ''} 
                            onChange={(e) => handleStatusChange(item.id, e.target.value)} 
                            className={`text-[10px] font-bold p-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                              item.user_status?.toLowerCase() === 'hot' ? 'bg-red-50 border-red-200 text-red-600' :
                              item.user_status?.toLowerCase() === 'warm' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                              item.user_status?.toLowerCase() === 'cold' ? 'bg-sky-50 border-sky-200 text-sky-600' :
                              'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <option value="">Choose status</option>
                            <option value="hot">🔥 Hot</option>
                            <option value="warm">⚡ Warm</option>
                            <option value="cold">❄️ Cold</option>
                          </select>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                          {item.lead_requirements?.length > 0 ? (
                            item.lead_requirements.map((req: string, i: number) => {
                              const colors = [
                                'bg-indigo-50 text-indigo-600 border-indigo-100',
                                'bg-purple-50 text-purple-600 border-purple-100',
                                'bg-teal-50 text-teal-600 border-teal-100'
                              ];
                              return (
                                <span key={i} className={`px-2 py-0.5 rounded-md border text-[9px] font-bold whitespace-nowrap ${colors[i % 3]}`}>
                                  {req}
                                </span>
                              )
                            })
                          ) : (
                            <div className="flex items-center gap-1 text-slate-300 text-[9px] font-medium italic">
                              <AlertCircle size={10} /> No requirements
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <p className="text-[10px] text-slate-600 line-clamp-2 italic font-medium">
                            {item.user_comment ? `"${item.user_comment}"` : 'Pending follow-up...'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setCommentModal({ 
                            isOpen: true, 
                            id: item.id, 
                            text: item.user_comment || '', 
                            requirements: item.lead_requirements || [] 
                          })}
                          className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                            item.user_comment || item.lead_requirements?.length > 0
                              ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' 
                              : 'bg-slate-50 text-slate-300 border-slate-200 hover:text-blue-500 hover:bg-white'
                          }`}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Logic remained identical to previous correct version */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Records {pagination.from} - {pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={!pagination.prev_page_url} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8 w-8 p-0 flex items-center justify-center rounded-lg"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={!pagination.next_page_url} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8 w-8 p-0 flex items-center justify-center rounded-lg"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadDescriptionModal 
        isOpen={commentModal.isOpen} 
        onOpenChange={(open) => setCommentModal(prev => ({ ...prev, isOpen: open }))}
        comment={commentModal.text} 
        onCommentChange={(text) => setCommentModal(prev => ({ ...prev, text }))}
        requirements={commentModal.requirements} 
        onRequirementsChange={(reqs) => setCommentModal(prev => ({ ...prev, requirements: reqs }))}
        onSave={handleSaveData} 
        isAdminOrHead={isAdminOrHead} 
      />
    </div>
  );
};

export default AssignedLeadsPage;