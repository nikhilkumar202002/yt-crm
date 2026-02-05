import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, MessageSquare, Layers, Settings2, Check } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface LeadDescriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: string;
  onCommentChange: (text: string) => void;
  requirements: string[];
  onRequirementsChange: (reqs: string[]) => void;
  selectedServiceIds: number[];
  onServiceIdsChange: (ids: number[]) => void;
  otherService: string;
  onOtherServiceChange: (text: string) => void;
  onSave: () => void;
  isAdminOrHead: boolean;
  availableServices: any[];
}

export const LeadDescriptionModal = ({ 
  isOpen, onOpenChange, comment, onCommentChange, 
  requirements, onRequirementsChange, selectedServiceIds, onServiceIdsChange,
  otherService, onOtherServiceChange, onSave, isAdminOrHead, availableServices = [] 
}: LeadDescriptionModalProps) => {

  const [newReq, setNewReq] = useState('');

  // Improved check: find if any selected ID belongs to a service named "Others"
 const isOthersSelected = selectedServiceIds.some(id => {
    const service = availableServices.find(s => s.id === id);
    const name = service?.name.toLowerCase() || '';
    return name === 'other' || name === 'others';
  });

  const toggleService = (id: number, name: string) => {
    const isSelected = selectedServiceIds.includes(id);
    const nextIds = isSelected 
      ? selectedServiceIds.filter(sid => sid !== id) 
      : [...selectedServiceIds, id];
    
    onServiceIdsChange(nextIds);

    // Sync only standard services to visual badges (exclude placeholder "Other" items)
    const lowerName = name.toLowerCase();
    if (lowerName !== 'other' && lowerName !== 'others') {
      if (!isSelected && !requirements.includes(name)) {
        onRequirementsChange([...requirements, name]);
      } else if (isSelected) {
        onRequirementsChange(requirements.filter(r => r !== name));
      }
    }
  };


const handleOtherServiceSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = otherService.trim();
      if (trimmedValue && !requirements.includes(trimmedValue)) {
        onRequirementsChange([...requirements, trimmedValue]);
        // Do not clear onOtherServiceChange here if you need it for the specific API payload
      }
    }
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
          
         <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {!isAdminOrHead && (
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Layers size={10}/> Select Services
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
            {availableServices.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id, s.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${
                  selectedServiceIds.includes(s.id) 
                  ? 'bg-blue-600 text-white border-blue-700' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.name}
                {selectedServiceIds.includes(s.id) && <Check size={12} />}
              </button>
            ))}
          </div>

          {/* Input field appears if "Other" or "Others" is selected in the list above */}
          {isOthersSelected && (
            <div className="space-y-1 animate-in slide-in-from-top-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Settings2 size={10}/> Specify Other Service
              </label>
              <input 
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Type service and press Enter to list..."
                value={otherService}
                onChange={(e) => onOtherServiceChange(e.target.value)}
                onKeyDown={handleOtherServiceSubmit}
              />
            </div>
          )}
        </div>
      )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requirements List</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[45px]">
                {requirements.map((req, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold flex items-center gap-1">
                    {req}
                    {!isAdminOrHead && <X size={10} className="cursor-pointer" onClick={() => onRequirementsChange(requirements.filter((_, idx) => idx !== i))} />}
                  </span>
                ))}
                {!isAdminOrHead && (
                  <input 
                    className="bg-transparent border-none outline-none text-[10px] flex-1 min-w-[60px]"
                    placeholder="Add custom requirement..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && newReq.trim()) {
                        onRequirementsChange([...requirements, newReq.trim()]);
                        setNewReq('');
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Follow-up Note</label>
              <textarea
                readOnly={isAdminOrHead}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/20"
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
              />
            </div>
          </div>

          {!isAdminOrHead && (
            <div className="mt-4">
              <Button variant="primary" size="sm" className="w-full" onClick={onSave}>
                <Save size={14} className="mr-2" /> Save Changes
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};