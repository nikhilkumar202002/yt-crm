import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2, X, PlusCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getServices, createService, updateService, deleteService, deleteSubService, getSubServices } from '../../api/services/microService';
import { ServiceModal } from './components/ServiceModal';
import { SubServiceModal } from './components/SubServiceModal';

const ServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ isOpen: false, data: null as any });
  
  // Updated state to track which service we are adding a sub-category to
  const [subModal, setSubModal] = useState({ isOpen: false, serviceId: null as number | null });

  const fetchServices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const [servicesRes, subServicesRes] = await Promise.all([
        getServices(page),
        getSubServices(1)
      ]);

      const mainServices = servicesRes?.data?.data || [];
      const allSubServices = subServicesRes?.data?.data || [];

      const mergedData = mainServices.map((service: any) => ({
        ...service,
        sub_services: allSubServices.filter((sub: any) => Number(sub.service_id) === Number(service.id))
      }));
      
      setServices(mergedData);
      setPagination(servicesRes?.data);
      setCurrentPage(servicesRes?.data?.current_page || 1);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(currentPage); }, [currentPage, fetchServices]);

  const handleDeleteService = async (id: number) => {
    if (window.confirm("Permanent delete this main service?")) {
      setServices(prev => prev.filter(s => s.id !== id)); // Optimistic delete
      try { await deleteService(id); } catch (e) { fetchServices(currentPage); }
    }
  };

  const handleDeleteSubCategory = async (subId: number) => {
    if (window.confirm("Remove this sub-service?")) {
      setServices(prev => prev.map(s => ({
        ...s,
        sub_services: s.sub_services?.filter((sub: any) => sub.id !== subId)
      }))); // Optimistic delete
      try { await deleteSubService(subId); } catch (e) { fetchServices(currentPage); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">System Services</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 uppercase tracking-wider">Define agency service offerings</p>
        </div>
        
        {/* Only Main Service Button kept here */}
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setModal({ isOpen: true, data: null })} 
          className="h-9 gap-2 rounded-xl shadow-md"
        >
          <Plus size={14} /> 
          <span className="text-[10px] font-black uppercase">New Main Service</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 py-20">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 w-16 text-center">#</th>
                <th className="px-6 py-4 min-w-[150px]">Main Service</th>
                <th className="px-6 py-4 min-w-[250px]">Sub-Categories</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {services.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-300">
                    {pagination ? (pagination.from + index) : index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-900 uppercase">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px] italic">{item.description}</p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.sub_services?.map((sub: any) => (
                        <div key={sub.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[9px] font-bold uppercase group/tag">
                          {sub.name}
                          <button onClick={() => handleDeleteSubCategory(sub.id)} className="hover:text-red-500 p-0.5"><X size={10} strokeWidth={3} /></button>
                        </div>
                      ))}
                      
                      {/* INLINE PLUS ICON FOR SUB-SERVICE */}
                      <button 
                        onClick={() => setSubModal({ isOpen: true, serviceId: item.id })}
                        className="p-1 text-slate-300 hover:text-blue-600 transition-colors"
                        title="Add Sub-Category"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                      item.status === "1" || item.status === true ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {item.status === "1" || item.status === true ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal({ isOpen: true, data: item })} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                      <button onClick={() => handleDeleteService(item.id)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceModal isOpen={modal.isOpen} onOpenChange={(open) => setModal({ ...modal, isOpen: open })} onSave={(d) => { fetchServices(currentPage); setModal({isOpen:false, data:null}); }} editingService={modal.data} />
      
      {/* Updated SubServiceModal integration */}
      <SubServiceModal 
        isOpen={subModal.isOpen}
        onOpenChange={(open) => setSubModal({ ...subModal, isOpen: open })}
        onSuccess={() => fetchServices(currentPage)}
        initialServiceId={subModal.serviceId}
      />
    </div>
  );
};

export default ServicesPage;