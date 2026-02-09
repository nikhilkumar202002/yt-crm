import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, Users, Hash, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { getClients } from '../../../api/services/microService';

interface DatePopupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  selectedClient?: number | null;
  onSave: (data: { client_id: number; date: string; no_of_creatives: number; no_of_videos: number; content_file?: File | null }) => void;
  existingData?: { client_id: number; no_of_creatives: number; no_of_videos: number; content_file?: File | null };
}

const DatePopupModal: React.FC<DatePopupModalProps> = ({
  isOpen,
  onOpenChange,
  selectedDate,
  selectedClient,
  onSave,
  existingData,
}) => {
  const [clientId, setClientId] = useState<number>(0);
  const [noOfCreatives, setNoOfCreatives] = useState<number>(0);
  const [noOfVideos, setNoOfVideos] = useState<number>(0);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClients();
        setClients(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch clients', error);
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (isOpen && existingData) {
      setClientId(existingData.client_id);
      setNoOfCreatives(existingData.no_of_creatives);
      setNoOfVideos(existingData.no_of_videos);
      // content_file is string, but for edit, perhaps not set
    } else if (isOpen) {
      setClientId(selectedClient || 0);
      setNoOfCreatives(0);
      setNoOfVideos(0);
      setContentFile(null);
    }
  }, [isOpen, existingData, selectedClient]);

  console.log('DatePopupModal: selectedDate =', selectedDate);

  const handleSave = () => {
    if (selectedDate && clientId > 0) {
      // Construct date string using date-fns for consistency
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      const payload = {
        client_id: clientId,
        date: dateString, // YYYY-MM-DD
        no_of_creatives: noOfCreatives,
        no_of_videos: noOfVideos,
        content_file: contentFile,
      };

      console.log('DatePopupModal: Saving with payload:', payload);
      onSave(payload);
      setClientId(0);
      setNoOfCreatives(0);
      setNoOfVideos(0);
      setContentFile(null);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                <Calendar className="inline mr-2" size={20} />
                Schedule Work for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select Date'}
                {selectedClient && clients.find(c => c.id === selectedClient) && (
                  <span className="block text-sm font-normal text-slate-600 mt-1">
                    Client: {clients.find(c => c.id === selectedClient)?.name}
                  </span>
                )}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 mt-1">
                Add creative work details for this date
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Calendar className="inline mr-1" size={16} />
                Selected Date
              </label>
              <input
                type="text"
                value={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                readOnly
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Users className="inline mr-1" size={16} />
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Hash className="inline mr-1" size={16} />
                Number of Creatives
              </label>
              <input
                type="number"
                value={noOfCreatives}
                onChange={(e) => setNoOfCreatives(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Hash className="inline mr-1" size={16} />
                Number of Videos
              </label>
              <input
                type="number"
                value={noOfVideos}
                onChange={(e) => setNoOfVideos(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Upload className="inline mr-1" size={16} />
                Content File
              </label>
              <input
                type="file"
                onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DatePopupModal;