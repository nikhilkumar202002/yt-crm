import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import { Download, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getUsersList } from '../../api/services/authService';
import { POSITION_PERMISSIONS } from '../../config/positionPermissions';
import AdminDashboard from './components/AdminDashboard';
import GraphicsDashboard from './components/GraphicsDashboard';
import ContentDashboard from './components/ContentDashboard';
import DMDashboard from './components/DMDashboard';
import SalesDashboard from './components/SalesDashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import ManagerDashboard from './components/ManagerDashboard';

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
        type UserLike = { id?: number; group_name?: string; position_name?: string; position_id?: number | string };
        const currentUser = user?.id ? (usersData as UserLike[]).find((u) => u.id === user.id) : null;
        setCurrentUserGroup(currentUser?.group_name || '');
        // Prefer position name, fallback to position id when name isn't available
        setCurrentUserPosition(String(currentUser?.position_name || currentUser?.position_id || ''));
      } catch (error) {
        console.error('Failed to fetch user details for dashboard:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  // Strict admin detection — only users with role 'ADMIN' are master admins
  const isAdmin = roleName?.toUpperCase() === 'ADMIN';

  // Determine manager by position permissions (canApprove) or name hints
  const positionKey = currentUserPosition.toLowerCase().trim();
  const perms = (POSITION_PERMISSIONS as any)[positionKey] || (POSITION_PERMISSIONS as any)[currentUserPosition] || {};
  const isManager = !isAdmin && (perms?.canApprove === true ||
    positionKey.includes('manager') || positionKey.includes('lead') || currentUserGroup.toLowerCase().includes('management'));

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
            <div className="h-5 w-5 bg-blue-600 rounded-none flex items-center justify-center text-white">
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

      {isAdmin ? (
        <AdminDashboard />
      ) : isManager ? (
        <ManagerDashboard />
      ) : isDM ? (
        <DMDashboard user={user} groupName={currentUserGroup} />
      ) : isGraphics ? (
        <GraphicsDashboard user={user} groupName={currentUserGroup} />
      ) : isContent ? (
        <ContentDashboard user={user} groupName={currentUserGroup} />
      ) : isSales ? (
        <SalesDashboard user={user} groupName={currentUserGroup} />
      ) : (
        <DepartmentDashboard user={user} groupName={currentUserGroup} />
      )}
    </div>
  );
};

export default Dashboard;