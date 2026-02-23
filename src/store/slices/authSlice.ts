import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: string | number;
  role_name: string; 
  designation_name?: string; 
  designation_id?: string | number; 
  position_id?: string | number; 
  group_name?: string; 
  permissions?: any[] | Record<string, boolean>;
  role_permissions?: any[]; // Added fallback just in case backend uses this key
}

interface AuthState {
  user: User | null;
  roleName: string | null;
  position: string | null; 
  group: string | null; 
  designation_name: string | null; 
  permissions: any[] | Record<string, boolean> | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: (() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  })(),
  roleName: localStorage.getItem('role_name'),
  position: localStorage.getItem('position'),
  group: localStorage.getItem('group'),
  designation_name: localStorage.getItem('designation_name'),
  permissions: (() => {
    // Look for explicit permissions first
    const storedPerms = localStorage.getItem('permissions');
    if (storedPerms) return JSON.parse(storedPerms);
    
    // Fallback to extracting from user object
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    return user?.role_permissions || user?.permissions || null;
  })(),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginData: (state, action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>) => {
      const { user, token } = action.payload;
      console.log('AuthSlice - setLoginData called with user:', user);
      console.log('AuthSlice - user permissions:', user.permissions);
      console.log('AuthSlice - user role_permissions:', user.role_permissions);
      
      state.user = user;
      
      state.roleName = user.role_name;
      state.position = String(user.designation_id) || '1';
      state.group = user.group_name || null;
      state.designation_name = user.designation_name || null;
      
      // FIX: Check multiple possible keys from the API response
      const extractedPermissions = user.role_permissions || user.permissions || null;
      console.log('AuthSlice - extracted permissions:', extractedPermissions);
      console.log('AuthSlice - setting state.permissions to:', extractedPermissions);
      state.permissions = extractedPermissions;
      
      state.isAuthenticated = true;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role_name', user.role_name);
      localStorage.setItem('position', String(user.designation_id) || '1');
      localStorage.setItem('group', user.group_name || '');
      localStorage.setItem('designation_name', user.designation_name || '');
      
      // FIX: Explicitly store permissions so they aren't lost on refresh
      if (extractedPermissions) {
        localStorage.setItem('permissions', JSON.stringify(extractedPermissions));
        console.log('AuthSlice - stored permissions in localStorage');
      }
    },
    logout: (state) => {
      state.user = null;
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
      localStorage.removeItem('permissions'); // Remove permissions on logout
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;
export default authSlice.reducer;