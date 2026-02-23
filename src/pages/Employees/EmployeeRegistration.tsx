import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { registerEmployee, getRoles, getPermissions, assignPermissionsToUser } from '../../api/services/authService';
import { getDepartments, getDesignations } from '../../api/services/microService';

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState({ departments: [], designations: [], roles: [], permissions: [] });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    department_id: '',
    designation_id: '',
    mobile_number: '',
    assign_permissions: false,
    permission_ids: [] as number[]
  });

  useEffect(() => {
  const loadSelectData = async () => {
    try {
      const [deptsRes, desgsRes, rolesRes] = await Promise.all([
        getDepartments(),
        getDesignations(),
        getRoles()
      ]);

      // Fetch all permissions (all pages)
      const allPermissions = [];
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

      setOrgData({ 
        departments: deptsRes?.data?.data || deptsRes?.data || [], 
        designations: desgsRes?.data?.data || desgsRes?.data || [], 
        roles: rolesRes?.data?.data || rolesRes?.data || [],
        permissions: allPermissions
      });
    } catch (error) {
      console.error("Error loading registration data:", error);
      // Fallback to empty arrays to prevent .map() crashes
      setOrgData({ departments: [], designations: [], roles: [], permissions: [] });
    }
  };
  loadSelectData();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const registrationData = {
        ...formData,
        role_id: parseInt(formData.role_id),
        department_id: parseInt(formData.department_id),
        designation_id: parseInt(formData.designation_id),
      };

      // Remove permission fields from registration data
      const { assign_permissions, permission_ids, ...employeeData } = registrationData;
      
      const response = await registerEmployee(employeeData);
      const newEmployee = response.data;

      // Assign permissions if checkbox is checked and permissions are selected
      if (formData.assign_permissions && formData.permission_ids.length > 0 && newEmployee?.id) {
        try {
          await assignPermissionsToUser(newEmployee.id, { permission_ids: formData.permission_ids });
          alert('Employee registered and permissions assigned successfully');
        } catch (permError) {
          console.error('Failed to assign permissions:', permError);
          alert('Employee registered but failed to assign permissions');
        }
      } else {
        alert('Employee registered successfully');
      }

      navigate('/employees');
    } catch (error) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 font-sans">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Register New Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="John Doe" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Email Address" type="email" placeholder="john@company.com" onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Password" type="password" placeholder="Enter password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <Input label="Confirm Password" type="password" placeholder="Confirm password" onChange={e => setFormData({...formData, password_confirmation: e.target.value})} required />
        </div>
        
        <Input label="Mobile Number" placeholder="7356400765" onChange={e => setFormData({...formData, mobile_number: e.target.value})} required />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" 
              onChange={e => setFormData({...formData, department_id: e.target.value})}>
              <option value="">Select Dept</option>
              {orgData.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Designation</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              onChange={e => setFormData({...formData, designation_id: e.target.value})}>
              <option value="">Select Desg</option>
              {orgData.designations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              onChange={e => setFormData({...formData, role_id: e.target.value})}>
              <option value="">Select Role</option>
              {orgData.roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="assign_permissions"
              checked={formData.assign_permissions}
              onChange={e => setFormData({...formData, assign_permissions: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="assign_permissions" className="text-sm font-medium text-slate-700">
              Assign Additional Permissions
            </label>
          </div>

          {formData.assign_permissions && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Permissions</label>
              <select 
                multiple
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none min-h-[100px]"
                value={formData.permission_ids.map(String)}
                onChange={e => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setFormData({...formData, permission_ids: selectedOptions});
                }}
              >
                {orgData.permissions.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.module_name} - {p.permission} ({p.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple permissions</p>
            </div>
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/employees')} className="flex-1">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={loading} className="flex-1">Register Employee</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;