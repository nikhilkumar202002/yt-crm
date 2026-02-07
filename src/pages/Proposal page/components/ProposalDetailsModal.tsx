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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-[120] font-sans">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Update Financial Details</h2>
            <Dialog.Close className="text-slate-400 hover:text-slate-600"><X size={20} /></Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Creatives (Nos)</label>
                <input type="number" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                  value={formData.creatives_nos} onChange={e => setFormData({...formData, creatives_nos: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Videos (Nos)</label>
                <input type="number" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                  value={formData.videos_nos} onChange={e => setFormData({...formData, videos_nos: Number(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Description</label>
              <textarea required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold min-h-[80px]" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Amount</label>
                <input type="number" step="0.01" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                  value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST %</label>
                <input type="number" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-400" 
                  value={formData.gst_percentage} readOnly />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-900 uppercase">Total Amount</span>
              </div>
              <span className="text-sm font-black text-blue-700">₹{totalAmount.toLocaleString()}</span>
            </div>

            <Button disabled={loading} className="w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Details'}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};