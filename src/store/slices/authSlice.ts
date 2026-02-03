import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: string | number;
  role_name: string; // Added to interface for better typing
}

interface AuthState {
  user: User | null;
  token: string | null;
  roleName: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  roleName: localStorage.getItem('role_name'),
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
      // Extract role_name from the user object
      state.roleName = user.role_name; 
      state.isAuthenticated = true;

      // Persistence for session
      localStorage.setItem('token', token);
      localStorage.setItem('role_name', user.role_name); 
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.roleName = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;
export default authSlice.reducer;