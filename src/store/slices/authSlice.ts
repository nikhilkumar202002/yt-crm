import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
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
    setLoginData: (state, action: PayloadAction<{ user: User; token: string; role_name: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roleName = action.payload.role_name;
      state.isAuthenticated = true;

      // Persistence for session [cite: 48]
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role_name', action.payload.role_name);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
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