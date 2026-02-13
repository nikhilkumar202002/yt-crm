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
    <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
      {/* --- Left Side: Branding / Marketing (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 items-center justify-center p-16 text-white relative">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-400 rounded-full blur-3xl opacity-10" />
        </div>

        <div className="max-w-xl relative z-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-fit mb-12 shadow-xl">
            <ShieldCheck size={44} className="text-white" />
          </div>
          <h1 className="text-7xl font-bold mb-8 tracking-tight leading-tight text-white">
            YT CRM <span className="text-gray-300 font-light text-6xl">2.0</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed font-normal mb-16">
            Enterprise-grade CRM platform for comprehensive lead management, execution tracking, and business intelligence.
          </p>
          
          {/* Trust Badges / Stats */}
          <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/10">
            <div>
              <p className="text-4xl font-bold text-white mb-2">99.9%</p>
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">Uptime SLA</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">Enterprise</p>
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">Security</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Login Form (Full width on Mobile) --- */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-10 duration-700">
          
          <div className="mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Login</h2>
            <p className="text-gray-600 text-lg font-normal">Sign in to your corporate account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-gray-700 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="w-full pl-14 pr-5 py-4 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-gray-800 text-base font-normal placeholder:text-gray-400 shadow-sm hover:border-gray-300"
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <button type="button" className="text-sm font-semibold text-blue-700 hover:text-blue-800 uppercase tracking-wider transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-700 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••••" 
                  className="w-full pl-14 pr-14 py-4 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-gray-800 text-base font-normal placeholder:text-gray-400 shadow-sm hover:border-gray-300"
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="rem" className="w-5 h-5 rounded border-gray-300 text-blue-700 focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="rem" className="text-base font-normal text-gray-700 cursor-pointer">Keep me signed in</label>
            </div>

            <button 
              disabled={loading}
              className="w-full group relative flex items-center justify-center h-16 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base uppercase tracking-wide rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Sign In
                  <ChevronRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              Enterprise Edition • Powered by Yellowtooths
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;