import React from 'react';
import { useAppSelector } from '../../store/store';
import { 
  Users, Target, Rocket, Activity, 
  TrendingUp, Wallet, CheckCircle, Clock, 
  Layers, ShieldCheck, RefreshCcw 
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

const Dashboard = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);

  // 1. Primary Intelligence Keys (KPIs)
  const kpiStats = [
    { label: 'Total Leads', value: '1,284', icon: <Users size={16} />, trend: '+12%', color: 'border-blue-500' },
    { label: 'Conversion Rate', value: '24.2%', icon: <Target size={16} />, trend: '+3.4%', color: 'border-green-500' },
    { label: 'Active Campaigns', value: '18', icon: <Rocket size={16} />, trend: 'Stable', color: 'border-purple-500' },
    { label: 'System ROI', value: '4.8x', icon: <TrendingUp size={16} />, trend: '+0.5%', color: 'border-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Admin System Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            System Overseer: {user?.name} — <span className="text-blue-600 font-bold">{roleName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Export Intelligence</Button>
          <Button variant="primary" size="sm">Update Strategy</Button>
        </div>
      </div>

      {/* KPI Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat, i) => (
          <StatCard 
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            colorClass={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Campaign Execution Keys */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity size={14} className="text-blue-600" />
              Campaign Execution & Ad Publishing
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                <div className="h-1 w-1 rounded-full bg-green-600 animate-pulse" /> Live
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {/* Visualizer Placeholder */}
            <div className="h-40 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-[10px] text-slate-400 font-medium italic">Performance Metrics Visualizer</p>
            </div>
            {/* Key Execution Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-bold text-slate-400 uppercase">CTR Avg</p>
                <p className="text-sm font-bold text-slate-800">3.2%</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Ad Spend</p>
                <p className="text-sm font-bold text-slate-800">$12.4k</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Leads/Day</p>
                <p className="text-sm font-bold text-slate-800">42</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Finance & Retention Keys */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Wallet size={14} className="text-green-600" />
            Finance & Billing Triggers
          </h3>
          <div className="space-y-3 flex-1">
            <div className="p-3 bg-slate-50/80 rounded-lg flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Milestone Billing</p>
                <p className="text-sm font-bold text-slate-900">$4,500.00</p>
              </div>
              <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Pending</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-lg flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Retainer Status</p>
                <p className="text-sm font-bold text-slate-900">12 Active</p>
              </div>
              <RefreshCcw size={12} className="text-slate-300" />
            </div>
            <div className="p-3 bg-slate-50/80 rounded-lg flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Renewal Alert</p>
                <p className="text-sm font-bold text-slate-900">2 Due</p>
              </div>
              <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Urgent</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <Button variant="ghost" size="sm" className="w-full text-[10px]">Open Finance Hub</Button>
          </div>
        </div>
      </div>

      {/* 3. Workflow & Approval Keys */}
      <div className="bg-slate-900 p-5 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Asset Hub & Creative Workflow</h3>
              <p className="text-slate-400 text-[10px] max-w-sm mt-0.5">
                Current backlog: <strong>3 creative iterations</strong> awaiting client review. 
                Average internal review time: 1.2 days.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <ShieldCheck className="text-green-500" size={14} />
              <p className="text-[10px] font-bold text-slate-200">Secure Access Verified</p>
            </div>
            <Button variant="primary" size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
              Review Pipeline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;