import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Loader2, Mail, Phone, User, CheckCircle2, 
  ExternalLink, FileText, Search, Plus, Edit, Trash2, Building2 
} from 'lucide-react';
import { getClients, deleteClient } from '../../api/services/microService';
import { Button } from '../../components/common/Button';
import { ClientFormModal } from './Component/ClientFormModal';

const ClientPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formModal, setFormModal] = useState<{
    isOpen: boolean, 
    clientData: any | null 
  }>({ isOpen: false, clientData: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClients(1); // Fetch all clients via GET
      setClients(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(id); // DELETE method
      fetchData();
    } catch (error) {
      alert("Failed to delete client.");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={24} /> Client Directory
          </h1>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Manage enterprise partners and contracts</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search by name, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <Button 
            onClick={() => setFormModal({ isOpen: true, clientData: null })}
            className="h-10 px-4 rounded-xl bg-slate-900 text-white flex items-center gap-2"
          >
            <Plus size={16} /> <span className="text-[11px] font-black uppercase">Add Client</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5 w-14 text-center">#</th>
                  <th className="px-6 py-5 min-w-[220px]">Client & Company</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-blue-50/10 transition-all group">
                    <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-300">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{client.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{client.company_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-2"><Mail size={10} className="text-blue-400"/> {client.email}</span>
                        <span className="flex items-center gap-2 font-bold"><Phone size={10} className="text-green-500"/> {client.contact_number_1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                        client.status ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {client.status ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="secondary" size="sm"
                          onClick={() => setFormModal({ isOpen: true, clientData: client })}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="secondary" size="sm"
                          onClick={() => handleDelete(client.id)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClientFormModal 
        isOpen={formModal.isOpen}
        onOpenChange={(open) => setFormModal({ ...formModal, isOpen: open })}
        clientData={formModal.clientData}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ClientPage;