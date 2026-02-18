import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UserPlus, Save, Mail, Phone, MapPin, Tag, MessageSquare, Globe, User } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { createLead } from '../../../api/services/microService';

interface AddLeadModalProps {
  onSuccess: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddLeadModal = ({ onSuccess, isOpen, onOpenChange }: AddLeadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    source: '',
    notes: '',
    platform: 'Manual Entry'
  });

  const handleSave = async () => {
    // Validation
    if (!formData.name) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    try {
      // In the CRM frontend, name is viewed via full_name
      const payload = {
        platform: formData.platform || 'Manual',
        lead_data: {
          full_name: formData.name, // Mapping for UI compatibility
          name: formData.name,      // User's specific field
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          source: formData.source,
          notes: formData.notes
        }
      };

      await createLead(payload);
      onSuccess();
      onOpenChange(false);
      setFormData({ name: '', email: '', phone: '', city: '', source: '', notes: '', platform: 'Manual Entry' });
    } catch (error) {
      console.error("Lead creation failed:", error);
      alert('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-none p-6 shadow-2xl z-[110] font-sans border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 text-white rounded-none flex items-center justify-center shadow-lg shadow-blue-200">
                <UserPlus size={16} />
              </div>
              <div>
                <Dialog.Title className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  Manual Lead Creation
                </Dialog.Title>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add a new record to pipeline</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-100 rounded-none transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <User size={10} className="text-blue-500" /> Full Name *
                </label>
                <Input 
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-10 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <Mail size={10} className="text-emerald-500" /> Email Address
                </label>
                <Input 
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-10 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <Phone size={10} className="text-indigo-500" /> Contact Number
                </label>
                <Input 
                  name="phone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-10 text-[11px] font-bold"
                />
              </div>
            </div>

            <div className="space-y-4">
               <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <MapPin size={10} className="text-rose-500" /> City / Location
                </label>
                <Input 
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  className="h-10 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <Tag size={10} className="text-amber-500" /> Source
                </label>
                <Input 
                  name="source"
                  placeholder="Facebook Lead Ad"
                  value={formData.source}
                  onChange={handleChange}
                  className="h-10 text-[11px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                  <Globe size={10} className="text-slate-400" /> Platform Tag
                </label>
                <select 
                  name="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="Manual Entry">Manual Entry</option>
                  <option value="Direct Call">Direct Call</option>
                  <option value="Referral">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
              <MessageSquare size={10} className="text-orange-500" /> Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Enter detailed client requirements or background here..."
              className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-none text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-300 transition-all placeholder:text-slate-300 resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1 h-11 rounded-none text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-white transition-all">
                Discard Changes
              </Button>
            </Dialog.Close>
            <Button 
              variant="primary" 
              className="flex-[2] h-11 rounded-none text-[11px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]" 
              isLoading={loading}
              onClick={handleSave}
            >
              <Save size={16} className="mr-2" /> Store Lead Record
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
