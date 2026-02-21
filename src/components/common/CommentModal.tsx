import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from './Button';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comments: string, status?: string) => void;
  initialComments: string;
  initialStatus?: string;
  title?: string;
  showStatusSelector?: boolean;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialComments,
  initialStatus = 'pending',
  title = 'Add/Edit Comments',
  showStatusSelector = false
}) => {
  const [comments, setComments] = useState(initialComments);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (isOpen) {
      setComments(initialComments);
      setStatus(initialStatus);
    }
  }, [isOpen, initialComments, initialStatus]);

  const handleSave = () => {
    onSave(comments, status);
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
        <div className="p-6 space-y-4">
          {showStatusSelector && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Update Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['pending', 'approved', 'edit_needed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-2 px-1 text-[10px] font-bold border transition-all rounded ${
                      status === s
                        ? s === 'approved' ? 'bg-green-600 text-white border-green-600 shadow-sm' :
                          s === 'edit_needed' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' :
                          'bg-slate-700 text-white border-slate-700 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {s.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Comments / Feedback</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments here..."
              className="w-full min-h-[120px] p-3 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
              rows={5}
            />
          </div>
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