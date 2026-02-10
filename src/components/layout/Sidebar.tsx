import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Rocket, Layers, 
  Palette, FolderOpen, Zap, PieChart, CreditCard, 
  ShieldCheck, X, Settings, ChevronDown, ChevronRight,
  FileText, Briefcase, Calendar, Clipboard
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

  // Updated iconMap to match the new "Onboarded Clients" title
  const iconMap: Record<string, JSX.Element> = {
    'Dashboard': <LayoutDashboard size={16} />,
    'Calendar': <Calendar size={16} />,
    'Worksheet': <Clipboard size={16} />,
    'Leads & Pipeline': <Users size={16} />, 
    'Strategy & Pitch': <Rocket size={16} />, 
    'Proposal': <FileText size={16} />,
    'Onboarded Clients': <Briefcase size={16} />, // Renamed key to match menu.ts
    'Campaign Setup': <Layers size={16} />, 
    'Creative Workflow': <Palette size={16} />, 
    'Asset Hub': <FolderOpen size={16} />, 
    'Ad Operations': <Zap size={16} />, 
    'Intelligence': <PieChart size={16} />, 
    'Finance & Billing': <CreditCard size={16} />, 
    'Employees': <ShieldCheck size={16} />,
    'Settings': <Settings size={16} />,
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
      <div 
        className={`fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed left-0 top-0 h-screen bg-white z-[70] font-sans border-r border-slate-200 transition-transform duration-300 ease-in-out w-56 flex flex-col 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-blue-600 rounded flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-xs italic">YT</span>
            </div>
            <h1 className="text-slate-900 text-sm font-bold tracking-tight uppercase">CRM</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X size={18} />
          </button>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Workflow</p>
            <div className="space-y-2">
              {filteredMenu.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isActive = location.pathname.startsWith(item.path);
                const isExpanded = expandedMenu === item.title;

                if (hasSubmenu) {
                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md transition-all ${
                          isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{iconMap[item.title]}</span>
                          <span className="text-xs font-semibold tracking-tight">{item.title}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      {isExpanded && (
                        <div className="ml-6 mt-1 border-l border-slate-100 space-y-1">
                          {item.submenu?.map((sub: any) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`flex items-center px-4 py-2 text-[11px] font-medium transition-colors ${
                                location.pathname === sub.path ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                      location.pathname === item.path 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={location.pathname === item.path ? 'text-white' : 'text-slate-400'}>{iconMap[item.title]}</span>
                    <span className="text-xs font-semibold tracking-tight">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Security Status - Bottom */}
        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50/80 rounded-lg p-2.5 flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Security</p>
              <p className="text-[10px] text-slate-700 font-bold mt-1 leading-none truncate">Encrypted</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;