import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ShieldPlus } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { createRole, getPermissions, assignPermissionsToRole, type RoleData, type PermissionData } from '../../../api/services/authService';

interface CreateRoleModalProps {
  onSuccess: () => void;
}

export const CreateRoleModal = ({ onSuccess }: CreateRoleModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [formData, setFormData] = useState<RoleData>({
    name: '',
    description: '',
    status: 1, // Defaulting to active as per your API status "1"
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', description: '', status: 1 });
      setSelectedPermissions([]);
    }
  }, [isOpen]);

  // Fetch permissions when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching permissions');
      fetchPermissions();
    }
  }, [isOpen]);

  const fetchPermissions = async () => {
    console.log('Fetching permissions...');
    try {
      const response = await getPermissions();
      console.log('Permissions response:', response);
      const permissionsData = response?.data?.data || response?.data || response || [];
      console.log('Extracted permissions data:', permissionsData);
      if (Array.isArray(permissionsData)) {
        console.log('Setting permissions:', permissionsData);
        setPermissions(permissionsData);
      } else {
        console.log('Permissions data is not an array, setting empty');
        setPermissions([]);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create the role first
      const roleResponse = await createRole(formData);
      const newRoleId = roleResponse.data?.id || roleResponse.id;

      // Assign permissions if any are selected
      if (selectedPermissions.length > 0 && newRoleId) {
        await assignPermissionsToRole(newRoleId, { permission_ids: selectedPermissions });
      }

      setIsOpen(false);
      onSuccess(); // Refresh the list page
      setFormData({ name: '', description: '', status: 1 }); // Reset form
      setSelectedPermissions([]); // Reset selected permissions
      setSelectedPermissions([]); // Reset selected permissions
    } catch (error) {
      alert('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary" size="sm">
          <ShieldPlus size={14} /> Create New Role
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Define New System Role
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Role Name" 
              placeholder="e.g. Manager" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
            
            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 min-h-[80px]"
                placeholder="Manager role"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input 
                type="checkbox" 
                id="role-status"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.status === 1}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
              />
              <label htmlFor="role-status" className="text-xs font-bold text-slate-700">Set as Active Role</label>
            </div>

            {/* Permissions Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assign Permissions</label>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                {!Array.isArray(permissions) || permissions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Loading permissions...</p>
                ) : (
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedPermissions.includes(permission.id!)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(prev => [...prev, permission.id!]);
                            } else {
                              setSelectedPermissions(prev => prev.filter(id => id !== permission.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`permission-${permission.id}`}
                          className="text-xs font-medium text-slate-700 cursor-pointer flex-1"
                        >
                          <div className="font-semibold">{permission.module_name}</div>
                          <div className="text-slate-500 text-[10px]">{permission.permission} ({permission.code})</div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedPermissions.length > 0 && (
                <p className="text-[10px] text-blue-600 font-medium">
                  {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button 
                variant="primary" 
                className="flex-1" 
                type="submit"
                isLoading={loading}
              >
                Confirm Creation
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};