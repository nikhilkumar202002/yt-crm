import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { BreakTracker } from '../common/BreakTracker';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Content Area - Adjusted ml-72 to match new sidebar width */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-300 relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 w-full flex-1">
          <Outlet />
        </main>

        {/* Break Tracker Component */}
        <BreakTracker />
      </div>
    </div>
  );
};

export default DashboardLayout;