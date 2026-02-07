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
  {clients.map((client, index) => (
    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{index + 1}</td>
      <td className="px-5 py-3">
        <p className="text-[11px] font-bold text-slate-900 leading-none">{client.name}</p>
        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{client.company_name}</p>
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-700">{client.contact_number_1}</span>
          <span className="text-[9px] text-slate-400">{client.email}</span>
        </div>
      </td>
      {/* SOURCE TAG LOGIC */}
      <td className="px-5 py-3 text-center">
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${
          client.proposal_id 
            ? 'bg-blue-50 text-blue-600 border-blue-100' 
            : 'bg-slate-50 text-slate-400 border-slate-200'
        }`}>
          {client.proposal_id ? `Prop #${client.proposal_id}` : 'Manual'}
        </span>
      </td>
      <td className="px-5 py-3 text-center">
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${client.status ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
          {client.status ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        {/* Action buttons same as before */}
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