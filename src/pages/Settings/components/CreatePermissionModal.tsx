import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Shield } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { createPermission, type PermissionData } from '../../../api/services/authService';

interface CreatePermissionModalProps {
  onSuccess: () => void;
}

export const CreatePermissionModal = ({ onSuccess }: CreatePermissionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PermissionData>({
    module_name: '',
    permission: '',
    code: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPermission(formData);
      setIsOpen(false);
      onSuccess();
      setFormData({ module_name: '', permission: '', code: '' });
    } catch (error) {
      alert('Failed to create permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary" size="sm">
          <Plus size={14} /> Add Permission
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-blue-600" /> New Permission
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Module Name"
              placeholder="e.g. Leads"
              value={formData.module_name}
              onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
              required
            />

            <Input
              label="Permission"
              placeholder="e.g. create"
              value={formData.permission}
              onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
              required
            />

            <Input
              label="Code"
              placeholder="e.g. leads.create"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" className="flex-1" type="submit" isLoading={loading}>
                Create Permission
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};