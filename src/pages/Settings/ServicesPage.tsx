import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Search, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getServices, createService, updateService, deleteService } from '../../api/services/microService';
import { ServiceModal } from './components/ServiceModal';

const ServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ isOpen: false, data: null as any });

  const fetchServices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getServices(page);
      setServices(result?.data?.data || []);
      setPagination(result?.data);
      setCurrentPage(result?.data?.current_page || 1);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(currentPage); }, [currentPage, fetchServices]);

  const handleSave = async (data: any) => {
    try {
      if (modal.data) {
        await updateService(modal.data.id, data);
      } else {
        await createService(data);
      }
      setModal({ isOpen: false, data: null });
      fetchServices(currentPage);
    } catch (error) {
      alert("Action failed. Please check your data.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Permanent delete this service?")) {
      try {
        await deleteService(id);
        fetchServices(currentPage);
      } catch (error) { alert("Delete failed"); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Services</h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">Define agency service offerings</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModal({ isOpen: true, data: null })} className="gap-2 rounded-xl">
          <Plus size={16} /> New Service
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">#</th>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {services.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">
                        {pagination ? (pagination.from + index) : index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-900">{item.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] text-slate-500 max-w-xs truncate">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          item.status === "1" || item.status === true 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {item.status === "1" || item.status === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setModal({ isOpen: true, data: item })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={14}/></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {pagination.last_page}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={!pagination.prev_page_url} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={16}/></Button>
                  <Button variant="secondary" size="sm" disabled={!pagination.next_page_url} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={16}/></Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ServiceModal 
        isOpen={modal.isOpen} 
        onOpenChange={(open) => setModal({ ...modal, isOpen: open })} 
        onSave={handleSave} 
        editingService={modal.data} 
      />
    </div>
  );
};

export default ServicesPage;