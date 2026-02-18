import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { createProposal, updateProposalFile } from '../../../api/services/microService';
import { useNavigate } from 'react-router-dom';

interface ProposalUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number | null;
  proposalId?: number | null; // Tracks if we are updating an existing file
  onSuccess?: () => void;
}

export const ProposalUploadModal = ({ 
  isOpen, 
  onOpenChange, 
  leadId, 
  proposalId, // Receive from parent
  onSuccess 
}: ProposalUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      
      if (proposalId) {
        // Logic: Use PUT if proposalId exists
        await updateProposalFile(Number(proposalId), file);
      } else {
        // Logic: Use POST for new uploads
        await createProposal(Number(leadId), file);
      }

      // Navigate to proposal page to refresh and show updated data
      navigate('/proposals');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save proposal. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-none p-6 shadow-2xl z-[120] font-sans border border-slate-200">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div>
              <Dialog.Title asChild>
                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  {proposalId ? 'Document Update' : 'Document Pipeline'}
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest leading-none">
                  Reference: {proposalId ? `PROP-${proposalId}` : `LEAD-${leadId}`}
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-none transition-colors">
               <X size={16} />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* File Dropzone / Upload Box */}
            <div 
              className={`relative border border-dashed rounded-none p-10 transition-all flex flex-col items-center justify-center gap-4 ${
                file 
                ? 'border-emerald-500 bg-emerald-50/30' 
                : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
            >
              {file ? (
                <>
                  <div className="h-14 w-14 bg-white border border-emerald-100 flex items-center justify-center text-emerald-500 rounded-none shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-emerald-900 line-clamp-1 max-w-[200px] uppercase tracking-tighter">
                      {file.name}
                    </p>
                    <button 
                      onClick={() => setFile(null)} 
                      className="text-[9px] text-red-500 font-black uppercase mt-2 hover:underline tracking-[0.2em] block mx-auto"
                    >
                      Delete Selection
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 bg-white border border-slate-200 flex items-center justify-center text-slate-300 rounded-none shadow-sm group-hover:border-blue-200 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="text-center">
                    <label className="text-[10px] font-black text-blue-600 cursor-pointer hover:text-blue-700 tracking-[0.1em] uppercase block">
                      Select Proposal PDF
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="application/pdf" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      Standard PDF Format (Max 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            <Button 
              disabled={!file || uploading} 
              className="w-full h-11 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all"
              onClick={handleUpload}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> 
                  Transferring...
                </div>
              ) : proposalId ? 'Confirm Update' : 'Initialize Proposal'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};