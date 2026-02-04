import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, MessageSquare, Plus } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface LeadDescriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: string;
  onCommentChange: (text: string) => void;
  requirements: string[]; // Added
  onRequirementsChange: (reqs: string[]) => void; // Added
  onSave: () => void;
  isAdminOrHead: boolean;
}

export const LeadDescriptionModal = ({ 
  isOpen, onOpenChange, comment, onCommentChange, 
  requirements, onRequirementsChange, onSave, isAdminOrHead 
}: LeadDescriptionModalProps) => {
  const [newReq, setNewReq] = useState('');

  const addReq = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newReq.trim()) {
      e.preventDefault();
      onRequirementsChange([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const removeReq = (index: number) => {
    onRequirementsChange(requirements.filter((_, i) => i !== index));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-[120] font-sans">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" /> Lead Management
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600"><X size={16} /></Dialog.Close>
          </div>
          
          <div className="space-y-4">
            {/* Requirements Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requirements List</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[45px]">
                {requirements.map((req, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold flex items-center gap-1">
                    {req}
                    {!isAdminOrHead && <X size={10} className="cursor-pointer" onClick={() => removeReq(i)} />}
                  </span>
                ))}
                {!isAdminOrHead && (
                  <input 
                    className="bg-transparent border-none outline-none text-[10px] flex-1 min-w-[60px]"
                    placeholder="Type & Press Enter..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={addReq}
                  />
                )}
              </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Follow-up Note</label>
              <textarea
                readOnly={isAdminOrHead}
                className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[120px] outline-none transition-all ${
                  !isAdminOrHead ? 'focus:ring-2 focus:ring-blue-500 focus:bg-white' : 'cursor-default'
                }`}
                placeholder="Enter description..."
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
              />
            </div>
          </div>

          {!isAdminOrHead && (
            <div className="mt-4"><Button variant="primary" size="sm" className="w-full" onClick={onSave}><Save size={14} className="mr-2" /> Save Changes</Button></div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};