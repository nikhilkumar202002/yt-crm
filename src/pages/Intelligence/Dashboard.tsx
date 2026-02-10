import React from 'react';
import { useAppSelector } from '../../store/store';
import { 
  Users, Target, Rocket, Activity, 
  TrendingUp, Wallet, CheckCircle, Clock, 
  Layers, ShieldCheck, RefreshCcw,
  ArrowUpRight, Download, Calendar,
  ExternalLink, Filter, MoreHorizontal,
  ChevronRight, AlertCircle, TrendingDown,
  Facebook, Mail, Play, Globe, Search,
  Share2, MousePointer2, Briefcase, FileText, Settings
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
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';

const Dashboard = () => {
  const { user, roleName } = useAppSelector((state) => state.auth);

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

  // 1. Top Row Stats (7 Items)
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
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white">
              <span className="font-black text-[10px] italic">YT</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase">CRM — Master Dashboard</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide flex items-center gap-2">
            Intelligence Overseer: <span className="font-bold text-slate-700">{user?.name}</span> 
            <span className="h-3 w-px bg-slate-200" /> 
            Role: <span className="text-blue-600 font-bold">{roleName}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-[11px] font-bold">
            <Download size={14} className="mr-1.5" />
            Intelligence Report
          </Button>
          <Button variant="primary" size="sm" className="h-8 text-[11px] font-bold">
            <Filter size={14} className="mr-1.5" />
            Refresh Intelligence
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {topStats.map((stat, i) => (
          <div key={i} className={`bg-white p-3 rounded-xl shadow-sm border-l-2 ${stat.color} hover:shadow-md transition-all cursor-default`}>
             <div className="flex items-center gap-1.5 mb-2">
               {stat.icon}
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
             </div>
             <div className="flex items-end justify-between">
               <p className="text-base font-bold text-slate-900 leading-none">{stat.value}</p>
               <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
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
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lead Source</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
          </div>
          <div className="h-48 w-full">
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
                    borderRadius: '12px', 
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
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-bold text-slate-500 truncate">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Pipeline Steps */}
        <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
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
                    borderRadius: '12px', 
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
              <div key={i} className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all">
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
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Conversion Funnel</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-4">
            <div className="w-full bg-orange-400/90 h-10 rounded-t-lg flex items-center justify-between px-4 text-white">
               <span className="text-[9px] font-bold uppercase tracking-wider">Leads</span>
               <span className="text-[11px] font-black tracking-widest">245</span>
            </div>
            <div className="w-[85%] bg-green-500/90 h-10 flex items-center justify-between px-4 text-white">
               <span className="text-[9px] font-bold uppercase tracking-wider">Qualified</span>
               <span className="text-[11px] font-black tracking-widest">98</span>
            </div>
            <div className="w-[70%] bg-blue-500/90 h-10 flex items-center justify-between px-4 text-white">
               <span className="text-[9px] font-bold uppercase tracking-wider">Proposals</span>
               <span className="text-[11px] font-black tracking-widest">62</span>
            </div>
            <div className="w-[55%] bg-purple-600/90 h-10 rounded-b-lg flex items-center justify-between px-4 text-white">
               <span className="text-[9px] font-bold uppercase tracking-wider">Closed</span>
               <span className="text-[11px] font-black tracking-widest">31</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-slate-50">
             <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Lead to Closed</span>
                <span className="text-[10px] font-black text-green-600">12.6%</span>
             </div>
          </div>
        </div>

        {/* Row 3: Tracking & Publishing */}
        {/* Active Campaigns Table */}
        <div className="col-span-12 lg:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
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
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-white">
                          {row.manager}
                        </div>
                     </td>
                     <td className="py-3 text-right">
                       <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${row.status === 'Active' ? 'text-green-600 bg-green-50' : row.status === 'Paused' ? 'text-orange-500 bg-orange-50' : 'text-slate-500 bg-slate-100'}`}>
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
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
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
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full ${task.color} rounded-full`} style={{ width: `${(task.value / task.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-3 bg-slate-50 rounded-xl border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Weekly completion</p>
             <div className="flex items-center gap-2">
                <p className="text-lg font-black text-slate-800 tracking-tighter">₹1.2L</p>
                <ArrowUpRight size={14} className="text-green-600" />
             </div>
          </div>
        </div>

        {/* Top Ad Performance Table */}
        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
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
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded flex items-center justify-center ${row.c}`}>
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

        {/* Row 4: Finance & Retention */}
        {/* Revenue & Expenses Bar Chart */}
        <div className="col-span-12 lg:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Revenue & Expenses</h3>
              <p className="text-[9px] text-slate-400 font-medium">Monthly performance visualizer</p>
            </div>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase border border-blue-100 tracking-widest">Revenue</span>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-500 text-[8px] font-black rounded uppercase border border-orange-100 tracking-widest">Expense</span>
            </div>
          </div>
          <div className="h-48 w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={financialData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="month" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} 
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} 
                 />
                 <Tooltip 
                   contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }} 
                 />
                 <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                 <Bar dataKey="expense" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={12} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut */}
        <div className="col-span-12 lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Expense Breakdown</h3>
            <span className="text-[10px] text-slate-400 font-bold">₹2.4L Total</span>
          </div>
          <div className="h-40 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ad Spend', value: 64, color: '#fb923c' },
                    { name: 'Resource Cost', value: 24, color: '#6366f1' },
                    { name: 'System/Others', value: 12, color: '#cbd5e1' },
                  ]}
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { color: '#fb923c' },
                    { color: '#6366f1' },
                    { color: '#cbd5e1' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
             {[
               { l: 'Ad Spend', v: '₹1.8L', p: '64%', c: 'bg-orange-400' },
               { l: 'Resource Cost', v: '₹0.5L', p: '24%', c: 'bg-indigo-500' },
               { l: 'System/Others', v: '₹0.1L', p: '12%', c: 'bg-slate-300' },
             ].map((item, i) => (
               <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-2">
                       <div className={`h-2 w-2 rounded-full ${item.c}`} />
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.l}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-800">{item.v}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className={`h-full ${item.c}`} style={{ width: item.p }} />
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Renewal Alerts Hub */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
             <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-500" />
                Renewal Alerts
              </h3>
              <CheckCircle size={14} className="text-slate-200" />
            </div>
            <div className="space-y-4">
               {[
                 { client: 'XYZ Films', date: 'In 12 days', type: 'Retainer' },
                 { client: 'ABC Brand', date: 'In 4 days', type: 'Subscription' },
                 { client: 'Tech Co.', date: 'Tomorrow', type: 'Project' },
               ].map((alert, i) => (
                 <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/50 group hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 flex flex-col items-center justify-center text-orange-600 border border-orange-100 px-1 overflow-hidden shrink-0">
                         <span className="text-[7px] font-black uppercase leading-none mb-1">Feb</span>
                         <span className="text-xs font-black leading-none">{12+i}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{alert.client}</p>
                        <p className="text-[8px] font-medium text-slate-500 mt-0.5">{alert.type}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap ml-2">
                      {alert.date}
                    </span>
                 </div>
               ))}
            </div>
            <button className="w-full mt-6 py-2 rounded-xl text-[10px] font-bold text-slate-400 border border-dashed border-slate-200 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
               View All Triggers
               <ArrowUpRight size={12} />
            </button>
           </div>
           
           <div className="bg-slate-900 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 System Notifications
                 <span className="flex items-center gap-1 text-blue-400 lowercase italic py-0 px-2 rounded-full border border-slate-800 bg-slate-800 tracking-normal">live update</span>
              </div>
              <div className="space-y-2.5">
                 <p className="text-[10px] text-slate-200 leading-relaxed font-medium">
                    <span className="text-orange-400 font-bold">ABC Brand</span> Renewal Due in 10 Days
                 </p>
                 <div className="h-px w-full bg-slate-800" />
                 <p className="text-[10px] text-slate-200 leading-relaxed font-medium">
                    <span className="text-green-400 font-bold">XYZ Films</span> Upsell Opportunity: High
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;