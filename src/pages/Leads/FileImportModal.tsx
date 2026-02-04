import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, FileSpreadsheet, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface FileImportModalProps {
  onImport: (file: File) => void;
  isLoading?: boolean;
}

export const FileImportModal = ({ onImport, isLoading }: FileImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      // Updated: Now accepts .xlsx, .csv, and .xml
      if (['xlsx', 'csv', 'xml'].includes(extension || '')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a valid .xlsx, .csv, or .xml file.');
      }
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="sm">
          <Upload size={14} /> Import Leads
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Import Lead Data
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              file ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .csv, .xml"
              onChange={handleFileChange} 
            />
            
            {file ? (
              <>
                <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-700">{file.name}</p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Excel File Ready</p>
              </>
            ) : (
              <>
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <FileSpreadsheet size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-700">Click to upload .xlsx file</p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Supports XLSX, CSV and XML</p>
              </>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Dialog.Close asChild>
              <Button variant="ghost" className="flex-1">Cancel</Button>
            </Dialog.Close>
            <Button 
              variant="primary" 
              className="flex-1" 
              disabled={!file || isLoading}
              isLoading={isLoading}
              onClick={() => file && onImport(file)}
            >
              Confirm Import
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};