import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Loader2, ChevronLeft, ChevronRight,
  ShieldCheck, Eye
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getAllRolePermissions } from '../../api/services/authService';

interface RolePermission {
  id: number;
  role_id: string;
  permission_id: string;
  created_at: string | null;
  updated_at: string | null;
  role: {
    id: number;
    name: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    created_by: string;
  };
  permission: {
    id: number;
    module_name: string;
    permission: string;
    code: string;
    created_at: string;
    updated_at: string;
  };
}

const RolePermissionsPage = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedRolePermission, setSelectedRolePermission] = useState<RolePermission | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchRolePermissions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await getAllRolePermissions(page);
      const rolePermissionArray = result?.data?.data || [];
      setRolePermissions(rolePermissionArray);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      setRolePermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRolePermissions(currentPage);
  }, [currentPage, fetchRolePermissions]);

  const handleView = (rolePermission: RolePermission) => {
    setSelectedRolePermission(rolePermission);
    setIsDetailsModalOpen(true);
  };

  const filteredRolePermissions = rolePermissions.filter(rp =>
    rp.role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rp.permission.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rp.permission.permission.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rp.permission.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Role Permissions</h1>
              <p className="text-sm text-slate-500">View role-permission assignments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search role permissions..."
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
                      Role Name
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
                  {filteredRolePermissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No role permissions found
                      </td>
                    </tr>
                  ) : (
                    filteredRolePermissions.map((rp, index) => (
                      <tr key={rp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {pagination ? (pagination.from + index) : index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{rp.role.name}</div>
                          <div className="text-xs text-slate-500">{rp.role.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{rp.permission.module_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{rp.permission.permission}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rp.permission.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {rp.created_at ? new Date(rp.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(rp)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
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
                  Showing {pagination.from} to {pagination.to} of {pagination.total} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
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
                    onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                    disabled={currentPage === pagination.last_page}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedRolePermission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Role Permission Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                <p className="text-sm text-slate-900">{selectedRolePermission.role.name}</p>
                <p className="text-xs text-slate-600">{selectedRolePermission.role.description}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Permission</label>
                <p className="text-sm text-slate-900">{selectedRolePermission.permission.module_name} - {selectedRolePermission.permission.permission}</p>
                <p className="text-xs text-slate-600">Code: {selectedRolePermission.permission.code}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Created</label>
                <p className="text-sm text-slate-600">{selectedRolePermission.created_at ? new Date(selectedRolePermission.created_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsPage;