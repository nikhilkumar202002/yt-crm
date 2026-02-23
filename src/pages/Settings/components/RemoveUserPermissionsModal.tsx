import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, Shield, User } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { removePermissionsFromUser } from '../../../api/services/authService';

interface RemoveUserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: any;
}

interface UserPermission {
  id: number;
  user_id: number;
  permission_id: number;
  permission?: {
    id: number;
    module_name: string;
    permission: string;
    code: string;
  };
}

export const RemoveUserPermissionsModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUser
}: RemoveUserPermissionsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && selectedUser) {
      loadUserPermissions();
    }
  }, [isOpen, selectedUser]);

  const loadUserPermissions = async () => {
    if (!selectedUser?.id) return;

    // TODO: Implement API endpoint to get permissions for a specific user
    // For now, show a placeholder message
    console.log('Loading permissions for user:', selectedUser.id);
    setUserPermissions([]); // Clear permissions until API is implemented
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedPermissionIds.length === 0) {
      alert('Please select at least one permission to remove');
      return;
    }

    setLoading(true);
    try {
      await removePermissionsFromUser(selectedUser.id, {
        permission_ids: selectedPermissionIds
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to remove permissions:', error);
      alert('Failed to remove permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUserPermissions([]);
    setSelectedPermissionIds([]);
    onClose();
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 size={20} className="text-red-600" />
              Remove User Permissions
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {selectedUser && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-600">{selectedUser.email}</p>
                  <p className="text-xs text-slate-500">Role: {selectedUser.role_name || 'No Role'}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Permissions to Remove
              </label>
              {userPermissions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No permissions found for this user</p>
                  <p className="text-xs mt-1">The user may not have any additional permissions assigned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {userPermissions.map((userPerm) => (
                    userPerm.permission && (
                      <label key={userPerm.id} className="flex items-center gap-2 p-2 hover:bg-red-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissionIds.includes(userPerm.permission_id)}
                          onChange={() => handlePermissionToggle(userPerm.permission_id)}
                          className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {userPerm.permission.module_name} - {userPerm.permission.permission}
                          </div>
                          <div className="text-xs text-slate-500">{userPerm.permission.code}</div>
                        </div>
                      </label>
                    )
                  ))}
                </div>
              )}
              {selectedPermissionIds.length > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  {selectedPermissionIds.length} permission(s) selected for removal
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={loading}
                disabled={selectedPermissionIds.length === 0}
              >
                Remove Permissions
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};