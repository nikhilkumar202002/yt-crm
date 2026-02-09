import { 
  Bell, ChevronDown, User, LogOut, Settings, 
  Menu, Search, Plus, Calendar, Globe, 
  Command, ExternalLink
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 font-sans">
      {/* Left: Search & Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-all"
        >
          <Menu size={18} />
        </button>

        {/* Global CRM Search */}
        <div className="hidden md:flex items-center relative w-full max-w-sm group">
          <Search className="absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search leads, clients or invoices..." 
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] font-medium focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400">
            <Command size={8} /> K
          </div>
        </div>
      </div>
      
      {/* Right: CRM Tools & Profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        
        {/* Quick Action Button */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all shadow-sm shadow-blue-200">
          <Plus size={12} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-wider">New Lead</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* System Utilities */}
        <div className="flex items-center gap-1">
          <Link to="/calendar">
            <button title="Calendar" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
              <Calendar size={15} />
            </button>
          </Link>
          
          <button title="Public Site" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
            <Globe size={15} />
          </button>

          <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
            <Bell size={15} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 border-2 border-white rounded-full" />
          </button>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2.5 group outline-none pl-2 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                  {user?.name}
                </p>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1 opacity-80 leading-none">
                  {roleName}
                </p>
              </div>
              
              <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <ChevronDown size={12} className="text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[180px] bg-white rounded-lg p-1.5 shadow-xl border border-slate-200 mt-2 animate-in fade-in zoom-in-95 duration-150"
              sideOffset={8}
              align="end"
            >
              <div className="px-3 py-2 mb-1 border-b border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
              </div>
              
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-slate-600 font-semibold rounded-md hover:bg-blue-50 hover:text-blue-700 outline-none cursor-pointer transition-colors">
                <User size={14} />
                My Profile
              </DropdownMenu.Item>
              
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-slate-600 font-semibold rounded-md hover:bg-blue-50 hover:text-blue-700 outline-none cursor-pointer transition-colors">
                <ExternalLink size={14} />
                Support Portal
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-[1px] bg-slate-100 my-1" />
              
              <DropdownMenu.Item 
                onClick={() => dispatch(logout())}
                className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-red-500 font-bold rounded-md hover:bg-red-50 outline-none cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

export default Header;