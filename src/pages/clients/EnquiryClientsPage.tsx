import { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getClients, deleteClient } from '../../api/services/microService';
import { ClientFormModal } from './Component/ClientFormModal'; 

const EnquiryClientsPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [modal, setModal] = useState({ isOpen: false, data: null as any });

  const fetchClients = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await getClients(page, false);
      
      // SAFETY FILTER: Ensure only Enquiry Clients (is_in_leads: false) appear here
      const enquiryClients = result?.data?.data?.filter((c: any) => c.is_in_leads === false) || [];
      
      setClients(enquiryClients);
      setPagination(result?.data);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(currentPage); }, [currentPage, fetchClients]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this client?")) {
      try { await deleteClient(id); fetchClients(currentPage); } 
      catch (e) { alert("Failed to delete"); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enquiry Clients</h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">Direct client entries (Non-Lead)</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="gap-2 rounded-xl"
          onClick={() => setModal({ isOpen: true, data: null })}
        >
          <Plus size={16} /> Add Client
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.length > 0 ? clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900">{client.name}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-600">{client.company_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-[10px] text-slate-500">
                        <span>{client.email}</span>
                        <span>{client.contact_number_1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${client.status ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {client.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setModal({ isOpen: true, data: client })} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-xs italic">No enquiry clients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <span className="text-[10px] text-slate-400 font-medium">Page {pagination.current_page} of {pagination.last_page}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={!pagination.prev_page_url} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={14}/></Button>
              <Button variant="secondary" size="sm" disabled={!pagination.next_page_url} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={14}/></Button>
            </div>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <ClientFormModal 
          isOpen={modal.isOpen}
          onOpenChange={(open) => setModal({ ...modal, isOpen: open })}
          onSuccess={() => fetchClients(currentPage)} 
          clientData={modal.data}
        />
      )}
    </div>
  );
};

export default EnquiryClientsPage;