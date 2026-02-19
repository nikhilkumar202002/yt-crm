import { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, MessageSquare, Layers, Settings2, Check, AlertCircle, Search } from 'lucide-react';
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
  availableServices: any[];
  allSubServices?: any[];
}

export const LeadDescriptionModal = ({ 
  isOpen, onOpenChange, comment, onCommentChange, 
  requirements, onRequirementsChange, selectedServiceIds, onServiceIdsChange,
  selectedSubServiceIds, onSubServiceIdsChange,
  onSave, availableServices = [],
  allSubServices = []
}: LeadDescriptionModalProps) => {

  const [searchQuery, setSearchQuery] = useState('');

  const subServicesToDisplay = useMemo(() => {
    // Filtering sub-services where service_id matches selected main services
    const allMatching = allSubServices.filter(ss => {
      const parentId = Number(ss.service_id);
      return selectedServiceIds.includes(parentId);
    });
    
    if (!searchQuery) return allMatching;
    return allMatching.filter(ss => ss.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allSubServices, selectedServiceIds, searchQuery]);

  const toggleService = (id: number, name: string) => {
    const isSelected = selectedServiceIds.includes(id);
    const nextIds = isSelected 
      ? selectedServiceIds.filter(sid => sid !== id) 
      : [...selectedServiceIds, id];
    
    onServiceIdsChange(nextIds);

    if (isSelected) {
      // Find sub-services belonging to this service and remove them from selected
      const childIds = allSubServices
        .filter(ss => Number(ss.service_id) === id)
        .map(ss => ss.id);
        
      onSubServiceIdsChange(selectedSubServiceIds.filter(ssid => !childIds.includes(ssid)));
      
      const childNames = allSubServices
        .filter(ss => Number(ss.service_id) === id)
        .map(ss => ss.name);
        
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
      return "bg-blue-600 text-white border-blue-700";
    }
    // Sub Service (or custom): Indigo Theme
    return "bg-indigo-600 text-white border-indigo-700";
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110]" />
        
        <Dialog.Content 
          aria-describedby={undefined} 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-none shadow-2xl z-[120] font-sans focus:outline-none flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden"
        >
          
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 text-white rounded-none flex items-center justify-center shadow-lg shadow-blue-200">
                <Settings2 size={16} />
              </div>
              <div>
                <Dialog.Title className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  Service Alignment
                </Dialog.Title>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Refine lead requirements</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-200 rounded-none transition-colors"><X size={18} /></Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
            {/* 1. SELECTION AREA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Main Categories */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-blue-600 pl-2">
                  1. Main Category
                </label>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2">
                  {availableServices.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => toggleService(s.id, s.name)}
                      className={`flex items-center justify-between px-4 py-3 rounded-none text-[10px] font-black cursor-pointer transition-all border outline-none ${
                        selectedServiceIds.includes(s.id) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md translate-x-1' 
                        : 'bg-white text-slate-500 border-slate-100 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <span className="truncate uppercase">{s.name}</span>
                      {selectedServiceIds.includes(s.id) && <Check size={12} strokeWidth={4} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub Services - Searchable "Dropdown" style list */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-indigo-600 pl-2">
                  2. Sub-Services
                </label>
                
                <div className="space-y-3">
                  {selectedServiceIds.length > 0 ? (
                    <>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                        <input 
                          type="text"
                          placeholder="Search services..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-none text-[10px] font-bold uppercase tracking-widest outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-2">
                        {subServicesToDisplay.length > 0 ? (
                          subServicesToDisplay.map((ss: any) => (
                            <div 
                              key={ss.id} 
                              onClick={() => toggleSubService(ss.id, ss.name)}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-none text-[10px] font-black cursor-pointer transition-all border ${
                                selectedSubServiceIds.includes(ss.id) 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md translate-x-1' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30'
                              }`}
                            >
                              <span className="truncate uppercase">{ss.name}</span>
                              {selectedSubServiceIds.includes(ss.id) && <Check size={12} strokeWidth={4} />}
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center border-2 border-dashed border-slate-100">
                             <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">No matching sub-services</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 bg-slate-50/30">
                       <Layers size={20} className="mx-auto text-slate-200 mb-2" />
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Select a category first</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. RECAP AREA */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-emerald-600 pl-2">
                3. Active Requirements
              </label>
              <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50 border border-slate-200 rounded-none min-h-[60px] shadow-inner">
                {requirements.length > 0 ? (
                  requirements.map((req, i) => (
                    <span 
                      key={i} 
                      className={`px-2.5 py-1.5 border text-[8px] font-black uppercase rounded-none flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 ${getBadgeStyle(req)}`}
                    >
                      <Check size={8} strokeWidth={4} />
                      {req}
                    </span>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-[9px] text-slate-300 font-bold uppercase tracking-widest italic p-1">
                     <AlertCircle size={10} />
                     No services selected
                  </div>
                )}
              </div>
            </div>

            {/* 3. NOTES AREA */}
            <div className="space-y-4 pb-2">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-orange-600 pl-2">
                4. Discussion Details
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-slate-300" size={16} />
                <textarea
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold min-h-[120px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all placeholder:text-slate-300 resize-none shadow-inner leading-relaxed"
                  placeholder="Summarize the core discussion, pain points, and specific needs discussed with the client..."
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-4">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1 h-12 rounded-none text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-white transition-all">
                Cancel Refinement
              </Button>
            </Dialog.Close>
            <Button 
              variant="primary" 
              className="flex-[2] h-12 rounded-none text-[11px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]" 
              onClick={onSave}
            >
              <Save size={16} className="mr-2" /> Sync Service Alignment
            </Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
