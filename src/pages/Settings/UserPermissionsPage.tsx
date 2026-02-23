import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight,
  Shield, Edit, Trash2, Eye, User
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getAllUserPermissions, assignPermissionsToUser, removePermissionsFromUser, getRoles } from '../../api/services/authService';
import { AssignUserPermissionsModal, RemoveUserPermissionsModal } from './components';

interface UserPermission {
  id: number;
  user_id: number;
  permission_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role_name?: string;
  };
  permission?: {
    id: number;
    module_name: string;
    permission: string;
    code: string;
  };
}

const UserPermissionsPage = () => {
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<any[]>([]);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const fetchUserPermissions = useCallback(async (page: number) => {
    try {
      setLoading(true);
      console.log('Fetching user permissions for page:', page);
      
      const result = await getAllUserPermissions(page);
      
      console.log('API Response:', result);
      
      const userPermissionArray = result?.data || [];
      
      console.log('User permissions array:', userPermissionArray);
      
      setUserPermissions(userPermissionArray);
      setPagination(result);
      setCurrentPage(result?.current_page || 1);
      console.log('Set user permissions:', userPermissionArray.length, 'items');
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      console.log('Fetching roles...');
      const rolesResult = await getRoles();
      console.log('Roles Response:', rolesResult);
      
      const rolesArray = rolesResult?.data?.data || rolesResult?.data || [];
      console.log('Roles array:', rolesArray);
      
      setRoles(rolesArray);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUserPermissions(currentPage);
  }, [currentPage]);

  // Helper function to get role name by role_id
  const getRoleName = (roleId: number | string) => {
    const role = roles.find(r => r.id === Number(roleId));
    return role?.name || `Role ${roleId}`;
  };

  // Group permissions by user for display
  const groupedByUser = userPermissions.reduce((acc: any, item) => {
    const userId = item.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: {
          ...item.user,
          role_name: getRoleName(item.user?.role_id)
        },
        permissions: []
      };
    }
    if (item.permission) {
      acc[userId].permissions.push(item.permission);
    }
    return acc;
  }, {});

  const filteredUsers = Object.values(groupedByUser).filter((userData: any) => {
    if (!searchTerm) return true;
    const user = userData.user;
    return user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user?.role_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAssignPermissions = (user: any) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const handleRemovePermissions = (user: any) => {
    setSelectedUser(user);
    setIsRemoveModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Permissions</h1>
          <p className="text-slate-600 mt-1">Manage user-specific permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Assign Permissions
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User Permissions List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-slate-600">Loading user permissions...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto text-slate-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No user permissions found</h3>
            <p className="mt-2 text-slate-600">Get started by assigning permissions to users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((userData: any) => (
                  <tr key={userData.user?.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{userData.user?.name}</div>
                          <div className="text-sm text-slate-500">{userData.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {userData.user?.role_name || 'No Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {userData.permissions?.map((perm: any) => (
                          <span key={perm.id} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {perm.code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAssignPermissions(userData.user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Assign Permissions"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleRemovePermissions(userData.user)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Remove Permissions"
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
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing {pagination.from || 1} to {pagination.to || userPermissions.length} of {pagination.total || userPermissions.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {pagination.last_page || 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === (pagination.last_page || 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AssignUserPermissionsModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUserPermissions(currentPage);
          setIsAssignModalOpen(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
      />

      <RemoveUserPermissionsModal
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setIsRemoveModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUserPermissions(currentPage);
          setIsRemoveModalOpen(false);
          setSelectedUser(null);
        }}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default UserPermissionsPage;