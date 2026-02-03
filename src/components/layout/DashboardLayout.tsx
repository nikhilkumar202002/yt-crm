import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="p-8">
          <Outlet /> {/* This renders the Dashboard or other pages */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;