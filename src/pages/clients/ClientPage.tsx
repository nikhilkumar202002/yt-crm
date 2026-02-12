import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Loader2, Mail, Phone, Building2, 
  FileText, Search, CheckCircle2, Edit3, Layers 
} from 'lucide-react';
// Added getServices to imports
import { getProposals, getServices } from '../../api/services/microService';
import { Button } from '../../components/common/Button';
import { ClientFormModal } from './Component/ClientFormModal';
import { useAppSelector } from '../../store/store';

const ClientPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formModal, setFormModal] = useState<{
    isOpen: boolean, 
    clientData: any | null 
  }>({ isOpen: false, clientData: null });

  const { roleName, position } = useAppSelector((state) => state.auth);
  const isStaffOrIntern = roleName?.toLowerCase() === 'staff' || position === 'intern';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Parallel Fetch: Proposals (Data Source) and Services (For Mapping)
      const [proposalsRes, servicesRes] = await Promise.all([
        getProposals(1),
        getServices(1)
      ]);

      const allProposals = proposalsRes?.data?.data || [];
      const servicesList = servicesRes?.data?.data || [];

      // 2. Filter ONLY Approved Proposals
      const approvedProposals = allProposals.filter((p: any) => p.is_accepted === true);

      // 3. Map Proposal Data to Client Structure
      const mappedClients = approvedProposals.map((p: any) => {
        const leadData = p.lead_assign?.lead?.lead_data || {};
        const userData = p.lead_assign?.user || {};
        
        // Map Service IDs to Names
        const serviceIds = p.lead_assign?.service_ids || [];
        const serviceNames = serviceIds.map((id: number) => {
          const service = servicesList.find((s: any) => s.id === Number(id));
          return service ? service.name : null;
        }).filter(Boolean);

        return {
          id: p.id, // Using Proposal ID as reference
          name: leadData.full_name || userData.name || 'Unknown Client',
          company_name: leadData.location || leadData.city || 'N/A',
          email: leadData.email || userData.email || 'N/A',
          contact_number_1: leadData.phone_number || userData.mobile_number || 'N/A',
          contact_number_2: null, // Placeholder if needed
          proposal_file: p.file_url,
          proposal_id: p.id, // Keep reference for modal
          status: p.lead_assign?.user_status || 'Active',
          onboarded_at: p.updated_at,
          services: serviceNames, // Store mapped names
          creative: p.creatives_nos || 0,
          video: p.videos_nos || 0,
          amount: p.amount || 0
        };
      });

      setClients(mappedClients);

    } catch (error) {
      console.error("Failed to fetch onboarded clients", error);
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
            <Users className="text-blue-600" size={24} /> Onboarded Clients
          </h1>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            View clients from approved proposals
          </p>
        </div>

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
                  <th className="px-6 py-5 min-w-[220px]">Client & Location</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Assigned Services</th> {/* New Column */}
                  <th className="px-6 py-5 text-center">Creative</th>
                  <th className="px-6 py-5 text-center">Video</th>
                  {!isStaffOrIntern && <th className="px-6 py-5 text-center">Amount</th>}
                  {!isStaffOrIntern && <th className="px-6 py-5 text-center">Proposal</th>}
                  <th className="px-6 py-5 text-center">Lead Status</th>
                  <th className="px-6 py-5 text-center">Onboarded Status</th>
                  {!isStaffOrIntern && <th className="px-6 py-5 text-center">Actions</th>} {/* Action Column */}
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
                        <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                          <Mail size={10} className="text-slate-300"/> {client.email}
                        </span>
                      </div>
                    </td>

                    {/* SERVICES COLUMN */}
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {client.services && client.services.length > 0 ? (
                          client.services.map((serviceName: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 text-[8px] font-bold uppercase tracking-tighter">
                              {serviceName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-slate-300 italic">No Services</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] font-bold text-slate-700">{client.creative}</span>
                    </td>
                    
                    <td className="px-5 py-3 text-center">
                      <span className="text-[10px] font-bold text-slate-700">{client.video}</span>
                    </td>
                    
                    {!isStaffOrIntern && (
                      <td className="px-5 py-3 text-center">
                        <span className="text-[10px] font-bold text-slate-700">₹{client.amount}</span>
                      </td>
                    )}
                    
                    {!isStaffOrIntern && (
                      <td className="px-5 py-3 text-center">
                        {client.proposal_file ? (
                          <div className="flex flex-col items-center gap-1">
                            <a 
                              href={client.proposal_file} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold hover:bg-indigo-100 transition-colors"
                            >
                              <FileText size={10} />
                              View PDF
                            </a>
                            <span className="text-[8px] text-indigo-400 font-medium">PID-{client.id}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-300 italic">No File</span>
                        )}
                      </td>
                    )}

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={10} /> {client.status}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Onboarded
                      </span>
                    </td>

                    {!isStaffOrIntern && (
                      <td className="px-5 py-3 text-center">
                        <button 
                          onClick={() => setFormModal({ isOpen: true, clientData: client })} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Client Details"
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isStaffOrIntern ? 8 : 11} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                      No onboarded clients found.
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
        isInLeads={true} 
      />
    </div>
  );
};

export default ClientPage;