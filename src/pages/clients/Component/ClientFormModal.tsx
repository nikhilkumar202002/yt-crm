import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, User, Mail, Building2, Phone, Loader2, FileText, Link as LinkIcon } from 'lucide-react';
import { createClient, updateClient, getProposals } from '../../../api/services/microService';

interface ClientFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientData?: any; // Data for editing
  onSuccess: () => void; // Callback to refresh parent list
}

// Renamed back to ClientFormModal to match your imports
export const ClientFormModal = ({ 
  isOpen, 
  onOpenChange, 
  clientData, 
  onSuccess
}: ClientFormModalProps) => {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    contact_number_1: '',
    contact_number_2: '',
    status: true,
    proposal_id: null as number | null
  });
  
  const [loading, setLoading] = useState(false);
  const [isFromProposal, setIsFromProposal] = useState(false); 
  const [proposals, setProposals] = useState<any[]>([]); 
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    if (clientData) {
      setFormData({
        name: clientData.name || '',
        email: clientData.email || '',
        company_name: clientData.company_name || '',
        contact_number_1: clientData.contact_number_1 || '',
        contact_number_2: clientData.contact_number_2 || '',
        status: clientData.status ?? true,
        proposal_id: clientData.proposal_id || null
      });
      if (clientData.proposal_id) setIsFromProposal(true);
    } else {
      setFormData({ 
        name: '', email: '', company_name: '', 
        contact_number_1: '', contact_number_2: '', status: true,
        proposal_id: null
      });
      setIsFromProposal(false);
    }
  }, [clientData, isOpen]);

  // Fetch Proposals when checkbox is checked
  useEffect(() => {
    if (isFromProposal && !clientData) {
      const fetchProps = async () => {
        setLoadingProposals(true);
        try {
          const res = await getProposals(1); 
          setProposals(res?.data?.data || []);
        } catch (error) {
          console.error("Failed to load proposals", error);
        } finally {
          setLoadingProposals(false);
        }
      };
      fetchProps();
    }
  }, [isFromProposal, clientData]);

  // Handle Proposal Selection & Auto-fill
  const handleProposalSelect = (proposalId: string) => {
    const selected = proposals.find(p => p.id === Number(proposalId));
    if (selected) {
      // Adjust these keys based on your exact Proposal API response structure
      const leadInfo = selected.lead_assign?.lead?.lead_data || selected.lead_assign?.lead || {};
      
      setFormData(prev => ({
        ...prev,
        proposal_id: selected.id,
        name: leadInfo.full_name || leadInfo.name || '',
        email: leadInfo.email || '',
        company_name: leadInfo.company_name || '',
        contact_number_1: leadInfo.phone_number || leadInfo.phone || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (clientData) {
        await updateClient(clientData.id, {
          ...formData,
          is_in_leads: isFromProposal
        });
      } else {
        // is_in_leads is true ONLY if "Fetch data from Proposal" is checked
        // otherwise it is false (manual client entry)
        await createClient({
          ...formData,
          is_in_leads: isFromProposal,
          proposal_id: formData.proposal_id
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to save client details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-[120] font-sans focus:outline-none">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {clientData ? 'Edit Client' : 'New Client'}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {clientData ? 'Update Details' : 'Registration Form'}
              </p>
            </div>
            <Dialog.Close className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Header Checkbox for Linking Proposal */}
          {!clientData && (
            <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="linkProposal"
                  checked={isFromProposal}
                  onChange={(e) => {
                    setIsFromProposal(e.target.checked);
                    if (!e.target.checked) setFormData(prev => ({ ...prev, proposal_id: null }));
                  }}
                  className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="linkProposal" className="text-xs font-bold text-indigo-900 cursor-pointer flex items-center gap-1.5">
                  <LinkIcon size={12} /> Fetch data from Proposal
                </label>
              </div>

              {isFromProposal && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  {loadingProposals ? (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-400">
                      <Loader2 size={12} className="animate-spin"/> Loading proposals...
                    </div>
                  ) : (
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={14} />
                      <select 
                        className="w-full pl-9 pr-4 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                        onChange={(e) => handleProposalSelect(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select a Proposal...</option>
                        {proposals.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {/* Display Name, Phone, Email in dropdown */}
                            PID-{p.id} : {p.lead_assign?.lead?.lead_data?.full_name || 'Unknown'} 
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  required
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  placeholder="Enter client name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  required
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  placeholder="client@company.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Company Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Company</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  required
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                  placeholder="Company Name"
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                />
              </div>
            </div>

            {/* Phone Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Primary Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input 
                    required
                    type="tel" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                    placeholder="Mobile"
                    value={formData.contact_number_1}
                    onChange={e => setFormData({...formData, contact_number_1: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Secondary Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input 
                    type="tel" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                    placeholder="Optional"
                    value={formData.contact_number_2}
                    onChange={e => setFormData({...formData, contact_number_2: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Status</label>
              <button
                type="button"
                onClick={() => setFormData({...formData, status: !formData.status})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  formData.status ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  formData.status ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <button 
              disabled={loading}
              className="w-full group relative flex items-center justify-center h-14 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                    {clientData ? 'Commit Record Changes' : 'Confirm Registration'}
                  </span>
                  <Check size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};