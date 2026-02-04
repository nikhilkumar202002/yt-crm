import React, { useEffect, useState, useCallback } from 'react';
import { getRoles, deleteRole, RoleData } from '../../api/services/authService';
import { CreateRoleModal } from './components/CreateRoleModal';

const RoleManagement = () => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 font-sans">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Role Management</h2>
        <CreateRoleModal onSuccess={fetchRoles} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Role Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
         <tbody className="divide-y divide-gray-100">
  {roles.map((role) => (
    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-semibold text-gray-700">{role.name}</td>
      <td className="px-6 py-4 text-gray-500 text-sm">{role.description}</td>
      <td className="px-6 py-4 text-center">
        {/* Fix: Check for string "1" or numeric 1 */}
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
          role.status === "1" || role.status === 1 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {role.status === "1" || role.status === 1 ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-right space-x-3">
        <button className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
        <button 
          onClick={() => role.id && handleDelete(role.id)}
          className="text-red-600 hover:underline text-sm font-medium"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;