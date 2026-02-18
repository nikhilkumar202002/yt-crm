import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Download, User, Calendar, MessageSquare, IndianRupee, Image as ImageIcon, Video as VideoIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getProposalDetail } from '../../../api/services/microService';

interface ProposalViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number | null;
}

export const ProposalViewModal = ({ isOpen, onOpenChange, proposalId }: ProposalViewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!proposalId || !isOpen) return;
      try {
        setLoading(true);
        const res = await getProposalDetail(proposalId);
        setProposal(res?.data);
      } catch (error) {
        console.error("Failed to fetch proposal details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [proposalId, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-none p-0 shadow-2xl z-[120] font-sans border border-slate-200 overflow-hidden">
          
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 text-white rounded-none flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText size={16} />
              </div>
              <div>
                <Dialog.Title className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  Proposal Document Detail
                </Dialog.Title>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reference ID: PROP-{proposalId}</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-200 rounded-none transition-colors">
               <X size={18} />
            </Dialog.Close>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                 <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Document Data...</p>
              </div>
            ) : proposal ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Client & Lead Info */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-blue-600 pl-2">
                       Client Relationship
                    </label>
                    <div className="bg-slate-50 p-4 rounded-none border border-slate-200 space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white border border-slate-200 flex items-center justify-center rounded-none text-slate-400">
                             <User size={14}/>
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{proposal.lead_assign?.lead?.lead_data?.full_name || 'N/A'}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">{proposal.lead_assign?.lead?.platform || 'Direct'}</p>
                          </div>
                       </div>
                       <div className="pt-2 border-t border-slate-200 space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-2">
                             <span className="w-16">Assigned To:</span>
                             <span className="text-slate-800">{proposal.lead_assign?.user?.name || 'N/A'}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-2">
                             <span className="w-16">Created On:</span>
                             <span className="text-slate-800">{new Date(proposal.created_at).toLocaleDateString()}</span>
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Stat Summary */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-indigo-600 pl-2">
                       Proposal Scope
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-blue-50/50 p-3 border border-blue-100/50 text-center">
                          <ImageIcon size={14} className="mx-auto text-blue-500 mb-1"/>
                          <p className="text-[14px] font-black text-blue-700 leading-none">{proposal.creatives_nos}</p>
                          <p className="text-[8px] font-black text-blue-400 uppercase mt-1">Creatives</p>
                       </div>
                       <div className="bg-indigo-50/50 p-3 border border-indigo-100/50 text-center">
                          <VideoIcon size={14} className="mx-auto text-indigo-500 mb-1"/>
                          <p className="text-[14px] font-black text-indigo-700 leading-none">{proposal.videos_nos}</p>
                          <p className="text-[8px] font-black text-indigo-400 uppercase mt-1">Videos</p>
                       </div>
                       <div className="col-span-2 bg-emerald-50/50 p-3 border border-emerald-100/50 flex items-center justify-between px-4">
                          <div className="flex items-center gap-2">
                             <IndianRupee size={14} className="text-emerald-500"/>
                             <div>
                                <p className="text-[14px] font-black text-emerald-700 leading-none">₹{(Number(proposal.amount) || 0).toLocaleString()}</p>
                                <p className="text-[8px] font-black text-emerald-400 uppercase mt-1">Base Amount</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-emerald-600 leading-none">+{proposal.gst_percentage}% GST</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-orange-600 pl-2">
                       Project Strategy & Notes
                    </label>
                    <div className="bg-slate-50 p-4 border border-slate-200">
                       <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                          {proposal.description || "No strategic description provided for this document."}
                       </p>
                    </div>
                </div>

                {/* Document Links */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      {proposal.is_accepted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-widest">
                           <CheckCircle2 size={12}/> Proposal Accepted
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-black uppercase tracking-widest">
                           Pending Review
                        </div>
                      )}
                   </div>
                   
                   {proposal.file_url && (
                     <a 
                       href={proposal.file_url} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                     >
                        <Download size={14}/> Download PDF
                     </a>
                   )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                 <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest">Failed to load proposal data.</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
