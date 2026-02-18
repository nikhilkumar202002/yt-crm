import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Calculator, Loader2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { updateProposalDetails, ProposalDetailsPayload } from '../../../api/services/microService';

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number | null;
  onSuccess: () => void;
}

export const ProposalDetailsModal = ({ isOpen, onOpenChange, proposalId, onSuccess }: ProposalDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProposalDetailsPayload>({
    creatives_nos: 0,
    videos_nos: 0,
    description: '',
    amount: 0,
    gst_percentage: 18
  });

  const totalAmount = formData.amount + (formData.amount * formData.gst_percentage / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalId) return;
    try {
      setLoading(true);
      await updateProposalDetails(proposalId, formData);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Failed to update proposal details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-none p-6 shadow-2xl z-[120] font-sans border border-slate-200">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Financial Scoping</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 leading-none">Adjust proposal metadata</p>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-none transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Creatives (Nos)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  value={formData.creatives_nos} 
                  onChange={e => setFormData({...formData, creatives_nos: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Videos (Nos)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  value={formData.videos_nos} 
                  onChange={e => setFormData({...formData, videos_nos: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Strategic Description</label>
              <textarea 
                required 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold min-h-[80px] focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none" 
                placeholder="Enter scope details..."
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Base Amount</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                   <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold focus:ring-1 focus:ring-blue-500 outline-none transition-all text-emerald-600" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">GST %</label>
                <input 
                  type="number" 
                  disabled 
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-none text-[11px] font-bold text-slate-400 cursor-not-allowed" 
                  value={formData.gst_percentage} 
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-none border border-slate-200 flex items-center justify-between border-l-4 border-l-blue-600">
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-blue-600" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Gross Total</span>
              </div>
              <span className="text-[14px] font-black text-blue-700">₹{totalAmount.toLocaleString()}</span>
            </div>

            <Button 
              disabled={loading} 
              className="w-full h-11 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Finalize Scoping'}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};