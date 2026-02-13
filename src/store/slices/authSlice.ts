import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setSecureCookie, getSecureCookie, clearSecureCookies } from '../../utils/secureStorage';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: string | number;
  role_name: string; // Added to interface for better typing
  designation_name?: string; // Position/designation of the user
  designation_id?: string | number; // Designation ID from API
  position_id?: string | number; // Position ID from API
  group_name?: string; // User's group name from API
  permissions?: {
    viewAllLeads: boolean;
    viewAssignedLeads: boolean;
    assignLeads: boolean;
    uploadLeads: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  roleName: string | null;
  position: string | null; // User's position for permission resolution
  group: string | null; // User's group name
  designation_name: string | null; // User's designation name
  permissions: {
    viewAllLeads: boolean;
    viewAssignedLeads: boolean;
    assignLeads: boolean;
    uploadLeads: boolean;
  } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: (() => {
    const userData = getSecureCookie('user');
    return userData ? JSON.parse(userData) : null;
  })(),
  token: getSecureCookie('token'),
  roleName: getSecureCookie('role_name'),
  position: getSecureCookie('position'),
  group: getSecureCookie('group'),
  designation_name: getSecureCookie('designation_name'),
  permissions: (() => {
    const userData = getSecureCookie('user');
    const user = userData ? JSON.parse(userData) : null;
    return user?.permissions || null;
  })(),
  isAuthenticated: !!getSecureCookie('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Corrected to handle the nested user structure from your API
  setLoginData: (state, action: PayloadAction<{ user: User; token: string }>) => {
  const { user, token } = action.payload;
  state.user = user;
  state.token = token;
  // Use the exact string 'Admin' as returned by your API response
  state.roleName = user.role_name;
  state.position = String(user.designation_id) || '1'; // Use designation_id as position, default to '1' (Member)
  state.group = user.group_name || null; // User's group name from API
  state.designation_name = user.designation_name || null; // User's designation name
  state.permissions = user.permissions || null;
  state.isAuthenticated = true;

  setSecureCookie('token', token);
  setSecureCookie('user', JSON.stringify(user));
  setSecureCookie('role_name', user.role_name);
  setSecureCookie('position', String(user.designation_id) || '1');
  setSecureCookie('group', user.group_name || '');
  setSecureCookie('designation_name', user.designation_name || '');
  localStorage.setItem('user', JSON.stringify(user));
},
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roleName = null;
      state.position = null;
      state.group = null;
      state.designation_name = null;
      state.permissions = null;
      state.isAuthenticated = false;
      clearSecureCookies();
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;
export default authSlice.reducer;