import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UserCheck, Users } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { assignLeads, getEmployeesForAssignment } from '../../../api/services/microService';
import { useAppSelector } from '../../../store/store';

interface AssignLeadsModalProps {
  selectedLeadIds: number[];
  onSuccess: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignLeadsModal = ({ selectedLeadIds, onSuccess, isOpen, onOpenChange }: AssignLeadsModalProps) => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const result = await getEmployeesForAssignment();
        // Accessing the nested array from paginated directory
        const allStaff = result?.data || [];
        
        if (roleName?.toUpperCase() === 'ADMIN') {
          setStaff(allStaff);
        } else {
          setStaff(allStaff.filter((s: any) => s.department_name === (user as any)?.department_name));
        }
      } catch (error) {
        console.error("Failed to fetch staff", error);
      }
    };
    if (isOpen) fetchStaff();
  }, [isOpen, roleName, (user as any)?.department_name]);

  const handleAssign = async () => {
    if (!selectedStaffId) return;
    setLoading(true);
    try {
      await assignLeads({
        lead_ids: selectedLeadIds,
        user_id: Number(selectedStaffId),
        status: 'assigned'
      }); //
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-none p-6 shadow-2xl z-[110] font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" /> Assign {selectedLeadIds.length} Leads
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-600"><X size={18} /></Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Select Staff Member</label>
              <select 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="">Choose an employee...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department_name || 'No Dept'})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 p-3 rounded-none border border-blue-100 flex items-start gap-3">
              <Users size={16} className="text-blue-600 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                You are about to transfer ownership of these leads to the selected staff member. This action will be logged.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <Dialog.Close asChild><Button variant="ghost" className="flex-1">Cancel</Button></Dialog.Close>
              <Button 
                variant="primary" 
                className="flex-1" 
                disabled={!selectedStaffId} 
                isLoading={loading}
                onClick={handleAssign}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};