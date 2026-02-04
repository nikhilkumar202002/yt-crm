import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Rocket, Layers, 
  Palette, FolderOpen, Zap, PieChart, CreditCard, 
  ShieldCheck, X, Settings, ChevronDown, ChevronRight 
} from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { SIDEBAR_MENU } from '../../config/menu';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { roleName } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const currentRole = roleName?.toUpperCase() || '';

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
    'Employees': <ShieldCheck size={18} />,
    'Settings': <Settings size={18} />,
  };

const filteredMenu = SIDEBAR_MENU
    .filter(item => item.roles.includes(currentRole as any))
    .map(item => ({
      ...item,
      submenu: item.submenu?.filter(sub => sub.roles.includes(currentRole as any))
    }));

  const toggleExpand = (title: string) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 z-[70] font-sans border-r border-slate-800 transition-transform duration-300 ease-in-out w-64 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xl italic leading-none">YT</span>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">CRM</h1>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Workflow Stages
            </p>
            <div className="space-y-1">
              {filteredMenu.map((item) => {

                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isActive = location.pathname.startsWith(item.path);
                const isExpanded = expandedMenu === item.title;

              if (hasSubmenu) {
                  return (
                    <div key={item.title} className="space-y-1">
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-blue-500' : 'text-slate-500'}>
                            {iconMap[item.title]}
                          </span>
                          <span className="text-sm font-semibold">{item.title}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-9 space-y-1 animate-in slide-in-from-top-1 duration-200">
                          {item.submenu?.map((sub) => {
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center py-2 text-xs font-medium transition-all ${
                                  isSubActive ? 'text-blue-500 font-bold' : 'text-slate-500 hover:text-slate-200'
                                }`}
                              >
                                {sub.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <span className={location.pathname === item.path ? 'text-white' : 'text-slate-500'}>
                      {iconMap[item.title]}
                    </span>
                    <span className="text-sm font-semibold">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security</p>
                <p className="text-xs text-slate-200 font-bold mt-1 leading-none">Secure Access Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;