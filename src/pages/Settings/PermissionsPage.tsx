import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight,
  Shield, Edit, Trash2, Eye
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getPermissions, deletePermission } from '../../api/services/authService';
import { CreatePermissionModal, EditPermissionModal, PermissionDetailsModal, DeletePermissionModal } from './components';

interface Permission {
  id: number;
  module_name: string;
  permission: string;
  code: string;
  created_at: string;
  updated_at: string;
}

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchPermissions = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getPermissions(page);
      const permissionArray = result?.data?.data || [];
      setPermissions(permissionArray);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions(currentPage);
  }, [currentPage]);

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const handleView = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.permission.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
          <p className="text-slate-600 mt-1">Manage system permissions and access controls</p>
        </div>
        <CreatePermissionModal onSuccess={() => fetchPermissions(currentPage)} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-slate-600">Loading permissions...</span>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto text-slate-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No permissions found</h3>
            <p className="mt-2 text-slate-600">Create a new permission to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPermissions.map((permission, index) => (
                  <tr key={permission.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {pagination ? (pagination.from + index) : index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded">
                        {permission.module_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {permission.permission}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {permission.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(permission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(permission)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(permission)}
                          className="text-slate-600 hover:text-slate-900 p-1"
                          title="Edit Permission"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(permission)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Permission"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={!pagination.prev_page_url}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {pagination.last_page}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.next_page_url}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditPermissionModal
        permission={selectedPermission}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => fetchPermissions(currentPage)}
      />

      <PermissionDetailsModal
        permissionId={selectedPermission?.id || null}
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <DeletePermissionModal
        permission={selectedPermission ? { id: selectedPermission.id, code: selectedPermission.code } : null}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSuccess={() => fetchPermissions(currentPage)}
      />
    </div>
  );
};

export default PermissionsPage;