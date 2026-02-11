import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, AlertTriangle, Briefcase } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { deletePosition } from '../../../api/services/microService';

interface DeletePositionModalProps {
  position: { id: number; name: string } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeletePositionModal = ({ position, isOpen, onOpenChange, onSuccess }: DeletePositionModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!position?.id) return;

    setLoading(true);
    try {
      await deletePosition(position.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      alert('Failed to delete position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" /> Delete Position
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Position</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete <span className="font-medium text-slate-900">"{position?.name}"</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  <p className="font-medium mb-1">Warning:</p>
                  <p>This will permanently remove the position and may affect related data.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1" disabled={loading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              isLoading={loading}
            >
              Delete Position
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};