import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface LeadDescriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: string;
  onCommentChange: (text: string) => void;
  onSave: () => void;
  isAdminOrHead: boolean;
}

export const LeadDescriptionModal = ({ 
  isOpen, 
  onOpenChange, 
  comment, 
  onCommentChange, 
  onSave, 
  isAdminOrHead 
}: LeadDescriptionModalProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-[120] font-sans">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" /> Lead Description
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </Dialog.Close>
          </div>
          
          <textarea
            readOnly={isAdminOrHead}
            className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[150px] outline-none transition-all ${
              !isAdminOrHead ? 'focus:ring-2 focus:ring-blue-500 focus:bg-white' : 'cursor-default'
            }`}
            placeholder={isAdminOrHead ? "No description provided." : "Enter lead follow-up details..."}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />

          {!isAdminOrHead && (
            <div className="mt-4">
              <Button variant="primary" size="sm" className="w-full" onClick={onSave}>
                <Save size={14} className="mr-2" /> Save Description
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};