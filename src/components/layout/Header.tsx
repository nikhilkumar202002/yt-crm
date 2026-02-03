import { Bell, ChevronDown, User, LogOut, Settings, Menu } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, roleName } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 font-sans">
      {/* Left: Mobile Menu Toggle & Context */}
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Visible only on mobile/tablet */}
        <button 
  onClick={onMenuClick}
  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
  aria-label="Open Menu"
>
  <Menu size={24} strokeWidth={2.5} /> {/* Increased stroke for visibility */}
</button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block h-8 w-[2px] bg-blue-600 rounded-full" />
          <div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Dashboard</h2>
            <p className="hidden sm:block text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] leading-none mt-1">
              Performance & Intelligence
            </p>
          </div>
        </div>
      </div>
      
      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
          <Bell size={22} />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full group-hover:scale-110 transition-transform" />
        </button>

        <div className="hidden sm:block h-8 w-[1px] bg-gray-100" />

        {/* Profile Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 lg:gap-4 group outline-none">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">
                  {roleName}
                </p>
              </div>
              
              <div className="relative">
                <div className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                  {user?.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <ChevronDown size={16} className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="min-w-[220px] bg-white rounded-2xl p-2 shadow-2xl shadow-blue-900/10 border border-gray-100 mt-2 animate-in fade-in zoom-in duration-200"
              sideOffset={5}
            >
              <DropdownMenu.Label className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                My Account
              </DropdownMenu.Label>
              
              <DropdownMenu.Item className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-medium rounded-xl hover:bg-blue-50 hover:text-blue-600 outline-none cursor-pointer transition-colors">
                <User size={18} />
                Profile Settings
              </DropdownMenu.Item>
              
              <DropdownMenu.Item className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-medium rounded-xl hover:bg-blue-50 hover:text-blue-600 outline-none cursor-pointer transition-colors">
                <Settings size={18} />
                System Config
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-2" />
              
              <DropdownMenu.Item 
                onClick={() => dispatch(logout())}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 font-bold rounded-xl hover:bg-red-50 outline-none cursor-pointer transition-colors"
              >
                <LogOut size={18} />
                Logout Session
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

export default Header;