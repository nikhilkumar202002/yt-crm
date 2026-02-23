import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  permissions?: any[] | Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  roleName: string | null;
  position: string | null; // User's position for permission resolution
  group: string | null; // User's group name
  designation_name: string | null; // User's designation name
  permissions: any[] | Record<string, boolean> | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: (() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  })(),
  token: localStorage.getItem('token'),
  roleName: localStorage.getItem('role_name'),
  position: localStorage.getItem('position'),
  group: localStorage.getItem('group'),
  designation_name: localStorage.getItem('designation_name'),
  permissions: (() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    return user?.permissions || null;
  })(),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Corrected to handle the nested user structure from your API
  setLoginData: (state, action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>) => {
  const { user, token, rememberMe = false } = action.payload;
  state.user = user;
  state.token = token;
  // Use the exact string 'Admin' as returned by your API response
  state.roleName = user.role_name;
  state.position = String(user.designation_id) || '1'; // Use designation_id as position, default to '1' (Member)
  state.group = user.group_name || null; // User's group name from API
  state.designation_name = user.designation_name || null; // User's designation name
  state.permissions = user.permissions || null;
  state.isAuthenticated = true;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('role_name', user.role_name);
  localStorage.setItem('position', String(user.designation_id) || '1');
  localStorage.setItem('group', user.group_name || '');
  localStorage.setItem('designation_name', user.designation_name || '');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role_name');
      localStorage.removeItem('position');
      localStorage.removeItem('group');
      localStorage.removeItem('designation_name');
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;
export default authSlice.reducer;