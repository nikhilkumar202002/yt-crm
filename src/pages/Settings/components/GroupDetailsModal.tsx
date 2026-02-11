import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Eye, Users, Calendar, User } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getGroupDetail, GroupData } from '../../../api/services/microService';

interface GroupDetailsModalProps {
  groupId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GroupDetailsModal = ({ groupId, isOpen, onOpenChange }: GroupDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<GroupData | null>(null);

  useEffect(() => {
    if (groupId && isOpen) {
      fetchGroupDetails();
    }
  }, [groupId, isOpen]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      const result = await getGroupDetail(groupId);
      setGroup(result.data);
    } catch (error) {
      console.error('Failed to fetch group details:', error);
      alert('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-blue-600" /> Group Details
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : group ? (
            <div className="space-y-6">
              {/* Group Name */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Group Name</h3>
                </div>
                <p className="text-lg font-semibold text-slate-900">{group.name}</p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-600 leading-relaxed">{group.description}</p>
              </div>

              {/* Status */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Status</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  group.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {group.status ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Created</h3>
                  </div>
                  <p className="text-sm text-slate-900">
                    {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Created By</h3>
                  </div>
                  <p className="text-sm text-slate-900">
                    {group.created_by || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              {group.updated_at && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Last Updated</h3>
                  <p className="text-sm text-slate-900">
                    {new Date(group.updated_at).toLocaleDateString()} at {new Date(group.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Group details not available</p>
            </div>
          )}

          <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
            <Dialog.Close asChild>
              <Button variant="ghost">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};