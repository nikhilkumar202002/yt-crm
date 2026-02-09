import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, Users, Upload, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAppSelector } from '../../../store/store';
import { getRoles } from '../../../api/services/authService';

interface Client {
  id: number;
  name: string;
}

interface SelectedCreativeItem {
  id: number;
  quantity: number;
}

interface CalendarWorkCreative {
  id: number;
  name: string;
  description: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DatePopupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  selectedClient?: number | null;
  onSave: (data: { client_id: number; date: string; description: string; content_description: string; notes: string; content_file?: File | null; is_special_day?: boolean }) => void;
  existingData?: { client_id: number; description: string; content_description: string; content_file?: File | null; is_special_day?: boolean };
  clients?: Client[];
  calendarWorkCreatives?: CalendarWorkCreative[];
}

const DatePopupModal: React.FC<DatePopupModalProps> = ({
  isOpen,
  onOpenChange,
  selectedDate,
  selectedClient,
  onSave,
  existingData,
  clients: propClients = [],
  calendarWorkCreatives: propCalendarWorkCreatives = [],
}) => {
  const [clientId, setClientId] = useState<number>(0);
  const [workDescription, setWorkDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [isSpecialDay, setIsSpecialDay] = useState<boolean>(false);
  const [clients, setClients] = useState<Client[]>(propClients);
  const [calendarWorkCreatives, setCalendarWorkCreatives] = useState<CalendarWorkCreative[]>(propCalendarWorkCreatives);
  const [selectedCreativeItems, setSelectedCreativeItems] = useState<SelectedCreativeItem[]>([]);
  const [currentCreativeId, setCurrentCreativeId] = useState<number>(0);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [roles, setRoles] = useState<any[]>([]);

  // Get user role for conditional rendering
  const { roleName } = useAppSelector((state) => state.auth);
  const isDMExecutive = roleName?.toUpperCase() === 'DM EXECUTIVE';

  // Update state when props change
  useEffect(() => {
    setClients(propClients);
  }, [propClients]);

  useEffect(() => {
    setCalendarWorkCreatives(propCalendarWorkCreatives);
  }, [propCalendarWorkCreatives]);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data || []);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setRoles([]);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const initializeForm = () => {
        if (existingData) {
          setClientId(existingData.client_id);
          setWorkDescription(existingData.content_description || '');
          setContentFile(null);
          setIsSpecialDay(existingData.is_special_day || false);
        } else {
          setClientId(selectedClient || 0);
          setWorkDescription('');
          setNotes('');
          setContentFile(null);
          setSelectedCreativeItems([]);
          setCurrentCreativeId(0);
          setCurrentQuantity(0);
          setIsSpecialDay(false);
        }
      };
      initializeForm();
    }
  }, [isOpen, existingData, selectedClient]);

  const addCreativeItem = () => {
    if (currentCreativeId > 0 && currentQuantity > 0) {
      const existingIndex = selectedCreativeItems.findIndex(item => item.id === currentCreativeId);
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...selectedCreativeItems];
        updatedItems[existingIndex].quantity += currentQuantity;
        setSelectedCreativeItems(updatedItems);
      } else {
        // Add new item
        setSelectedCreativeItems([...selectedCreativeItems, { id: currentCreativeId, quantity: currentQuantity }]);
      }
      setCurrentCreativeId(0);
      setCurrentQuantity(0);
    }
  };

  const removeCreativeItem = (id: number) => {
    setSelectedCreativeItems(selectedCreativeItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (selectedDate && clientId > 0) {
      // Construct date string using date-fns for consistency
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      // Prepare creative work data for payload
      const creativeWorkIds = selectedCreativeItems.map(item => item.id).join(',');
      const creativeWorkNumbers = selectedCreativeItems.map(item => item.quantity).join(',');

      const payload = {
        client_id: clientId,
        date: dateString, // YYYY-MM-DD
        description: selectedCreativeItems.length > 0 ? JSON.stringify({
          calender_works_creative_ids: creativeWorkIds,
          creative_nos: creativeWorkNumbers
        }) : JSON.stringify([]), // Keep empty array for backward compatibility
        content_file: contentFile,
        content_description: workDescription,
        notes: notes,
        is_special_day: isSpecialDay ? 1 : 0,
      };
      onSave(payload);
      setClientId(0);
      setWorkDescription('');
      setNotes('');
      setContentFile(null);
      setSelectedCreativeItems([]);
      setCurrentCreativeId(0);
      setCurrentQuantity(0);
      setIsSpecialDay(false);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-110 font-sans max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> Schedule Creative Work
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Date and Client Section */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Selected Date"
                value={selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''}
                readOnly
              />

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Users size={14} className="text-slate-400" />
                  Client
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Creative Items Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Palette size={14} className="text-slate-400" />
                Creative Items
              </label>

              {/* Add Creative Item Form */}
              <div className="flex gap-2">
                <select
                  value={currentCreativeId}
                  onChange={(e) => setCurrentCreativeId(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>Select Creative Template</option>
                  {calendarWorkCreatives.map((creative) => (
                    <option key={creative.id} value={creative.id}>
                      {creative.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={currentQuantity || ''}
                  onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  placeholder="Qty"
                  min="1"
                  className="w-20"
                />
                <Button
                  onClick={addCreativeItem}
                  disabled={currentCreativeId === 0 || currentQuantity <= 0}
                  size="sm"
                  className="px-3"
                >
                  +
                </Button>
              </div>

              {/* Selected Creative Items Badges */}
              {selectedCreativeItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCreativeItems.map((item) => {
                    const creative = calendarWorkCreatives.find(c => c.id === item.id);
                    return (
                      <div key={item.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        <span>{creative?.name || 'Unknown'}:{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => removeCreativeItem(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Work Description Section - Hidden for DM Executive */}
            {!isDMExecutive && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Work Description</label>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Provide an overview of the creative work to be completed..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-20 resize-none"
                />
                <p className="text-[10px] text-slate-400">Brief summary of the project scope and objectives</p>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or special instructions..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-16 resize-none"
              />
              <p className="text-[10px] text-slate-400">Any additional information or special requirements</p>
            </div>

            {/* Special Day Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isSpecialDay"
                checked={isSpecialDay}
                onChange={(e) => setIsSpecialDay(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="isSpecialDay" className="text-sm font-medium text-slate-700">
                Mark as Special Day
              </label>
            </div>

            {/* File Upload Section - Hidden for DM Executive */}
            {!isDMExecutive && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Upload size={14} className="text-slate-400" />
                  Supporting Files
                </label>
                <input
                  type="file"
                  onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-l file:border-0 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
                <p className="text-[10px] text-slate-400">Upload reference materials, briefs, or assets (PDF, DOC, DOCX, JPG, PNG)</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 pt-2">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={clientId === 0}
              className="flex-1"
            >
              Schedule Work
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DatePopupModal;