import React from 'react';
import { 
  Users, Target, Rocket, Activity, 
  TrendingUp, Wallet, Clock, 
  MoreHorizontal, ArrowUpRight, Facebook, Globe, Play, Settings, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';

const AdminDashboard = () => {
  // Chart Data
  const leadSourceData = [
    { name: 'Website', value: 28, color: '#3b82f6' },
    { name: 'Meta Ads', value: 22, color: '#fb923c' },
    { name: 'Google Ads', value: 18, color: '#6366f1' },
    { name: 'Social Media', value: 17, color: '#22c55e' },
    { name: 'Referrals', value: 10, color: '#a855f7' },
    { name: 'Other', value: 5, color: '#94a3b8' },
  ];

  const financialData = [
    { month: 'Jan', revenue: 60, expense: 24 },
    { month: 'Feb', revenue: 45, expense: 18 },
    { month: 'Mar', revenue: 80, expense: 32 },
    { month: 'Apr', revenue: 55, expense: 22 },
    { month: 'May', revenue: 90, expense: 36 },
    { month: 'Jun', revenue: 75, expense: 30 },
    { month: 'Jul', revenue: 40, expense: 16 },
    { month: 'Aug', revenue: 65, expense: 26 },
    { month: 'Sep', revenue: 85, expense: 34 },
    { month: 'Oct', revenue: 50, expense: 20 },
    { month: 'Nov', revenue: 70, expense: 28 },
    { month: 'Dec', revenue: 95, expense: 38 },
  ];

  const topStats = [
    { label: 'Active Leads', value: '245', trend: '+12%', color: 'border-blue-500', icon: <Users size={14} className="text-blue-500" /> },
    { label: 'Qualified Leads', value: '98', trend: '+8%', color: 'border-green-500', icon: <Target size={14} className="text-green-500" /> },
    { label: 'Pipeline Val', value: '₹32.5L', trend: '+20%', color: 'border-purple-500', icon: <TrendingUp size={14} className="text-purple-500" /> },
    { label: 'Close This Month', value: '₹8.7L', trend: '+15%', color: 'border-orange-500', icon: <Wallet size={14} className="text-orange-500" /> },
    { label: 'Active Campaigns', value: '17', trend: 'Stable', color: 'border-indigo-500', icon: <Rocket size={14} className="text-indigo-500" /> },
    { label: 'Monthly Revenue', value: '₹12.4L', trend: '+18%', color: 'border-emerald-500', icon: <TrendingUp size={14} className="text-emerald-500" /> },
    { label: 'Pending Payments', value: '₹4.2L', trend: '-10%', color: 'border-red-500', icon: <Clock size={14} className="text-red-500" /> },
  ];

  return (
    <>
      {/* Row 1: KPI Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {topStats.map((stat, i) => (
          <div key={i} className={`bg-white p-3 rounded-none shadow-sm border-l-2 ${stat.color} hover:shadow-md transition-all cursor-default`}>
             <div className="flex items-center gap-1.5 mb-2">
               {stat.icon}
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
             </div>
             <div className="flex items-end justify-between">
               <p className="text-base font-bold text-slate-900 leading-none">{stat.value}</p>
               <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-none ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                 {stat.trend}
               </span>
             </div>
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* Row 2: Lead Source & Pipeline */}
        {/* Lead Source Donut */}
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lead Source</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
          </div>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-center pointer-events-none">
               <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Total</p>
               <p className="text-sm font-bold text-slate-800 leading-none">1,284</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4">
            {leadSourceData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-1.5 w-1.5 rounded-none shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-bold text-slate-500 truncate">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Pipeline Steps */}
        <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-none shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sales Pipeline Performance</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">This Quarter</span>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
            </div>
          </div>
          
          <div className="h-40 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData.slice(-6)}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '0px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'New', count: '56', value: '₹7.6L', color: 'text-blue-500' },
              { label: 'Contacted', count: '34', value: '₹3.4L', color: 'text-indigo-500' },
              { label: 'Proposal', count: '18', value: '₹33.4L', color: 'text-purple-500' },
              { label: 'Negotiate', count: '9', value: '₹14.2L', color: 'text-orange-500' },
              { label: 'Won', count: '27', value: '₹39.8L', color: 'text-green-600' },
              { label: 'Lost', count: '14', value: '₹3.8L', color: 'text-red-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50/80 p-3 rounded-none border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">{stat.label}</p>
                <div>
                  <p className="text-xl font-black text-slate-900 leading-none mb-1.5">{stat.count}</p>
                  <p className={`text-[10px] font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel Viz */}
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Conversion Funnel</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-4">
            <div className="w-full bg-orange-400/90 h-10 rounded-none flex items-start justify-between px-4 text-white pt-2">
               <span className="text-[9px] font-bold uppercase tracking-wider">Leads</span>
               <span className="text-[11px] font-black tracking-widest">245</span>
            </div>
            <div className="w-[85%] bg-green-500/90 h-10 flex items-start justify-between px-4 text-white pt-2">
               <span className="text-[9px] font-bold uppercase tracking-wider">Qualified</span>
               <span className="text-[11px] font-black tracking-widest">98</span>
            </div>
            <div className="w-[70%] bg-blue-500/90 h-10 flex items-start justify-between px-4 text-white pt-2">
               <span className="text-[9px] font-bold uppercase tracking-wider">Proposals</span>
               <span className="text-[11px] font-black tracking-widest">62</span>
            </div>
            <div className="w-[55%] bg-purple-600/90 h-10 rounded-none flex items-start justify-between px-4 text-white pt-2">
               <span className="text-[9px] font-bold uppercase tracking-wider">Closed</span>
               <span className="text-[11px] font-black tracking-widest">31</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-slate-50">
             <div className="flex justify-between items-center bg-slate-50 p-2 rounded-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Lead to Closed</span>
                <span className="text-[10px] font-black text-green-600">12.6%</span>
             </div>
          </div>
        </div>

        {/* Row 3: Tracking & Publishing */}
        {/* Active Campaigns Table */}
        <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-blue-600" />
              Active Campaigns Tracking
            </h3>
            <button className="text-[10px] font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-50">
                   <th className="pb-3 text-left text-[9px] font-bold text-slate-400 uppercase">Client</th>
                   <th className="pb-3 text-left text-[9px] font-bold text-slate-400 uppercase">Campaign</th>
                   <th className="pb-3 text-left text-[9px] font-bold text-slate-400 uppercase">Manager</th>
                   <th className="pb-3 text-right text-[9px] font-bold text-slate-400 uppercase">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {[
                   { client: 'XYZ Films', campaign: 'Movie Pitch', manager: 'AP', status: 'Active', color: 'text-green-600 bg-green-50' },
                   { client: 'ABC Brand', campaign: 'In-Program', manager: 'SJ', status: 'Draft', color: 'text-slate-500 bg-slate-50' },
                   { client: 'Tech Co.', campaign: 'Brand Boost', manager: 'MJ', status: 'Active', color: 'text-green-600 bg-green-50' },
                   { client: 'Fashion Hub', campaign: 'Festival', manager: 'SW', status: 'Paused', color: 'text-orange-500 bg-orange-50' },
                   { client: 'StartUp Inc.', campaign: 'Design Spec', manager: 'RS', status: 'Active', color: 'text-green-600 bg-green-50' },
                 ].map((row, i) => (
                   <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                     <td className="py-3 text-[10px] font-bold text-slate-800">{row.client}</td>
                     <td className="py-3 text-[10px] text-slate-500 font-medium">{row.campaign}</td>
                     <td className="py-3">
                        <div className="h-5 w-5 rounded-none bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-white">
                          {row.manager}
                        </div>
                     </td>
                     <td className="py-3 text-right">
                       <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-none ${row.status === 'Active' ? 'text-green-600 bg-green-50' : row.status === 'Paused' ? 'text-orange-500 bg-orange-50' : 'text-slate-500 bg-slate-100'}`}>
                         {row.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Task Overview Bars */}
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Operation Tasks</h3>
            <span className="text-[10px] font-black text-slate-400">42 Total</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Design Tasks', value: 12, max: 20, color: 'bg-blue-500' },
              { label: 'Content Tasks', value: 8, max: 20, color: 'bg-orange-400' },
              { label: 'Video Tasks', value: 5, max: 20, color: 'bg-purple-500' },
              { label: 'Client Approvals', value: 14, max: 20, color: 'bg-red-500' },
              { label: 'Internal Review', value: 4, max: 20, color: 'bg-green-500' },
            ].map((task, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{task.label}</span>
                  <span className="text-[10px] font-black text-slate-800">{task.value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-none overflow-hidden">
                   <div className={`h-full ${task.color} rounded-none`} style={{ width: `${(task.value / task.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-3 bg-slate-50 rounded-none border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Weekly completion</p>
             <div className="flex items-center gap-2">
                <p className="text-lg font-black text-slate-800 tracking-tighter">₹1.2L</p>
                <ArrowUpRight size={14} className="text-green-600" />
             </div>
          </div>
        </div>

        {/* Top Ad Performance Table */}
        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-none shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top Ad Performance</h3>
            <button className="text-slate-400 hover:text-slate-600"><Settings size={14} /></button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-50">
                    <th className="pb-3 text-left text-[9px] font-bold text-slate-400 uppercase">Platform</th>
                    <th className="pb-3 text-right text-[9px] font-bold text-slate-400 uppercase">Leads</th>
                    <th className="pb-3 text-right text-[9px] font-bold text-slate-400 uppercase">CPL</th>
                    <th className="pb-3 text-right text-[9px] font-bold text-slate-400 uppercase">ROI</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {[
                   { name: 'Facebook', value: 186, cpl: '₹118', roi: '17.8%', icon: <Facebook size={12} className="text-blue-600" />, c: 'bg-blue-100' },
                   { name: 'Google Ads', value: 117, cpl: '₹136', roi: '121%', icon: <Globe size={12} className="text-indigo-600" />, c: 'bg-indigo-100' },
                   { name: 'Instagram', value: 158, cpl: '₹126', roi: '16.8%', icon: <ArrowUpRight size={12} className="text-pink-600" />, c: 'bg-pink-100' },
                   { name: 'YouTube', value: 92, cpl: '₹142', roi: '22.4%', icon: <Play size={12} className="text-red-500" />, c: 'bg-red-50' },
                 ].map((row, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                     <td className="py-3">
                        <div className="flex items-start gap-2">
                          <div className={`h-6 w-6 rounded-none flex items-center justify-center ${row.c}`}>
                            {row.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800">{row.name}</span>
                        </div>
                     </td>
                     <td className="py-3 text-right text-[10px] font-bold text-slate-800">{row.value}</td>
                     <td className="py-3 text-right text-[10px] font-black text-slate-600">{row.cpl}</td>
                     <td className="py-3 text-right text-[10px] font-bold text-green-600 tracking-tighter">
                       {row.roi}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;