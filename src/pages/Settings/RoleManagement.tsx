import React, { useEffect, useState, useCallback } from 'react';
import { Shield, Edit2, Trash2 } from 'lucide-react';
import { getRoles, deleteRole, getAllRolePermissions, type RoleData } from '../../api/services/authService';
import { CreateRoleModal } from './components/CreateRoleModal';

const RoleManagement = () => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);

  const fetchRoles = useCallback(async () => {
  try {
    setLoading(true);
    const result = await getRoles(); //
    
    /**
     * Paginated Structure Handling:
     * Your API returns: { success: true, data: { data: [...], current_page: 1 } }
     * We need result.data.data to get the array.
     */
    const roleList = result?.data?.data || result?.data || [];
    setRoles(Array.isArray(roleList) ? roleList : []);
    
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    setRoles([]); 
  } finally {
    setLoading(false);
  }
}, []);
  const fetchRolePermissions = useCallback(async () => {
    try {
      const result = await getAllRolePermissions();
      const permissionsList = result?.data?.data || [];
      setRolePermissions(Array.isArray(permissionsList) ? permissionsList : []);
    } catch (error) {
      console.error("Failed to fetch role permissions:", error);
      setRolePermissions([]);
    }
  }, []);
  useEffect(() => {
    fetchRoles();
    fetchRolePermissions();
  }, [fetchRoles, fetchRolePermissions]);

  const getRolePermissions = (roleId: number) => {
    return rolePermissions.filter(rp => rp.role_id === roleId.toString());
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(id); //
        fetchRoles(); // Refresh the table with a single call
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Role Management</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage user roles and permissions</p>
        </div>
        <CreateRoleModal onSuccess={fetchRoles} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permissions</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Shield size={14} /></div>
                          <span className="text-xs font-bold text-slate-900">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-500">{role.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                          role.status == 1 || role.status == "1"
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {role.status == 1 || role.status == "1" ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getRolePermissions(role.id!).length > 0 ? (
                            getRolePermissions(role.id!).map((rp: any) => (
                              <span key={rp.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-medium rounded border border-blue-100">
                                {rp.permission.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                        <button onClick={() => role.id && handleDelete(role.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                      No roles found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;