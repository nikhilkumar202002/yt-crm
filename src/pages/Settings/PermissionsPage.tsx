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
  }, [currentPage, fetchPermissions]);

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
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Permissions</h1>
              <p className="text-sm text-slate-500">Manage system permissions</p>
            </div>
          </div>
          <CreatePermissionModal onSuccess={() => fetchPermissions(currentPage)} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {/* Table */}
            <div className="bg-white">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No permissions found
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((permission, index) => (
                      <tr key={permission.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {pagination ? (pagination.from + index) : index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{permission.module_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{permission.permission}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(permission.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
                <p className="text-sm text-slate-600">
                  Showing {pagination.from}-{pagination.to} of {pagination.total} permissions
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={!pagination.prev_page_url}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex gap-1">
                    {pagination.links.filter((l: any) => !isNaN(Number(l.label))).map((link: any) => (
                      <button
                        key={link.label}
                        onClick={() => setCurrentPage(Number(link.label))}
                        className={`px-3 py-1 text-sm border rounded ${
                          link.active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={!pagination.next_page_url}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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