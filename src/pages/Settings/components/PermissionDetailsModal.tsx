import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Shield, Calendar, Hash } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getPermission } from '../../../api/services/authService';

interface PermissionDetailsModalProps {
  permissionId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Permission {
  id: number;
  module_name: string;
  permission: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export const PermissionDetailsModal = ({ permissionId, isOpen, onOpenChange }: PermissionDetailsModalProps) => {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permissionId && isOpen) {
      const fetchPermission = async () => {
        setLoading(true);
        try {
          const result = await getPermission(permissionId);
          setPermission(result.data);
        } catch (error) {
          console.error('Failed to fetch permission details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPermission();
    }
  }, [permissionId, isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-blue-600" /> Permission Details
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
            </div>
          ) : permission ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID</label>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Hash size={14} className="text-slate-400" />
                    {permission.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Module</label>
                  <div className="text-sm font-medium text-slate-900">{permission.module_name}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permission</label>
                <div className="text-sm font-medium text-slate-900">{permission.permission}</div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Code</label>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {permission.code}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</label>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(permission.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Updated</label>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(permission.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Permission not found
            </div>
          )}

          <div className="mt-8 flex justify-end pt-2">
            <Dialog.Close asChild>
              <Button variant="ghost">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};