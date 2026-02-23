import React, { useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { setLoginData } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/services/authService';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    console.log('=== LOGIN STARTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    try {
      const data = await loginUser({ email, password });
      console.log('Login response:', data);
      console.log('User object:', data.user);

      // Extract user permissions from login response
      // The permissions are already returned in the user object from login API
      const permissions = data.user.permissions || [];
      console.log('User permissions extracted from login response:', permissions);
      console.log('Total permissions assigned to user:', permissions.length);

      // Update user object with permissions
      const userWithPermissions = {
        ...data.user,
        role_permissions: permissions, // Store in role_permissions key that authSlice expects
        permissions: permissions // Also store in permissions for compatibility
      };

      console.log('Final user object with permissions:', userWithPermissions);

      dispatch(setLoginData({
        user: userWithPermissions,
        token: data.token,
        rememberMe
      }));

      console.log('=== LOGIN SUCCESSFUL - NAVIGATING TO DASHBOARD ===');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error("=== LOGIN ERROR ===", error);
      let message = 'Login failed. Please try again.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
      console.log('=== LOGIN PROCESS COMPLETED ===');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-none shadow-xl border border-slate-200 p-8 sm:p-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-none mb-6">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2 font-medium">Sign in to your YT CRM account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-none text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-900 text-sm font-medium placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Password
              </label>
              <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-900 text-sm font-medium placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-1">
            <input 
              type="checkbox" 
              id="rem" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-none border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            />
            <label htmlFor="rem" className="text-sm font-medium text-slate-600 cursor-pointer select-none">Keep me signed in</label>
          </div>

          <button 
            disabled={loading}
            className="w-full flex items-center justify-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest rounded-none shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In
                <ChevronRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-10 text-center pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            YT CRM Enterprise • v2.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;