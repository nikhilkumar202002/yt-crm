import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, MessageSquare, Layers, Settings2, Check, ChevronRight, Tag } from 'lucide-react';
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
  selectedSubServiceIds: number[]; 
  onSubServiceIdsChange: (ids: number[]) => void; 
  otherService: string;
  onOtherServiceChange: (text: string) => void;
  onSave: () => void;
  isAdminOrHead: boolean;
  availableServices: any[];
}

export const LeadDescriptionModal = ({ 
  isOpen, onOpenChange, comment, onCommentChange, 
  requirements, onRequirementsChange, selectedServiceIds, onServiceIdsChange,
  selectedSubServiceIds, onSubServiceIdsChange,
  otherService, onOtherServiceChange, onSave, isAdminOrHead, availableServices = [] 
}: LeadDescriptionModalProps) => {

  const subServicesToDisplay = useMemo(() => {
    return availableServices
      .filter(service => selectedServiceIds.includes(service.id))
      .flatMap(service => service.sub_services || []);
  }, [availableServices, selectedServiceIds]);

  const toggleService = (id: number, name: string) => {
    const isSelected = selectedServiceIds.includes(id);
    const nextIds = isSelected 
      ? selectedServiceIds.filter(sid => sid !== id) 
      : [...selectedServiceIds, id];
    
    onServiceIdsChange(nextIds);

    if (isSelected) {
      const parentService = availableServices.find(s => s.id === id);
      const childIds = parentService?.sub_services?.map((ss: any) => ss.id) || [];
      onSubServiceIdsChange(selectedSubServiceIds.filter(ssid => !childIds.includes(ssid)));
      
      const childNames = parentService?.sub_services?.map((ss: any) => ss.name) || [];
      onRequirementsChange(requirements.filter(r => r !== name && !childNames.includes(r)));
    } else {
      if (!requirements.includes(name)) onRequirementsChange([...requirements, name]);
    }
  };

  const toggleSubService = (id: number, name: string) => {
    const isSelected = selectedSubServiceIds.includes(id);
    const nextIds = isSelected 
      ? selectedSubServiceIds.filter(sid => sid !== id) 
      : [...selectedSubServiceIds, id];
    
    onSubServiceIdsChange(nextIds);
    
    if (!isSelected && !requirements.includes(name)) {
      onRequirementsChange([...requirements, name]);
    } else if (isSelected) {
      onRequirementsChange(requirements.filter(r => r !== name));
    }
  };

  // Helper function to determine badge style
  const getBadgeStyle = (reqName: string) => {
    // Check if it's a main service
    const isMain = availableServices.some(s => s.name === reqName);
    
    if (isMain) {
      // Main Service: Blue Theme
      return "bg-blue-50 border-blue-200 text-blue-700";
    }
    // Sub Service (or custom): Indigo/Purple Theme
    return "bg-indigo-50 border-indigo-200 text-indigo-700";
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" />
        
        <Dialog.Content 
          aria-describedby={undefined} 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl z-[120] font-sans focus:outline-none flex flex-col max-h-[90vh]"
        >
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Settings2 size={16} className="text-blue-600" />
              </div>
              <Dialog.Title className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Service Alignment
              </Dialog.Title>
            </div>
            <Dialog.Close className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={16} /></Dialog.Close>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            
            <div className="space-y-4">
              
              {/* 1. MAIN SERVICE */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                  <Layers size={9} className="text-blue-500" /> 1. Main Category
                </label>
                <div className="space-y-0.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {availableServices.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => toggleService(s.id, s.name)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                        selectedServiceIds.includes(s.id) ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {selectedServiceIds.includes(s.id) && <Check size={10} strokeWidth={3} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. SUB SERVICE */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                  <ChevronRight size={9} className="text-indigo-500" /> 2. Specific Sub-Services
                </label>
                <div className="space-y-0.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {subServicesToDisplay.length > 0 ? (
                    subServicesToDisplay.map((ss: any) => (
                      <div 
                        key={ss.id} 
                        onClick={() => toggleSubService(ss.id, ss.name)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          selectedSubServiceIds.includes(ss.id) ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className="truncate">{ss.name}</span>
                        {selectedSubServiceIds.includes(ss.id) && <Check size={10} strokeWidth={3} />}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-[9px] text-slate-400 italic text-center">Select a main category</div>
                  )}
                </div>
              </div>

              {/* 3. BADGES - WITH SEPARATE COLORS */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                  <Tag size={9} className="text-emerald-500" /> 3. Requirements Scope
                </label>
                <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-100 rounded-xl min-h-[40px]">
                  {requirements.length > 0 ? (
                    requirements.map((req, i) => (
                      <span 
                        key={i} 
                        className={`px-1.5 py-0.5 bg-white border text-[8px] font-black uppercase rounded-md flex items-center gap-1 shadow-sm ${getBadgeStyle(req)}`}
                      >
                        {req}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-slate-300 font-medium italic">No services selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. NOTES */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                <MessageSquare size={9} className="text-orange-500" /> 4. Discussion Description
              </label>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-medium min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                placeholder="Enter detailed client requirements or follow-up notes here..."
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button variant="primary" size="sm" className="w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20" onClick={onSave}>
              <Save size={14} className="mr-2" /> Sync Changes
            </Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};