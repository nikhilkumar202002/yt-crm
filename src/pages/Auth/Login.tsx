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
      
      // CRITICAL: Save token to localStorage so the API client interceptor can find it
      localStorage.setItem('token', data.token);
      
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
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* --- Left Side: Branding / Marketing (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 items-center justify-center p-12 text-white relative">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="max-w-lg relative z-10">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-2xl w-fit mb-8 shadow-2xl">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tighter leading-tight">
            YT CRM <span className="text-blue-200">v2.0</span>
          </h1>
          <p className="text-blue-100 text-xl leading-relaxed font-medium mb-12">
            The next generation of lead management. Track execution, intelligence, and growth in one seamless interface.
          </p>
          
          {/* Trust Badges / Stats */}
          <div className="grid grid-cols-2 gap-6 pt-12 border-t border-white/10">
            <div>
              <p className="text-3xl font-bold">99.9%</p>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold">256-bit</p>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Login Form (Full width on Mobile) --- */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-10 duration-700">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Portal Login</h2>
            <p className="text-slate-500 font-medium">Please enter your specialized credentials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="admin@yellowtooths.in" 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Secure Password
                </label>
                <button type="button" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="rem" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="rem" className="text-sm font-bold text-slate-600 cursor-pointer">Stay signed in on this device</label>
            </div>

            <button 
              disabled={loading}
              className="w-full group relative flex items-center justify-center h-14 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-[0.98] disabled:bg-slate-400"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Enter Dashboard
                  <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center border-t border-slate-100 pt-8">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
              Security Protocol Enabled • Built by Yellowtooths
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;