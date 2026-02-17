import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Upload } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-none p-6 shadow-2xl z-[110] font-sans items-start">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Edit Content
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .rich-text-editor .ql-container {
              min-height: 150px;
              font-family: inherit;
              font-size: 14px;
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
            }
            .rich-text-editor .ql-toolbar {
              background: #f8fafc;
              border-color: #e2e8f0 !important;
              border-top-left-radius: 0;
              border-top-right-radius: 0;
            }
            .rich-text-editor .ql-container {
              border-color: #e2e8f0 !important;
            }
          `}} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content Description</label>
              <div className="rich-text-editor">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                  placeholder="Enter content description..."
                />
              </div>
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
                  className="flex items-center justify-start gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-none hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
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