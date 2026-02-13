import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Plus, Search, Filter,
  Edit, Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, getEmployeesForAssignment, assignCalendarWork, assignCalendarWorkContent } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';

interface Creative {
  id: string;
  name: string;
  nos: string;
}

interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  contact_number_1: string;
  contact_number_2: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  update_history: null;
  is_in_leads: boolean;
  proposal_id: null;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role_name: string;
  designation_name: string;
  status: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface CalendarWork {
  id: number;
  client_id: string;
  date: string;
  content_file: null;
  created_at: string;
  updated_at: string;
  description: string;
  content_description: string;
  created_by: string;
  update_history: any[] | null;
  notes: string;
  is_special_day: boolean;
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_time: string | null;
  content_assigned_to: string | null;
  creatives: Creative[];
  client: Client;
  tracking_no: string;
  is_deleted: boolean;
  deleted_by: string | null;
  content_assigned_by: string | null;
}

const WorksheetPage = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workStatuses, setWorkStatuses] = useState<{[key: number]: string}>({});
  const [assignedDesigners, setAssignedDesigners] = useState<{[key: number]: string}>({});
  const [token, setToken] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<number | null>(null);
  const [editingContentAssignment, setEditingContentAssignment] = useState<number | null>(null);
  const [pendingAssignments, setPendingAssignments] = useState<Set<number>>(new Set());
  const [pendingContentAssignments, setPendingContentAssignments] = useState<Set<number>>(new Set());

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Load assigned designers from localStorage and filter by current works
  useEffect(() => {
    const storedAssignments = localStorage.getItem('assignedDesigners');
    if (storedAssignments && calendarWorks.length > 0) {
      try {
        const parsed = JSON.parse(storedAssignments);
        // Only keep assignments for works that exist in current data
        const validAssignments: {[key: number]: string} = {};
        calendarWorks.forEach(work => {
          if (parsed[work.id]) {
            validAssignments[work.id] = parsed[work.id];
          }
        });
        setAssignedDesigners(validAssignments);
      } catch (err) {
      }
    }
  }, [calendarWorks]);

  // Save assigned designers to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(assignedDesigners).length > 0) {
      localStorage.setItem('assignedDesigners', JSON.stringify(assignedDesigners));
    }
  }, [assignedDesigners]);

  // Roles that should hide the date column (case insensitive check)
  const creativeRoles = ['CREATIVE TEAM HEAD', 'CREATIVE DESIGNERS'];

  // Check if user should see date column based on their role
  const shouldShowDate = !creativeRoles.some(role => 
    role.toLowerCase() === (roleName || '').toLowerCase()
  );

  // Roles that should hide the assign designer dropdown
  const assignHiddenRoles = ['CREATIVE DESIGNERS'];

  // Check if user should see assign designer dropdown based on their role
  const shouldShowAssignDropdown = !assignHiddenRoles.some(role => 
    role.toLowerCase() === (roleName || '').toLowerCase()
  );

  // Roles that can assign content (DM Executives only)
  const contentAssignRoles = ['DM EXECUTIVE'];

  // Check if user should see content assignment dropdown based on their role
  const shouldShowContentAssignDropdown = contentAssignRoles.some(role => 
    role.toLowerCase() === (roleName || '').toLowerCase()
  );

  useEffect(() => {
    const fetchCalendarWorks = async () => {
      try {
        setLoading(true);
        const response = await getCalendarWorks();
        console.log('Calendar works API response:', response);
        // Handle different response structures
        const worksData = response.data?.data || response.data || [];
        console.log('Extracted works data:', worksData);
        setCalendarWorks(worksData);
        setError(null);
      } catch (err) {
        console.error('Error fetching calendar works:', err);
        setError('Failed to load calendar works data');
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await getEmployeesForAssignment();
        setEmployees(response.data || []);
      } catch (err) {
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await getUsersList();
        setUsers(response.data?.data || []);
      } catch (err) {
      }
    };

    fetchCalendarWorks();
    fetchEmployees();
    fetchUsers();
  }, []);

  // Helper function to get assigned user details
  const getAssignedUser = (workId: number) => {
    const work = calendarWorks.find(w => w.id === workId);
    if (!work?.assigned_to) return null;
    
    try {
      const assignedUserIds = JSON.parse(work.assigned_to);
      if (assignedUserIds.length === 0) return null;
      
      // Return the first assigned user (for display purposes)
      const userId = assignedUserIds[0];
      return users.find(user => user.id === userId);
    } catch (err) {
      return null;
    }
  };

  // Helper function to get assigned content writer details
  const getAssignedContentWriter = (workId: number) => {
    const work = calendarWorks.find(w => w.id === workId);
    if (!work?.content_assigned_to) return null;
    
    try {
      const assignedUserIds = JSON.parse(work.content_assigned_to);
      if (assignedUserIds.length === 0) return null;
      
      // Return the first assigned content writer (for display purposes)
      const userId = assignedUserIds[0];
      return users.find(user => user.id === userId);
    } catch (err) {
      return null;
    }
  };

  // Filter calendar works based on search term and role-based assignment visibility
  const filteredCalendarWorks = calendarWorks.filter(work => {
    // TEMPORARILY SHOW ALL WORKS FOR DEBUGGING
    // Uncomment the lines below to restore original filtering
    /*
    // Parse assigned_to field - it's a string like "[5]" or "[1,2,3]"
    const assignedToUsers = work.assigned_to ? JSON.parse(work.assigned_to) : [];
    const hasAssignment = assignedToUsers.length > 0;
    const isAssignedToCurrentUser = assignedToUsers.includes(user?.id);
    
    // Role-based visibility:
    // - Creative Team Head and Admin roles: can see all assigned works
    // - All other roles (including Creative Designers): can only see works assigned to them
    const isTeamHeadOrAdmin = roleName?.toLowerCase() === 'creative team head' || 
                             roleName?.toLowerCase().includes('admin');
    const canViewWork = isTeamHeadOrAdmin ? hasAssignment : (hasAssignment && isAssignedToCurrentUser);
    
    const matchesSearch = (work.client?.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.content_description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const shouldInclude = canViewWork && matchesSearch;
    console.log('Work filtering:', {
      workId: work.id,
      hasAssignment,
      isAssignedToCurrentUser,
      isTeamHeadOrAdmin,
      canViewWork,
      matchesSearch,
      shouldInclude,
      userId: user?.id,
      roleName
    });
    
    return shouldInclude;
    */
    
    // TEMP: Show all works
    const matchesSearch = (work.client?.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.content_description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  console.log('Filtered calendar works:', filteredCalendarWorks);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {(roleName?.toLowerCase() === 'creative team head' || roleName?.toLowerCase().includes('admin')) ? 'All Assigned Works' : 'My Assigned Works'}
          </h1>
          <p className="text-sm text-slate-500 font-normal tracking-wide">
            {(roleName?.toLowerCase() === 'creative team head' || roleName?.toLowerCase().includes('admin')) 
              ? `Team overview: ${user?.name} — ${roleName}` 
              : `Your assigned tasks: ${user?.name} — ${roleName}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Filter size={14} className="mr-2" />
            Filter
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={14} className="mr-2" />
            New Work
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, content, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal"
          />
        </div>
      </div>

      {/* Calendar Works Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Calendar Works...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3 w-12 text-center">#</th>
                  <th className="px-5 py-3">Tracking No</th>
                  {shouldShowDate && (
                    <th className="px-5 py-3">Date</th>
                  )}
                  <th className="px-5 py-3">Special Day</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Content Description</th>
                  <th className="px-5 py-3">Creatives</th>
                  <th className="px-5 py-3">Notes</th>
                  {shouldShowAssignDropdown && (
                    <th className="px-5 py-3">Assign Designer</th>
                  )}
                  {shouldShowContentAssignDropdown && (
                    <th className="px-5 py-3">Assign Content</th>
                  )}
                  <th className="px-5 py-3">Design Upload</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{index + 1}</td>
                      <td className="px-5 py-3">
                        <div className="text-[11px] font-bold text-slate-900">
                          {work.tracking_no || 'N/A'}
                        </div>
                      </td>
                      {shouldShowDate && (
                        <td className="px-5 py-3">
                          <div className="text-[11px] font-medium text-slate-900">
                            {work.date ? (() => {
                              const date = new Date(work.date);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            })() : 'No Date'}
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {work.is_special_day ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                              Special Day
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Regular</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[150px]">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1.5 truncate max-w-[150px]">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[11px] text-slate-700 max-w-[200px] truncate">
                          {work.content_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-1">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 2).map((creative, index) => (
                              <div key={index} className="text-[10px] text-slate-600">
                                <span className="font-normal">{creative.name}</span>
                                <span className="text-slate-400 ml-1">({creative.nos})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No creatives</span>
                          )}
                          {work.creatives && work.creatives.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{work.creatives.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[11px] text-slate-700 max-w-[150px] truncate">
                          {work.notes || 'No notes'}
                        </div>
                      </td>
                      {shouldShowAssignDropdown && (
                        <td className="px-5 py-3">
                          {editingAssignment === work.id ? (
                            <select
                              value={(() => {
                                // Parse API data only (no optimistic updates)
                                try {
                                  const assignedUserIds = work.assigned_to ? JSON.parse(work.assigned_to) : [];
                                  return assignedUserIds.length > 0 ? assignedUserIds[0].toString() : '';
                                } catch (err) {
                                  return '';
                                }
                              })()}
                              onChange={async (e) => {
                                const selectedUserId = e.target.value;
                                
                                if (selectedUserId) {
                                  // Show loading state
                                  setPendingAssignments(prev => new Set(prev).add(work.id));
                                  setEditingAssignment(null);
                                  
                                  try {
                                    await assignCalendarWork(work.id, { assigned_to: `[${selectedUserId}]` });
                                    // Reload calendar works to get updated data
                                    const response = await getCalendarWorks();
                                    setCalendarWorks(response.data?.data || []);
                                  } catch (err) {
                                    console.error('Failed to assign work:', err);
                                  } finally {
                                    setPendingAssignments(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(work.id);
                                      return newSet;
                                    });
                                  }
                                } else {
                                  // Handle unassignment
                                  const currentAssignment = (() => {
                                    try {
                                      const assignedUserIds = work.assigned_to ? JSON.parse(work.assigned_to) : [];
                                      return assignedUserIds.length > 0 ? assignedUserIds[0].toString() : '';
                                    } catch (err) {
                                      return '';
                                    }
                                  })();
                                  
                                  if (currentAssignment) {
                                    // Show loading state
                                    setPendingAssignments(prev => new Set(prev).add(work.id));
                                    setEditingAssignment(null);
                                    
                                    try {
                                      await assignCalendarWork(work.id, { assigned_to: '[]' });
                                      // Reload calendar works to get updated data
                                      const response = await getCalendarWorks();
                                      setCalendarWorks(response.data?.data || []);
                                    } catch (err) {
                                      console.error('Failed to unassign work:', err);
                                    } finally {
                                      setPendingAssignments(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(work.id);
                                        return newSet;
                                      });
                                    }
                                  }
                                }
                              }}
                              onBlur={() => setEditingAssignment(null)}
                              disabled={pendingAssignments.has(work.id)}
                              className="text-[10px] border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                              autoFocus
                            >
                              <option value="">Select Designer</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id.toString()}>
                                  {user.name} ({user.email})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              {getAssignedUser(work.id) ? (
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border ${
                                    pendingAssignments.has(work.id)
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  }`}>
                                    {pendingAssignments.has(work.id) ? (
                                      <div className="h-1.5 w-1.5 rounded-full mr-1.5 border border-yellow-500 border-t-transparent animate-spin" />
                                    ) : (
                                      <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
                                    )}
                                    {getAssignedUser(work.id)?.name}
                                  </span>
                                  <button
                                    onClick={() => setEditingAssignment(work.id)}
                                    disabled={pendingAssignments.has(work.id)}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Change assignment"
                                  >
                                    <Edit size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {pendingAssignments.has(work.id) ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                      <div className="h-1.5 w-1.5 rounded-full mr-1.5 border border-yellow-500 border-t-transparent animate-spin" />
                                      Assigning...
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => setEditingAssignment(work.id)}
                                      className="px-3 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                                    >
                                      Assign User
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      {shouldShowContentAssignDropdown && (
                        <td className="px-5 py-3">
                          {editingContentAssignment === work.id ? (
                            <select
                              value={(() => {
                                // Parse API data for content assignment
                                try {
                                  const assignedUserIds = work.content_assigned_to ? JSON.parse(work.content_assigned_to) : [];
                                  return assignedUserIds.length > 0 ? assignedUserIds[0].toString() : '';
                                } catch (err) {
                                  return '';
                                }
                              })()}
                              onChange={async (e) => {
                                const selectedUserId = e.target.value;
                                
                                if (selectedUserId) {
                                  // Show loading state
                                  setPendingContentAssignments(prev => new Set(prev).add(work.id));
                                  setEditingContentAssignment(null);
                                  
                                  try {
                                    await assignCalendarWorkContent(work.id, { content_assigned_to: `[${selectedUserId}]` });
                                    // Reload calendar works to get updated data
                                    const response = await getCalendarWorks();
                                    setCalendarWorks(response.data?.data || []);
                                  } catch (err) {
                                    console.error('Failed to assign content:', err);
                                  } finally {
                                    setPendingContentAssignments(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(work.id);
                                      return newSet;
                                    });
                                  }
                                } else {
                                  // Handle unassignment
                                  const currentAssignment = (() => {
                                    try {
                                      const assignedUserIds = work.content_assigned_to ? JSON.parse(work.content_assigned_to) : [];
                                      return assignedUserIds.length > 0 ? assignedUserIds[0].toString() : '';
                                    } catch (err) {
                                      return '';
                                    }
                                  })();
                                  
                                  if (currentAssignment) {
                                    // Show loading state
                                    setPendingContentAssignments(prev => new Set(prev).add(work.id));
                                    setEditingContentAssignment(null);
                                    
                                    try {
                                      await assignCalendarWorkContent(work.id, { content_assigned_to: '[]' });
                                      // Reload calendar works to get updated data
                                      const response = await getCalendarWorks();
                                      setCalendarWorks(response.data?.data || []);
                                    } catch (err) {
                                      console.error('Failed to unassign content:', err);
                                    } finally {
                                      setPendingContentAssignments(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(work.id);
                                        return newSet;
                                      });
                                    }
                                  }
                                }
                              }}
                              onBlur={() => setEditingContentAssignment(null)}
                              disabled={pendingContentAssignments.has(work.id)}
                              className="text-[10px] border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                              autoFocus
                            >
                              <option value="">Select Content Writer</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id.toString()}>
                                  {user.name} ({user.email})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              {getAssignedContentWriter(work.id) ? (
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border ${
                                    pendingContentAssignments.has(work.id)
                                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                                      : 'bg-purple-100 text-purple-800 border-purple-200'
                                  }`}>
                                    {pendingContentAssignments.has(work.id) ? (
                                      <div className="h-1.5 w-1.5 rounded-full mr-1.5 border border-purple-500 border-t-transparent animate-spin" />
                                    ) : (
                                      <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-purple-500" />
                                    )}
                                    {getAssignedContentWriter(work.id)?.name}
                                  </span>
                                  <button
                                    onClick={() => setEditingContentAssignment(work.id)}
                                    disabled={pendingContentAssignments.has(work.id)}
                                    className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Change content assignment"
                                  >
                                    <Edit size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {pendingContentAssignments.has(work.id) ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                      <div className="h-1.5 w-1.5 rounded-full mr-1.5 border border-purple-500 border-t-transparent animate-spin" />
                                      Assigning Content...
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => setEditingContentAssignment(work.id)}
                                      className="px-3 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                                    >
                                      Assign Content
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.psd,.ai"
                            className="hidden"
                            id={`file-upload-${work.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${work.id}`}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded cursor-pointer transition-colors"
                          >
                            <Upload size={12} />
                            Upload
                          </label>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="relative">
                          {workStatuses[work.id] === 'work-started' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-blue-500" />
                              Work Started
                            </span>
                          )}
                          {workStatuses[work.id] === 'in-progress' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-yellow-500" />
                              In Progress
                            </span>
                          )}
                          {workStatuses[work.id] === 'work-finished' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-green-50 text-green-700 border border-green-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
                              Work Finished
                            </span>
                          )}
                          {workStatuses[work.id] === 'work-edit-done' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-purple-50 text-purple-700 border border-purple-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-purple-500" />
                              Work Edit Done
                            </span>
                          )}
                          {!workStatuses[work.id] && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-normal bg-gray-50 text-gray-600 border border-gray-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-gray-400" />
                              Not Started
                            </span>
                          )}
                          
                          <select
                            value={workStatuses[work.id] || ''}
                            onChange={(e) => setWorkStatuses(prev => ({ ...prev, [work.id]: e.target.value }))}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            title="Change work status"
                          >
                            <option value="">Not Started</option>
                            <option value="work-started">Work Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="work-finished">Work Finished</option>
                            <option value="work-edit-done">Work Edit Done</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11 - (shouldShowDate ? 0 : 1) - (shouldShowAssignDropdown ? 0 : 1) - (shouldShowContentAssignDropdown ? 0 : 1)} className="px-6 py-20 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          {(roleName?.toLowerCase() === 'creative team head' || roleName?.toLowerCase().includes('admin')) 
                            ? 'No assigned works found' 
                            : 'No works assigned to you'
                          }
                        </p>
                        <p className="text-xs text-slate-300 uppercase tracking-widest font-normal">
                          {(roleName?.toLowerCase() === 'creative team head' || roleName?.toLowerCase().includes('admin')) 
                            ? 'No works match your search or no works are currently assigned' 
                            : 'No works match your search or you have no assigned tasks'
                          }
                        </p>
                      </div>
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

export default WorksheetPage;