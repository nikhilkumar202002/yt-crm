import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Briefcase } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { createDesignation, type OrgUnit } from '../../../api/services/microService';

interface CreateDesignationModalProps {
  onSuccess: () => void;
}

export const CreateDesignationModal = ({ onSuccess }: CreateDesignationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrgUnit>({
    name: '',
    description: '',
    status: 1, // Default to active (numeric 1)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDesignation(formData);
      setIsOpen(false);
      onSuccess(); // Refresh the list
      setFormData({ name: '', description: '', status: 1 });
    } catch (error) {
      alert('Failed to create designation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary" size="sm">
          <Plus size={14} /> Add Designation
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-purple-600" /> New Designation
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Designation Name" 
              placeholder="e.g. Senior Developer" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                placeholder="Describe the roles and responsibilities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input 
                type="checkbox" 
                id="ds-status"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.status === 1}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
              />
              <label htmlFor="ds-status" className="text-xs font-bold text-slate-700 cursor-pointer">Set as Active Designation</label>
            </div>

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" className="flex-1" type="submit" isLoading={loading}>
                Create Designation
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};