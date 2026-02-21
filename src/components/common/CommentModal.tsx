import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from './Button';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comments: string) => void;
  initialComments: string;
  title?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialComments,
  title = 'Add/Edit Comments'
}) => {
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    if (isOpen) {
      setComments(initialComments);
    }
  }, [isOpen, initialComments]);

  const handleSave = () => {
    onSave(comments);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your comments here..."
            className="w-full min-h-[120px] p-3 border border-slate-200 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            rows={5}
          />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Save Comments
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;