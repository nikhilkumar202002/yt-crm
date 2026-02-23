// src/components/layout/Sidebar.tsx
import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Rocket, Layers, 
  Palette, FolderOpen, Zap, PieChart, CreditCard, 
  ShieldCheck, X, Settings, ChevronDown, ChevronRight,
  FileText, Briefcase, Calendar, Clipboard, UserCheck
} from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { hasMenuAccess, MAIN_MENU } from '../../config/menu';
import { resolvePermissions } from '../../config/permissionResolver';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Icon mapping moved outside the component so it isn't recreated on every render
const iconMap: Record<string, React.JSX.Element> = {
  'Dashboard': <LayoutDashboard size={16} />,
  'All Leads': <Users size={16} />,
  'Assigned Leads': <UserCheck size={16} />,
  'Calendar': <Calendar size={16} />,
  'Worksheet': <Clipboard size={16} />,
  'Leads & Pipeline': <Users size={16} />, 
  'Strategy & Pitch': <Rocket size={16} />, 
  'Proposal': <FileText size={16} />,
  'Onboarded Clients': <Briefcase size={16} />,
  'Campaign Setup': <Layers size={16} />, 
  'Creative Workflow': <Palette size={16} />, 
  'Asset Hub': <FolderOpen size={16} />, 
  'Ad Operations': <Zap size={16} />, 
  'Intelligence': <PieChart size={16} />, 
  'Finance & Billing': <CreditCard size={16} />, 
  'Employees': <ShieldCheck size={16} />,
  'Settings': <Settings size={16} />,
};

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  console.log('🖥️ SIDEBAR COMPONENT RENDERED');
  const { permissions, roleName } = useAppSelector((state) => state.auth);
  console.log('Sidebar - Redux state permissions:', permissions);
  console.log('Sidebar - Redux state roleName:', roleName);
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Resolve permissions based on role and database permissions
  const userPermissions = useMemo(() => {
    console.log('Sidebar - About to resolve permissions for role:', roleName, 'with permissions:', permissions);
    const resolved = resolvePermissions({
      role: roleName || '',
      permissions: permissions as any[]
    });
    console.log('Sidebar - Resolved permissions:', resolved);
    return resolved;
  }, [roleName, permissions]);

  // Filter menu based on resolved permissions
  const filteredMenu = useMemo(() => {
    console.log('🎛️ Filtering menu with resolved permissions:', userPermissions);
    const result = MAIN_MENU
      .filter(item => {
        const hasAccess = hasMenuAccess(userPermissions, item.requiredPermissions);
        console.log(`Menu item '${item.title}' access: ${hasAccess}`);
        return hasAccess;
      })
      .map(item => ({
        ...item,
        submenu: item.submenu?.filter(sub => {
          const hasSubAccess = hasMenuAccess(userPermissions, sub.requiredPermissions);
          console.log(`Submenu item '${sub.title}' access: ${hasSubAccess}`);
          return hasSubAccess;
        })
      }))
      .filter(item => {
        const hasDefinedSubmenu = item.submenu !== undefined;
        const hasActiveSubmenu = hasDefinedSubmenu && (item.submenu?.length || 0) > 0;

        // Hide parent menus entirely if they have submenu array but all items filtered out
        if (hasDefinedSubmenu && !hasActiveSubmenu) {
          return false;
        }
        return true;
      });

    console.log('📋 Final filtered menu:', result);
    return result;
  }, [userPermissions]);

  // Debug logging for menu filtering by role
  console.log('=== MENU DEBUG FOR ROLE:', roleName || 'No Role');
  console.log('Filtered Menu Items:', filteredMenu.map(item => ({
    title: item.title,
    path: item.path,
    hasSubmenu: item.submenu ? item.submenu.length > 0 : false,
    submenuCount: item.submenu?.length || 0
  })));
  console.log('=== END MENU DEBUG ===');

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
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-blue-600 rounded-none flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-xs italic">YT</span>
            </div>
            <h1 className="text-slate-900 text-sm font-bold tracking-tight uppercase">CRM</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-0 py-5 space-y-5">
          <div>
            <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Workflow</p>
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
                        className={`w-full flex items-center justify-between gap-2.5 px-6 py-2.5 rounded-none transition-all ${
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
                        <div className="mt-1 space-y-1">
                          {item.submenu?.map((sub: any) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`flex items-center pl-14 pr-6 py-2 text-[11px] font-medium transition-colors ${
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
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-none transition-all ${
                      location.pathname === item.path 
                        ? 'bg-blue-600 text-white' 
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

        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50/80 rounded-none p-2.5 flex items-center gap-3">
            <div className="h-6 w-6 rounded-none bg-blue-100 flex items-center justify-center text-blue-600">
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