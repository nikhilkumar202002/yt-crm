import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: string | number;
  role_name: string; // Added to interface for better typing
  designation_name?: string; // Position/designation of the user
  designation_id?: string | number; // Designation ID from API
  position_id?: string | number; // Position ID from API
}

interface AuthState {
  user: User | null;
  token: string | null;
  roleName: string | null;
  position: string | null; // User's position for permission resolution
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  roleName: localStorage.getItem('role_name'),
  position: localStorage.getItem('position'),
  isAuthenticated: !!localStorage.getItem('token'),
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
  state.isAuthenticated = true;

  localStorage.setItem('token', token);
  localStorage.setItem('role_name', user.role_name); 
  localStorage.setItem('position', String(user.designation_id) || '1');
  localStorage.setItem('user', JSON.stringify(user));
},
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roleName = null;
      state.position = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;
export default authSlice.reducer;