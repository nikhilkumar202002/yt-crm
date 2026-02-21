﻿import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import WorksheetCreativePage from './WorksheetCreativePage';
import WorksheetContentPage from './WorksheetContentPage';
import WorksheetDMPage from './WorksheetDMPage';
import WorksheetManagerPage from './WorksheetManagerPage';
import AllWorksheetPage from './AllWorksheetPage';
import WorksheetDefaultPage from './WorksheetDefaultPage';
import { getUsersList } from '../../api/services/authService';
import { POSITION_PERMISSIONS } from '../../config/positionPermissions';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  group_id: string;
  position_id: string;
  role_name: string;
  group_name: string;
  position_name: string;
}

const WorksheetPage = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const [currentUserGroup, setCurrentUserGroup] = useState<string>('');
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersList();
        const usersData = response.data?.data || [];
        // Set current user group and position
        const currentUser = user?.id ? usersData.find((u: User) => u.id === user.id) : null;
        setCurrentUserGroup(currentUser?.group_name || '');
        setCurrentUserPosition(currentUser?.position_name || '');
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);

  // Determine which component to render based on user group
  const renderWorksheetComponent = () => {
    const groupLower = currentUserGroup.toLowerCase().trim();
    const positionLower = currentUserPosition.toLowerCase().trim();

    // Admin role
    if (roleName?.toUpperCase() === 'ADMIN') {
      return <AllWorksheetPage />;
    }

    // Special case: heads in creative groups should see creative page, not manager page
    const creativeGroups = ['creative designers', 'creative team lead', 'graphics department', 'graphics'];
    if (positionLower === 'head' && creativeGroups.includes(groupLower)) {
      return <WorksheetCreativePage />;
    }

    // Manager roles (can approve) - check before group-based routing
    const canApprove = (() => {
      // Staff role should not have approval permissions
      if (roleName === 'staff') return false;
      const permissions = (POSITION_PERMISSIONS as any)[positionLower] || (POSITION_PERMISSIONS as any)[currentUserPosition];
      return permissions?.canApprove || false;
    })();

    if (canApprove) {
      return <WorksheetManagerPage />;
    }

    // Content roles - prioritize group over approval permissions
    const contentGroups = ['content creator', 'content'];
    if (contentGroups.includes(groupLower)) {
      return <WorksheetContentPage />;
    }

    // Creative roles: Creative Designers, Creative Team Lead, Graphics Department, Graphics
    if (creativeGroups.includes(groupLower)) {
      return <WorksheetCreativePage />;
    }

    // DM roles: DM Executive
    const dmGroups = ['digital marketing', 'dm', 'dm executive'];
    if (roleName?.toLowerCase() === 'dm executive' || dmGroups.includes(groupLower)) {
      return <WorksheetDMPage />;
    }

    // Default for all other roles
    return <WorksheetDefaultPage />;
  };

  return renderWorksheetComponent();
};

export default WorksheetPage;
