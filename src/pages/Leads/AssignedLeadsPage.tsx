import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, Mail, Phone, User } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { getAssignedLeads, updateLeadStatus, updateLeadComment } from '../../api/services/microService';
import { LeadDescriptionModal } from './components/LeadDescriptionModal';

const AssignedLeadsPage = () => {
  const { roleName } = useAppSelector((state) => state.auth);
  const isAdminOrHead = ['ADMIN', 'DM HEAD'].includes(roleName?.toUpperCase() || '');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [commentModal, setCommentModal] = useState<{isOpen: boolean, id: number | null, text: string}>({
    isOpen: false, id: null, text: ''
  });

  const fetchAssignments = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getAssignedLeads(page);
      // Laravel paginated structure: result.data.data
      setAssignments(result?.data?.data || []);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) { 
      console.error("Fetch error", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchAssignments(currentPage);
  }, [currentPage, fetchAssignments]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === "") return;
    try {
      // API expects "user_status" in lowercase
      await updateLeadStatus(id, newStatus.toLowerCase()); 
      fetchAssignments(currentPage); 
    } catch (error) {
      alert("Status update failed. Please try again.");
    }
  };

  const handleSaveComment = async () => {
    if (!commentModal.id) return;
    try {
      // API expects "user_comment"
      await updateLeadComment(commentModal.id, commentModal.text);
      setCommentModal(prev => ({ ...prev, isOpen: false, id: null, text: '' }));
      fetchAssignments(currentPage); 
    } catch (error) {
      alert("Failed to save description.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Leads</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">SL NO</th>
                  <th className="px-6 py-4">Lead Identity</th>
                  <th className="px-6 py-4 text-center">Assign Status</th>
                  <th className="px-6 py-4 text-center">Lead Status</th>
                  <th className="px-6 py-4">Last Note</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.length > 0 ? (
                  assignments.map((item, index) => {
                    const slNo = pagination ? (pagination.from + index) : (index + 1);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-400">
                          {slNo}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-900 leading-none mb-2">
                            {item.lead?.lead_data?.full_name || 'N/A'}
                          </p>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Mail size={10} className="text-slate-400"/> {item.lead?.lead_data?.email}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Phone size={10} className="text-slate-400"/> {item.lead?.lead_data?.phone || item.lead?.lead_data?.phone_number}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase tracking-tighter">
                            {item.status || 'assigned'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {isAdminOrHead ? (
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold border uppercase shadow-sm ${
                              item.user_status?.toLowerCase() === 'hot' ? 'bg-red-500 text-white border-red-600' :
                              item.user_status?.toLowerCase() === 'warm' ? 'bg-amber-400 text-white border-amber-500' :
                              item.user_status?.toLowerCase() === 'cold' ? 'bg-sky-500 text-white border-sky-600' :
                              'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                              {item.user_status || 'New Lead'}
                            </span>
                          ) : (
                            <select 
                              value={item.user_status?.toLowerCase() || ''} 
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`text-[10px] font-bold p-1 rounded outline-none focus:ring-1 focus:ring-blue-500 border transition-all ${
                                  item.user_status?.toLowerCase() === 'hot' ? 'bg-red-50 border-red-200 text-red-600' :
                                  item.user_status?.toLowerCase() === 'warm' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                  item.user_status?.toLowerCase() === 'cold' ? 'bg-sky-50 border-sky-200 text-sky-600' :
                                  'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <option value="" className="text-slate-900 bg-white">Choose Status</option>
                              <option value="hot">Hot</option>
                              <option value="warm">Warm</option>
                              <option value="cold">Cold</option>
                            </select>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="max-w-[180px]">
                            <p className="text-[10px] text-slate-600 line-clamp-2 italic leading-relaxed">
                              {item.user_comment ? `"${item.user_comment}"` : <span className="text-slate-300">No follow-up notes...</span>}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                              <User size={12} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700">{item.user?.name}</span>
                           </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => setCommentModal({ isOpen: true, id: item.id, text: item.user_comment || '' })}
                            className={`p-2 rounded-lg transition-all ${item.user_comment ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100' : 'text-slate-300 hover:text-blue-500 hover:bg-slate-50'}`}
                          >
                            <MessageSquare size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic text-xs">
                      No assigned leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Improved Pagination Controls */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {pagination.from} - {pagination.to} of {pagination.total} Records
            </p>
            <div className="flex gap-2">
              <button
                disabled={!pagination.prev_page_url}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={!pagination.next_page_url}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <LeadDescriptionModal 
        isOpen={commentModal.isOpen}
        onOpenChange={(open) => setCommentModal(prev => ({ ...prev, isOpen: open }))}
        comment={commentModal.text}
        onCommentChange={(text) => setCommentModal(prev => ({ ...prev, text }))}
        onSave={handleSaveComment}
        isAdminOrHead={isAdminOrHead}
      />
    </div>
  );
};

export default AssignedLeadsPage;