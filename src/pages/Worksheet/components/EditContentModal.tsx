import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Upload } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string, file?: File) => void;
  initialDescription: string;
}

const EditContentModal = ({ isOpen, onClose, onSave, initialDescription }: EditContentModalProps) => {
  const [description, setDescription] = useState(initialDescription);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescription(initialDescription);
      setFile(undefined);
    }
  }, [isOpen, initialDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(description, file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Edit Content
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content Description</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                placeholder="Enter content description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content File (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  id="content-file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
                <label
                  htmlFor="content-file"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <Upload size={16} className="text-slate-400 group-hover:text-blue-500" />
                  <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600">
                    {file ? file.name : 'Click to upload new file'}
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" className="flex-1" type="submit" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditContentModal;