import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Layers } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface ServiceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  editingService?: any;
}

export const ServiceModal = ({ isOpen, onOpenChange, onSave, editingService }: ServiceModalProps) => {
  const [formData, setFormData] = useState({ name: '', description: '', status: true });

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        status: editingService.status === "1" || editingService.status === true
      });
    } else {
      setFormData({ name: '', description: '', status: true });
    }
  }, [editingService, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[120] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              {editingService ? 'Edit Service' : 'Create New Service'}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Service Name</label>
              <input
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g. Digital Marketing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
              <textarea
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="Briefly describe the service capabilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="service-status"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              />
              <label htmlFor="service-status" className="text-xs font-bold text-slate-700 cursor-pointer">
                Set Service as Active
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1 rounded-xl py-2.5" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1 rounded-xl py-2.5 gap-2">
                <Save size={16} /> {editingService ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};