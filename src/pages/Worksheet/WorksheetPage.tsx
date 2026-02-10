import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Plus, Search, Filter,
  Calendar, User, CheckCircle, Clock,
  Edit, Trash2, MoreVertical, Loader2,
  Upload, Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks } from '../../api/services/microService';

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
  update_history: null;
  notes: string;
  is_special_day: boolean;
  creatives: Creative[];
  client: Client;
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

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    console.log('Token from localStorage:', storedToken);
  }, []);

  // Roles that should hide the date column (case insensitive check)
  const creativeRoles = ['CREATIVE TEAM HEAD', 'CREATIVE DESIGNERS'];

  // Check if user should see date column based on their role
  const shouldShowDate = !creativeRoles.some(role => 
    role.toLowerCase() === (roleName || '').toLowerCase()
  );

  // Debug logging
  console.log('Current roleName:', roleName);
  console.log('shouldShowDate:', shouldShowDate);
  console.log('creativeRoles:', creativeRoles);
  console.log('Case insensitive match found:', creativeRoles.some(role => 
    role.toLowerCase() === (roleName || '').toLowerCase()
  ));

  useEffect(() => {
    const fetchCalendarWorks = async () => {
      try {
        setLoading(true);
        const response = await getCalendarWorks();
        setCalendarWorks(response.data?.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch calendar works:', err);
        setError('Failed to load calendar works data');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarWorks();
  }, []);

  // Filter calendar works based on search term
  const filteredCalendarWorks = calendarWorks.filter(work => {
    const matchesSearch = (work.client?.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.content_description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (work.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Calendar Works</h1>
          <p className="text-sm text-slate-500 font-normal tracking-wide">
            Task Manager: {user?.name} — <span className="text-blue-600 font-medium">{roleName}</span>
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px] flex flex-col">
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
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">SL No</th>
                  {shouldShowDate && (
                    <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Date</th>
                  )}
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Client</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Content Description</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Creatives</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Notes</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Assign Designer</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Design Upload</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Status</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider align-top">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-left align-top">
                        <div className="text-sm font-medium text-slate-900">
                          {index + 1}
                        </div>
                      </td>
                      {shouldShowDate && (
                        <td className="px-6 py-4 text-left align-top">
                          <div className="text-sm font-medium text-slate-900">
                            {work.date ? (() => {
                              console.log('Raw date value:', work.date, 'Type:', typeof work.date);
                              const date = new Date(work.date);
                              console.log('Parsed date:', date, 'isNaN:', isNaN(date.getTime()));
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            })() : 'No Date'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-left align-top">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 leading-none truncate max-w-[150px]">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1.5 truncate max-w-[150px]">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <div className="text-sm text-slate-700 max-w-[200px] truncate">
                          {work.content_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <div className="space-y-1">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 2).map((creative, index) => (
                              <div key={index} className="text-xs text-slate-600">
                                <span className="font-normal">{creative.name}</span>
                                <span className="text-slate-400 ml-1">({creative.nos})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No creatives</span>
                          )}
                          {work.creatives && work.creatives.length > 2 && (
                            <span className="text-xs text-slate-400">+{work.creatives.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <div className="text-sm text-slate-700 max-w-[150px] truncate">
                          {work.notes || 'No notes'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <select
                          value={assignedDesigners[work.id] || ''}
                          onChange={(e) => setAssignedDesigners(prev => ({ ...prev, [work.id]: e.target.value }))}
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Designer</option>
                          <option value="John Doe">John Doe</option>
                          <option value="Jane Smith">Jane Smith</option>
                          <option value="Mike Johnson">Mike Johnson</option>
                          <option value="Sarah Wilson">Sarah Wilson</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.psd,.ai"
                            className="hidden"
                            id={`file-upload-${work.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${work.id}`}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded cursor-pointer transition-colors"
                          >
                            <Upload size={12} />
                            Upload
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left align-top">
                        <div className="relative">
                          {workStatuses[work.id] === 'work-started' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-normal bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-blue-500" />
                              Work Started
                            </span>
                          )}
                          {workStatuses[work.id] === 'in-progress' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-normal bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-yellow-500" />
                              In Progress
                            </span>
                          )}
                          {workStatuses[work.id] === 'work-finished' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-normal bg-green-50 text-green-700 border border-green-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
                              Work Finished
                            </span>
                          )}
                          {workStatuses[work.id] === 'work-edit-done' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-normal bg-purple-50 text-purple-700 border border-purple-200">
                              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-purple-500" />
                              Work Edit Done
                            </span>
                          )}
                          {!workStatuses[work.id] && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-normal bg-gray-50 text-gray-600 border border-gray-200">
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
                      <td className="px-6 py-4 text-left align-top">
                        <div className="flex gap-1">
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
                    <td colSpan={shouldShowDate ? 10 : 9} className="px-6 py-20 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          No calendar works found
                        </p>
                        <p className="text-xs text-slate-300 uppercase tracking-widest font-normal">
                          No records match your search criteria
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