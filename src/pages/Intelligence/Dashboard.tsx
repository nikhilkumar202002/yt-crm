import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import { Download, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getUsersList } from '../../api/services/authService';
import AdminDashboard from './components/AdminDashboard';
import GraphicsDashboard from './components/GraphicsDashboard';
import ContentDashboard from './components/ContentDashboard';
import DMDashboard from './components/DMDashboard';
import SalesDashboard from './components/SalesDashboard';
import DepartmentDashboard from './components/DepartmentDashboard';

const Dashboard = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const [currentUserGroup, setCurrentUserGroup] = useState<string>('');
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUsersList();
        const usersData = response.data?.data || response.data || [];
        const currentUser = user?.id ? usersData.find((u: any) => u.id === user.id) : null;
        setCurrentUserGroup(currentUser?.group_name || '');
        setCurrentUserPosition(currentUser?.position_name || '');
      } catch (error) {
        console.error('Failed to fetch user details for dashboard:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  const isAdmin = roleName?.toLowerCase() === 'admin' || 
                  currentUserPosition.toLowerCase().includes('head') ||
                  currentUserGroup.toLowerCase().includes('management');

  const groupLower = currentUserGroup.toLowerCase().trim();
  const isDM = groupLower.includes('dm') || groupLower.includes('digital marketing');
  const isGraphics = groupLower.includes('graphics') || groupLower.includes('creative');
  const isContent = groupLower.includes('content');
  const isSales = (groupLower.includes('sales') || groupLower.includes('marketing')) && !isDM;

  if (isInitializing) return <div className="p-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Initializing Dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white">
              <span className="font-black text-[10px] italic">YT</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
              {isAdmin ? 'CRM — Master Dashboard' : `${currentUserGroup} Dashboard`}
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide flex items-center gap-2">
            User: <span className="font-bold text-slate-700">{user?.name}</span> 
            <span className="h-3 w-px bg-slate-200" /> 
            Department: <span className="text-blue-600 font-bold">{currentUserGroup || 'N/A'}</span>
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold">
              <Download size={14} className="mr-1.5" />
              Intelligence Report
            </Button>
            <Button variant="primary" size="sm" className="h-8 text-[11px] font-bold">
              <Filter size={14} className="mr-1.5" />
              Refresh Intelligence
            </Button>
          </div>
        )}
      </div>

      {isDM ? (
        <DMDashboard user={user} groupName={currentUserGroup} />
      ) : isGraphics ? (
        <GraphicsDashboard user={user} groupName={currentUserGroup} />
      ) : isContent ? (
        <ContentDashboard user={user} groupName={currentUserGroup} />
      ) : isSales ? (
        <SalesDashboard user={user} groupName={currentUserGroup} />
      ) : isAdmin ? (
        <AdminDashboard />
      ) : (
        <DepartmentDashboard user={user} groupName={currentUserGroup} />
      )}
    </div>
  );
};

export default Dashboard;