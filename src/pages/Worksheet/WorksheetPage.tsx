﻿﻿﻿import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import WorksheetCreativePage from './WorksheetCreativePage';
import WorksheetContentPage from './WorksheetContentPage';
import WorksheetDMPage from './WorksheetDMPage';
import WorksheetDefaultPage from './WorksheetDefaultPage';
import { getUsersList } from '../../api/services/authService';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersList();
        const usersData = response.data?.data || [];
        // Set current user group
        const currentUser = user?.id ? usersData.find((u: User) => u.id === user.id) : null;
        setCurrentUserGroup(currentUser?.group_name || '');
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
    // Content roles
    const contentGroups = ['Content Creator', 'Content'];
    if (contentGroups.includes(currentUserGroup)) {
      return <WorksheetContentPage />;
    }

    // Creative roles: Creative Designers, Creative Team Lead, Graphics Department
    const creativeGroups = ['Creative Designers', 'Creative Team Lead', 'Graphics Department'];
    if (creativeGroups.includes(currentUserGroup)) {
      return <WorksheetCreativePage />;
    }

    // DM roles: DM Executive
    const dmGroups = ['Digital Marketing', 'DM', 'DM Executive'];
    if (roleName?.toLowerCase() === 'dm executive' || dmGroups.includes(currentUserGroup)) {
      return <WorksheetDMPage />;
    }

    // Default for all other roles
    return <WorksheetDefaultPage />;
  };

  return renderWorksheetComponent();
};

export default WorksheetPage;
