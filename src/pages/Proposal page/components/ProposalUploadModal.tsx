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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl z-[120] font-sans animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Dialog.Title asChild>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  {proposalId ? 'Update Proposal' : 'Upload Proposal'}
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                  {proposalId ? `Proposal ID: #${proposalId}` : `Lead ID: #${leadId}`}
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* File Dropzone / Upload Box */}
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-10 transition-all flex flex-col items-center justify-center gap-4 ${
                file 
                ? 'border-green-400 bg-green-50/50' 
                : 'border-slate-200 hover:border-blue-400 bg-slate-50'
              }`}
            >
              {file ? (
                <>
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 border border-green-100">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-green-800 line-clamp-1 max-w-[200px] uppercase tracking-tighter">
                      {file.name}
                    </p>
                    <button 
                      onClick={() => setFile(null)} 
                      className="text-[10px] text-red-500 font-black uppercase mt-2 hover:underline tracking-widest"
                    >
                      Remove File
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 border border-slate-100">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <label className="text-xs font-black text-blue-600 cursor-pointer hover:text-blue-700 tracking-tight">
                      {proposalId ? 'Choose New PDF' : 'Click to choose PDF'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="application/pdf" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      Max file size 10MB
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            <Button 
              disabled={!file || uploading} 
              className="w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20"
              onClick={handleUpload}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> 
                  Processing...
                </div>
              ) : proposalId ? 'Update PDF' : 'Submit Proposal'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};