import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Loader2, Mail, Phone, Building2, 
  Search, CheckCircle2, Edit3
} from 'lucide-react';
// Added getServices to imports
import { getClients } from '../../api/services/microService';
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
      
      // Fetch all clients from /clients API
      const clientsRes = await getClients(1);
      const clientsList = clientsRes?.data?.data || [];

      setClients(clientsList);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredClients = clients.filter(c => 
    (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={24} /> Clients
          </h1>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Manage all clients
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setFormModal({ isOpen: true, clientData: null })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
          >
            + Add Client
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative h-auto">
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
                {filteredClients.length > 0 ? filteredClients.map((client, index) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{index + 1}</td>
                    
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          {client.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-900 leading-none">{client.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 size={10} className="text-slate-400"/>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                              {client.company_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                          <Phone size={10} className="text-blue-400"/> {client.contact_number_1}
                        </span>
                        {client.contact_number_2 && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                            <Phone size={10} className="text-blue-400"/> {client.contact_number_2}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                          <Mail size={10} className="text-slate-300"/> {client.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        client.status ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        <CheckCircle2 size={10} /> {client.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Onboarded
                      </span>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setFormModal({ isOpen: true, clientData: client })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                      No clients found.
                    </td>
                  </tr>
                )}
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