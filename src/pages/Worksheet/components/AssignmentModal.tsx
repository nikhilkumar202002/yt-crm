import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface User {
  id: number;
  name: string;
  group_name: string;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userIds: number[]) => void;
  users: User[];
  initialSelectedIds: number[];
  title: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  users,
  initialSelectedIds,
  title
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

  if (!isOpen) return null;

  const toggleUser = (userId: number) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
          {users.length > 0 ? (
            users.map(user => (
              <label 
                key={user.id} 
                className={`flex items-start justify-between p-3 rounded-none border-2 cursor-pointer transition-all ${
                  selectedIds.includes(user.id) 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{user.group_name}</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(user.id) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-white border-slate-200'
                  }`}>
                    {selectedIds.includes(user.id) && <Check size={12} className="text-white" />}
                  </div>
                </div>
              </label>
            ))
          ) : (
            <p className="text-center py-4 text-xs text-slate-400">No members found in this category.</p>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={() => onAssign(selectedIds)}>
            Assign ({selectedIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;