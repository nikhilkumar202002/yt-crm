import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Shield, User } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { assignPermissionsToUser, getPermissions, getUsersList } from '../../../api/services/authService';

interface AssignUserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: any;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_name?: string;
}

interface Permission {
  id: number;
  module_name: string;
  permission: string;
  code: string;
}

export const AssignUserPermissionsModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUser
}: AssignUserPermissionsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      setSelectedUserId(selectedUser.id);
    }
  }, [selectedUser]);

  const loadData = async () => {
    try {
      // Fetch all users
      const usersRes = await getUsersList();
      setUsers(usersRes?.data?.data || []);

      // Fetch all permissions (all pages)
      const allPermissions: Permission[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const permsRes = await getPermissions(currentPage);
        const pageData = permsRes?.data?.data || [];
        allPermissions.push(...pageData);

        const pagination = permsRes?.data;
        if (pagination && pagination.current_page < pagination.last_page) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      setPermissions(allPermissions);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || selectedPermissionIds.length === 0) {
      alert('Please select a user and at least one permission');
      return;
    }

    setLoading(true);
    try {
      await assignPermissionsToUser(Number(selectedUserId), {
        permission_ids: selectedPermissionIds
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to assign permissions:', error);
      alert('Failed to assign permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
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
              <Shield size={20} className="text-blue-600" />
              Assign User Permissions
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value) || '')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email} ({user.role_name || 'No Role'})
                  </option>
                ))}
              </select>
            </div>

            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Permissions
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissionIds.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {permission.module_name} - {permission.permission}
                      </div>
                      <div className="text-xs text-slate-500">{permission.code}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedPermissionIds.length > 0 && (
                <p className="text-xs text-slate-600 mt-2">
                  {selectedPermissionIds.length} permission(s) selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Assign Permissions
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};