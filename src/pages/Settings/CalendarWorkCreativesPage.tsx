import React, { useEffect, useState, useCallback } from 'react';
import { Palette, Edit2, Trash2, Eye } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { getCalendarWorkCreatives, getCalendarWorkCreative, updateCalendarWorkCreative, deleteCalendarWorkCreative } from '../../api/services/microService';
import type { CalendarWorkCreativePayload } from '../../api/services/microService';
import { CreateCalendarWorkCreativeModal } from './components/CreateCalendarWorkCreativeModal.tsx';

interface CalendarWorkCreative {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

const CalendarWorkCreativesPage = () => {
  const [creatives, setCreatives] = useState<CalendarWorkCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState<CalendarWorkCreative | null>(null);

  const fetchCreatives = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getCalendarWorkCreatives();
      const creativeList = result?.data?.data || result?.data || [];
      setCreatives(Array.isArray(creativeList) ? creativeList : []);
    } catch (error) {
      console.error("Failed to fetch calendar work creatives", error);
      setCreatives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  const handleUpdate = async (data: CalendarWorkCreativePayload) => {
    if (!selectedCreative) return;
    try {
      await updateCalendarWorkCreative(selectedCreative.id, data);
      setShowEditModal(false);
      setSelectedCreative(null);
      fetchCreatives();
    } catch (error) {
      console.error("Failed to update calendar work creative", error);
      alert("Failed to update creative");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this calendar work creative?")) {
      try {
        await deleteCalendarWorkCreative(id);
        fetchCreatives();
      } catch (error) {
        console.error("Failed to delete calendar work creative", error);
        alert("Failed to delete creative");
      }
    }
  };

  const handleEdit = async (creative: CalendarWorkCreative) => {
    setSelectedCreative(creative);
    setShowEditModal(true);
  };

  const handleView = async (id: number) => {
    try {
      const result = await getCalendarWorkCreative(id);
      setSelectedCreative(result?.data || result);
      setShowViewModal(true);
    } catch (error) {
      console.error("Failed to fetch calendar work creative", error);
      alert("Failed to load creative details");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Calendar Work Creatives</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage creative work templates and configurations</p>
        </div>
        <CreateCalendarWorkCreativeModal onSuccess={fetchCreatives} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-auto relative">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : creatives.length === 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creative Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                    No creatives found in the system.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creative Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {creatives.map((creative) => (
                  <tr key={creative.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Palette size={14} /></div>
                        <span className="text-xs font-bold text-slate-900">{creative.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 max-w-xs truncate">{creative.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                        creative.status
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {creative.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleView(creative.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(creative)}
                        className="text-slate-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(creative.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditCreativeModal
        isOpen={showEditModal}
        onOpenChange={setShowEditModal}
        creative={selectedCreative}
        onSave={handleUpdate}
      />

      <ViewCreativeModal
        isOpen={showViewModal}
        onOpenChange={setShowViewModal}
        creative={selectedCreative}
      />
    </div>
  );
};

interface EditCreativeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  creative: CalendarWorkCreative | null;
  onSave: (data: CalendarWorkCreativePayload) => void;
}

const EditCreativeModal: React.FC<EditCreativeModalProps> = ({ isOpen, onOpenChange, creative, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CalendarWorkCreativePayload>({
    name: '',
    description: '',
    status: true,
  });

  useEffect(() => {
    if (creative) {
      setFormData({
        name: creative.name,
        description: creative.description,
        status: creative.status,
      });
    }
  }, [creative]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch {
      // Error is handled in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-110 font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Edit2 size={16} className="text-blue-600" /> Edit Creative
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Creative Name"
              placeholder="e.g. Social Media Campaign"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-20"
                placeholder="Describe the creative work template..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="edit-creative-status"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              />
              <label htmlFor="edit-creative-status" className="text-xs font-bold text-slate-700 cursor-pointer">Set as Active Creative</label>
            </div>

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" className="flex-1" type="submit" isLoading={loading}>
                Update Creative
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface ViewCreativeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  creative: CalendarWorkCreative | null;
}

const ViewCreativeModal: React.FC<ViewCreativeModalProps> = ({ isOpen, onOpenChange, creative }) => {
  if (!creative) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-110 font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} className="text-blue-600" /> View Creative
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Creative Name</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm text-slate-900">{creative.name}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100 min-h-20">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{creative.description}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  creative.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {creative.status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {creative.created_at && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-700">{new Date(creative.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            {creative.updated_at && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Updated At</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-700">{new Date(creative.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" className="flex-1">Close</Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CalendarWorkCreativesPage;