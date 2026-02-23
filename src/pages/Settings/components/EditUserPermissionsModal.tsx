import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit, Shield } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { syncUserPermissions, getPermissions, getUserPermissions } from '../../../api/services/authService';

interface EditUserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUser?: any;
}

interface Permission {
  id: number;
  module_name: string;
  permission: string;
  code: string;
}

export const EditUserPermissionsModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUser
}: EditUserPermissionsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [currentPermissionIds, setCurrentPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && selectedUser) {
      loadData();
    }
  }, [isOpen, selectedUser]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch user's current permissions first
      const currentPerms: number[] = [];
      if (selectedUser?.id) {
        try {
          console.log('=== FETCHING USER PERMISSIONS ===');
          console.log('User ID:', selectedUser.id);
          console.log('User:', selectedUser);
          
          const userPermsRes = await getUserPermissions(selectedUser.id);
          console.log('RAW API Response:', userPermsRes);
          console.log('Response.data:', userPermsRes?.data);
          
          // Try different response structures
          let userPerms: any[] = [];
          if (Array.isArray(userPermsRes)) {
            userPerms = userPermsRes;
            console.log('Response is an array directly');
          } else if (Array.isArray(userPermsRes?.data)) {
            userPerms = userPermsRes.data;
            console.log('Response.data is an array');
          } else if (userPermsRes?.data?.data && Array.isArray(userPermsRes.data.data)) {
            userPerms = userPermsRes.data.data;
            console.log('Response.data.data is an array');
          }
          
          console.log('Final userPerms array:', userPerms);
          console.log('UserPerms length:', userPerms.length);
          
          const permissionIds = userPerms.map((perm: any, index: number) => {
            console.log(`[${index}] Permission object:`, perm);
            console.log(`[${index}] Keys:`, Object.keys(perm));
            
            let permId = null;
            if (perm.permission_id !== undefined) {
              permId = Number(perm.permission_id);
              console.log(`[${index}] Extracted from permission_id: ${permId} (type: ${typeof perm.permission_id})`);
            } else if (perm.permission?.id !== undefined) {
              permId = Number(perm.permission.id);
              console.log(`[${index}] Extracted from permission.id: ${permId} (type: ${typeof perm.permission.id})`);
            } else if (perm.id !== undefined) {
              permId = Number(perm.id);
              console.log(`[${index}] Extracted from id: ${permId} (type: ${typeof perm.id})`);
            } else {
              console.warn(`[${index}] Could not extract permission ID from:`, perm);
            }
            return permId;
          }).filter((id: any): id is number => id !== null);
          
          currentPerms.push(...permissionIds);
          setCurrentPermissionIds(permissionIds);
          setSelectedPermissionIds(permissionIds);
          console.log('✅ Current permission IDs set:', permissionIds);
        } catch (permError) {
          console.error('❌ Failed to fetch user permissions:', permError);
        }
      }

      // Fetch all permissions
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

      console.log('=== PERMISSIONS LOADED ===');
      console.log('Total permissions:', allPermissions.length);
      console.log('Currently selected IDs:', currentPerms);
      console.log('Permission ID list:', allPermissions.map((p, i) => ({ idx: i, id: p.id, code: p.code })));
      console.log('=== COMPARING ===');
      allPermissions.forEach(p => {
        const isSelected = currentPerms.includes(p.id);
        console.log(`Permission ${p.id} (${p.code}): ${isSelected ? '✅ SELECTED' : '❌ NOT SELECTED'}`);
      });
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('No user selected');
      return;
    }

    setLoading(true);
    try {
      await syncUserPermissions(selectedUser.id, {
        permission_ids: selectedPermissionIds
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to update permissions:', error);
      alert('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPermissionIds([]);
    setCurrentPermissionIds([]);
    setDataLoading(false);
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
              <Edit size={20} className="text-slate-600" />
              Edit User Permissions
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-sm font-medium text-slate-900">{selectedUser?.name}</div>
              <div className="text-xs text-slate-500">{selectedUser?.email}</div>
            </div>

            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Permissions
              </label>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8 border border-slate-200 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-slate-600">Loading permissions...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                    {permissions.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-slate-500">
                        No permissions available
                      </div>
                    ) : (
                      permissions.map((permission) => {
                        const isChecked = selectedPermissionIds.includes(permission.id);
                        console.log(`Rendering permission ${permission.id} (${permission.code}): checked=${isChecked}, selectedIds=${JSON.stringify(selectedPermissionIds)}`);
                        return (
                          <label key={permission.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
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
                        );
                      })
                    )}
                  </div>
                  {selectedPermissionIds.length > 0 && (
                    <div className="mt-2 text-xs text-slate-600">
                      <p>{selectedPermissionIds.length} permission(s) selected</p>
                      {currentPermissionIds.length > 0 && (
                        <p className="text-blue-600 mt-1">
                          Changed from {currentPermissionIds.length} permissions
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Update Permissions
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
