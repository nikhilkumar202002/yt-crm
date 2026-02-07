import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, User, Mail, Building2, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient, updateClient } from '../../../api/services/microService';

export const ClientFormModal = ({ isOpen, onOpenChange, clientData, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    contact_number_1: '',
    contact_number_2: '',
    status: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientData) {
      setFormData({
        name: clientData.name || '',
        email: clientData.email || '',
        company_name: clientData.company_name || '',
        contact_number_1: clientData.contact_number_1 || '',
        contact_number_2: clientData.contact_number_2 || '',
        status: clientData.status ?? true
      });
    } else {
      setFormData({ 
        name: '', email: '', company_name: '', 
        contact_number_1: '', contact_number_2: '', status: true 
      });
    }
  }, [clientData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (clientData?.id) {
        await updateClient(clientData.id, formData);
      } else {
        await createClient(formData);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Failed to process client request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[32px] p-0 shadow-2xl z-[120] font-sans overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header with Background Gradient */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              {/* FIX: Replaced h2 with Dialog.Title to satisfy accessibility requirements */}
              <Dialog.Title className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                {clientData ? 'Modify Client Record' : 'Onboard New Client'}
              </Dialog.Title>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                YT CRM Enterprise Directory System
              </p>
            </div>
            <Dialog.Close className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
              <X size={20} />
            </Dialog.Close>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Primary Information Group */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Contact Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                      placeholder="e.g. Jins"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Company Entity</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="e.g. AdBC"
                      value={formData.company_name} 
                      onChange={e => setFormData({...formData, company_name: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                  <input 
                    required 
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="client@email.com"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Primary Contact</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="7232233223"
                      value={formData.contact_number_1} 
                      onChange={e => setFormData({...formData, contact_number_1: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Secondary (Optional)</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} />
                    <input 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Alternate number"
                      value={formData.contact_number_2} 
                      onChange={e => setFormData({...formData, contact_number_2: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Security Notice */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-900 uppercase leading-none">Client Status</p>
                  <p className="text-[9px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">Current Access Control</p>
                </div>
              </div>
              
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