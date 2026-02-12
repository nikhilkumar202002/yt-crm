import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Layers } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getServices, createSubService } from '../../../api/services/microService';

interface SubServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialServiceId?: number | null; // Correctly typed
}

export const SubServiceModal = ({ isOpen, onOpenChange, onSuccess, initialServiceId }: SubServiceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    service_id: '',
    name: '',
    description: '',
    status: true
  });

  // 1. Fetch main services list for the dropdown
  useEffect(() => {
    if (isOpen) {
      const loadServices = async () => {
        try {
          const res = await getServices(1);
          setServices(res?.data?.data || []);
        } catch (error) {
          console.error("Failed to load services", error);
        }
      };
      loadServices();
    }
  }, [isOpen]);

  // 2. Sync dropdown with the clicked Plus icon from the table
  useEffect(() => {
    if (isOpen) {
      if (initialServiceId) {
        setFormData(prev => ({ ...prev, service_id: String(initialServiceId) }));
      } else {
        // Reset form for fresh creation if no initial ID provided
        setFormData({ service_id: '', name: '', description: '', status: true });
      }
    }
  }, [isOpen, initialServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_id) {
      alert("Please select a parent service.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        service_id: Number(formData.service_id) // Convert to Number for API
      };
      
      await createSubService(payload as any); //
      onSuccess();
      onOpenChange(false);
      // Reset form after successful submission
      setFormData({ service_id: '', name: '', description: '', status: true });
    } catch (error) {
      alert("Failed to create sub-service. Please check selection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl z-[120] font-sans focus:outline-none">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title asChild>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Layers size={18} className="text-blue-600" /> Define Sub-Service
              </h2>
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Create or edit a sub-service under a parent service.
            </Dialog.Description>
            <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Parent Service</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                value={formData.service_id}
                onChange={e => setFormData({...formData, service_id: e.target.value})}
              >
                <option value="">Select Category...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Sub-Service Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                placeholder="e.g. Logo Design"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
              <textarea 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all min-h-[80px]"
                placeholder="Provide service details..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input 
                type="checkbox" 
                id="sub_status"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                checked={formData.status}
                onChange={e => setFormData({...formData, status: e.target.checked})}
              />
              <label htmlFor="sub_status" className="text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer">
                Set as Active Offering
              </label>
            </div>

            <Button disabled={loading} className="w-full h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 mt-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Sub-Service'}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};