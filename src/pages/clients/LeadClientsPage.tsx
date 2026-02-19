import { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getClients } from '../../api/services/microService';

const LeadClientsPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchClients = useCallback(async (page: number) => {
    try {
      setLoading(true);
      // We still send 'true' to the API in case the backend implements filtering later
      const result = await getClients(page, true); 
      
      // SAFETY FILTER: Manually filter based on the API response structure you provided
      // This ensures ONLY Lead Clients appear here, even if the API returns mixed data.
      const leadClients = result?.data?.data?.filter((c: any) => c.is_in_leads === true) || [];
      
      setClients(leadClients);
      setPagination(result?.data); // Keep original pagination metadata
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(currentPage); }, [currentPage, fetchClients]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lead Clients</h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">Clients converted from approved leads</p>
        </div>
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
                  <th className="px-6 py-4">Proposal Ref</th>
                  <th className="px-6 py-4">Conversion Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clients.length > 0 ? clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900">{client.name}</p>
                      <p className="text-[10px] text-slate-400">{client.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-600">{client.company_name}</td>
                    
                    {/* Display Proposal ID if available (Matches your JSON 'proposal_id': "1") */}
                    <td className="px-6 py-4">
                      {client.proposal_id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold">
                          <FileText size={12} />
                          PID-{client.proposal_id}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Proposal Linked</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-[10px] text-slate-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${client.status ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {client.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-xs italic">
                      No lead clients found.
                    </td>
                  </tr>
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
    </div>
  );
};

export default LeadClientsPage;