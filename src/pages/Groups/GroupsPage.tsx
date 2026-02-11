import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Loader2, ChevronLeft, ChevronRight,
  Users, Edit, Trash2, Eye
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getGroups, deleteGroup } from '../../api/services/microService';

interface Group {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGroups = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getGroups(page);
      const groupArray = result?.data?.data || [];
      setGroups(groupArray);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups(currentPage);
  }, [currentPage, fetchGroups]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(id);
        fetchGroups(currentPage);
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert('Failed to delete group');
      }
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Groups</h1>
              <p className="text-sm text-slate-500">Manage your organization groups</p>
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Group
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search groups..."
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Status
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
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No groups found
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group, index) => (
                      <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {pagination ? (pagination.from + index) : index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{group.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 max-w-xs truncate">
                            {group.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            group.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {group.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(group.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1">
                              <Eye size={16} />
                            </button>
                            <button className="text-slate-600 hover:text-slate-900 p-1">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(group.id)}
                              className="text-red-600 hover:text-red-900 p-1"
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
                  Showing {pagination.from}-{pagination.to} of {pagination.total} groups
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
    </div>
  );
};

export default GroupsPage;