import React, { useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { setLoginData } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/services/authService';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      dispatch(setLoginData({
        user: data.user,
        token: data.token
      }));

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2 font-medium">Sign in to your YT CRM account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-900 text-sm font-medium placeholder:text-slate-400"
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
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none transition-all text-slate-900 text-sm font-medium placeholder:text-slate-400"
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
            <input type="checkbox" id="rem" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="rem" className="text-sm font-medium text-slate-600 cursor-pointer select-none">Keep me signed in</label>
          </div>

          <button 
            disabled={loading}
            className="w-full flex items-center justify-center h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
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