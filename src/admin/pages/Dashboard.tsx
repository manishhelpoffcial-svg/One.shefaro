import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  DollarSign, 
  AlertOctagon, 
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AuditLog } from '../types';

interface DashboardProps {
  auditLogs: AuditLog[];
  shipmentCount: number;
  userCount: number;
  revenue: number;
  ticketsCount: number;
  onNavigate: (section: 'users' | 'shipments' | 'support' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  auditLogs,
  shipmentCount,
  userCount,
  revenue,
  ticketsCount,
  onNavigate
}) => {
  // Stat Card Definitions
  const stats = [
    {
      title: 'Total Shipments',
      value: (shipmentCount + 14850).toLocaleString(),
      icon: <Package className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      trend: '+12.4%',
      trendUp: true,
      sub: 'vs last 30 days',
      onClick: () => onNavigate('shipments')
    },
    {
      title: 'Active Accounts',
      value: (userCount + 3220).toLocaleString(),
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      trend: '+8.2%',
      trendUp: true,
      sub: 'vs last 30 days',
      onClick: () => onNavigate('users')
    },
    {
      title: 'Revenue This Month',
      value: `₹${(revenue + 485000).toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      trend: '+15.1%',
      trendUp: true,
      sub: 'vs last 30 days',
      onClick: () => onNavigate('settings') // or finance
    },
    {
      title: 'Pending Disputes',
      value: ticketsCount.toString(),
      icon: <AlertOctagon className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      trend: '-5.3%',
      trendUp: false,
      sub: 'unresolved tickets',
      onClick: () => onNavigate('support')
    }
  ];

  // SVG Chart 1 Mock Data (30 days of daily shipments)
  // Shipments per day last 30 days: typical values between 400 and 650
  const dailyShipments = [
    410, 425, 480, 440, 430, 490, 520, 510, 460, 480,
    550, 530, 590, 610, 580, 570, 620, 640, 590, 610,
    630, 605, 660, 680, 640, 630, 690, 710, 680, 720
  ];

  // SVG Chart 2 Mock Data (Last 6 months revenue)
  const monthlyRevenue = [
    { label: 'Jan', value: 3.8 }, // 3.8 Lakhs
    { label: 'Feb', value: 4.1 },
    { label: 'Mar', value: 4.5 },
    { label: 'Apr', value: 4.3 },
    { label: 'May', value: 4.7 },
    { label: 'Jun', value: 5.2 }
  ];

  // Calculate points for shipment daily line chart
  const width = 500;
  const height = 150;
  const maxShipment = Math.max(...dailyShipments) * 1.1;
  const minShipment = Math.min(...dailyShipments) * 0.9;
  const range = maxShipment - minShipment;

  const points = dailyShipments.map((val, i) => {
    const x = (i / (dailyShipments.length - 1)) * (width - 40) + 20;
    const y = height - ((val - minShipment) / range) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Welcome to Super Admin Dashboard</h1>
          <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
            Manage parcel routing, adjust weight pricing matrices, support individual citizen couriers, and monitor integrated logistics partner performance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-indigo-200 text-xs font-bold select-none">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
          <span>Super Admin Access Granted</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-xl border ${stat.bg} group-hover:scale-105 transition-transform`}>
                {stat.icon}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {stat.trendUp ? (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-3 h-3" />
                    <span>{stat.trend}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    <TrendingDown className="w-3 h-3" />
                    <span>{stat.trend}</span>
                  </span>
                )}
                <span className="text-[11px] font-semibold text-slate-400">{stat.sub}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Shipments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Domestic Routing Volume</h3>
            <p className="text-base font-extrabold text-slate-900 mb-6">Shipments Per Day (Last 30 Days)</p>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="relative w-full h-[160px] bg-slate-50 rounded-xl border border-slate-100 flex items-end">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="20" y1="35" x2={width - 20} y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="75" x2={width - 20} y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="115" x2={width - 20} y2="115" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

              {/* Area path */}
              <path
                d={`M 20,${height - 15} L ${points} L ${width - 20},${height - 15} Z`}
                fill="url(#lineGrad)"
              />
              {/* Line path */}
              <path
                d={`M ${points}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots at end and start */}
              <circle cx="20" cy={height - ((dailyShipments[0] - minShipment) / range) * (height - 30) - 15} r="4" fill="#6366f1" />
              <circle cx={width - 20} cy={height - ((dailyShipments[dailyShipments.length - 1] - minShipment) / range) * (height - 30) - 15} r="4" fill="#6366f1" />
            </svg>
            <div className="absolute top-2 right-3 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
              Current: {dailyShipments[dailyShipments.length - 1]}/day
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-400 px-1 select-none">
            <span>30 Days Ago</span>
            <span>15 Days Ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Chart 2: Revenue Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Financial Trajectory</h3>
            <p className="text-base font-extrabold text-slate-900 mb-6">Gross Monthly Revenue (Lakhs INR)</p>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="relative w-full h-[160px] bg-slate-50 rounded-xl border border-slate-100 flex items-end justify-around px-4 pt-6">
            {monthlyRevenue.map((item, index) => {
              const maxVal = 6.0;
              const barHeight = `${(item.value / maxVal) * 100}%`;
              return (
                <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group px-2">
                  <div className="relative w-full flex justify-center">
                    {/* Value Badge on Hover */}
                    <span className="absolute top-[-26px] scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md z-10 pointer-events-none whitespace-nowrap">
                      ₹{item.value} Lakhs
                    </span>
                    <div 
                      style={{ height: barHeight }} 
                      className="w-8 max-w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300 cursor-pointer shadow-sm group-hover:shadow-indigo-500/20"
                    />
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-slate-400 select-none">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <span className="text-[10px] font-bold text-slate-400">Values in ₹ Lakhs (1 Lakh = ₹100k)</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900">Recent Admin Activities</h3>
          </div>
          <button 
            onClick={() => onNavigate('settings')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Full Audit Log
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No recent admin logs recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
            {auditLogs.slice(0, 7).map((log) => (
              <div key={log.id} className="p-4 px-6 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{log.action}</p>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold text-slate-400">
                    <span className="text-indigo-600 bg-indigo-50 px-1 rounded">{log.admin}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase flex-shrink-0 select-none">
                  Secure
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
