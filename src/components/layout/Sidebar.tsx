import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Rocket, Layers, 
  Palette, FolderOpen, Zap, PieChart, CreditCard, ShieldCheck 
} from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { SIDEBAR_MENU } from '../../config/menu';

const Sidebar = () => {
  const { roleName } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const currentRole = roleName?.toUpperCase() || '';

  // Icon mapping for high-fidelity navigation 
  const iconMap: Record<string, any> = {
    'Dashboard': <LayoutDashboard size={18} />,
    'Leads & Pipeline': <Users size={18} />, 
    'Strategy & Pitch': <Rocket size={18} />, 
    'Campaign Setup': <Layers size={18} />, 
    'Creative Workflow': <Palette size={18} />, 
    'Asset Hub': <FolderOpen size={18} />, 
    'Ad Operations': <Zap size={18} />, 
    'Intelligence': <PieChart size={18} />, 
    'Finance & Billing': <CreditCard size={18} />, 
  };

  const filteredMenu = SIDEBAR_MENU.filter(item => 
    item.roles.includes(currentRole as any)
  );

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col fixed left-0 top-0 z-20 font-sans border-r border-slate-800">
      {/* Brand Identity */}
      <div className="p-8 flex items-center gap-3">
        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <span className="font-black text-xl italic">YT</span>
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight">CRM</h1>
      </div>
      
      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
        <div>
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
            Workflow Stages 
          </p>
          <div className="space-y-1">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                    {iconMap[item.title]}
                  </span>
                  <span className="text-sm font-semibold">
                    {item.title}
                  </span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 bg-white rounded-full shadow-glow" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Security Status Footer  */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status</p>
              <p className="text-xs text-slate-200 font-bold mt-1">Secure Access Active [cite: 10]</p>
            </div>
          </div>
          <div className="mt-3 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;