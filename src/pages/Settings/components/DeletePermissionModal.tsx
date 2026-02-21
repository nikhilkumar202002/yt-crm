import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { deletePermission } from '../../../api/services/authService';

interface DeletePermissionModalProps {
  permission: { id: number; code: string } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeletePermissionModal = ({ permission, isOpen, onOpenChange, onSuccess }: DeletePermissionModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!permission) return;

    setLoading(true);
    try {
      await deletePermission(permission.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert('Failed to delete permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" /> Delete Permission
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <Trash2 size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-900">Confirm Deletion</p>
                <p className="text-xs text-red-700">
                  Are you sure you want to delete the permission <strong>"{permission?.code}"</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Shield size={16} className="text-slate-400" />
              <div className="text-xs text-slate-600">
                <strong>Permission:</strong> {permission?.code}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1" disabled={loading}>Cancel</Button>
            </Dialog.Close>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              isLoading={loading}
            >
              Delete Permission
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};