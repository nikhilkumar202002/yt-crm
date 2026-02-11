import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { registerEmployee, getRoles } from '../../api/services/authService';
import { getDepartments, getDesignations, getGroups } from '../../api/services/microService';

const EmployeeRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState({ departments: [], designations: [], roles: [], groups: [] });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    group_id: '',
    department_id: '',
    designation_id: '',
    mobile_number: ''
  });

  useEffect(() => {
  const loadSelectData = async () => {
    try {
      const [deptsRes, desgsRes, rolesRes, groupsRes] = await Promise.all([
        getDepartments(),
        getDesignations(),
        getRoles(),
        getGroups()
      ]);
      setOrgData({ 
        departments: deptsRes?.data?.data || deptsRes?.data || [], 
        designations: desgsRes?.data?.data || desgsRes?.data || [], 
        roles: rolesRes?.data?.data || rolesRes?.data || [],
        groups: groupsRes?.data?.data || groupsRes?.data || []
      });
    } catch (error) {
      console.error("Error loading registration data:", error);
      // Fallback to empty arrays to prevent .map() crashes
      setOrgData({ departments: [], designations: [], roles: [], groups: [] });
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
        group_id: parseInt(formData.group_id),
        department_id: parseInt(formData.department_id),
        designation_id: parseInt(formData.designation_id),
      };
      await registerEmployee(registrationData);
      alert('Employee registered successfully');
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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Group</label>
            <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
              onChange={e => setFormData({...formData, group_id: e.target.value})}>
              <option value="">Select Group</option>
              {orgData.groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
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

        <div className="pt-4 flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate('/employees')} className="flex-1">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={loading} className="flex-1">Register Employee</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistration;