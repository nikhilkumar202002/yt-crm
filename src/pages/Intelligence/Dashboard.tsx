import React from 'react';
import { useAppSelector } from '../../store/store';

const Dashboard = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-gray-500">Role: <span className="font-semibold">{roleName}</span></p>
      </header>

      {/* Grid for Dashboard Cards [cite: 59, 61] */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Active Leads</h3>
          <p className="text-2xl font-bold mt-2">124</p> {/* cite: 60 */}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">ROI (Avg)</h3>
          <p className="text-2xl font-bold mt-2">4.2x</p> {/* cite: 61 */}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Campaigns Running</h3>
          <p className="text-2xl font-bold mt-2">12</p> {/* cite: 51 */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;