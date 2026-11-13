import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileX,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Shield,
  Activity,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { ITEM_CATEGORIES } from '../data/sampleData';
import { formatTimeAgo } from '../services/notificationService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { lostItems, foundItems, claims, users, auditLogs, stats } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Category counts for pure SVG Bar Chart
  const categoryCounts = ITEM_CATEGORIES.map((cat) => {
    const lostCount = lostItems.filter((i) => i.category === cat).length;
    const foundCount = foundItems.filter((i) => i.category === cat).length;
    return {
      category: cat,
      total: lostCount + foundCount,
      lost: lostCount,
      found: foundCount,
    };
  }).sort((a, b) => b.total - a.total);

  const maxCategoryTotal = Math.max(...categoryCounts.map((c) => c.total), 1);

  // Weekly data points for SVG Trend Chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const lostTrend = [3, 5, 2, 7, 4, 6, 4];
  const foundTrend = [2, 4, 3, 6, 5, 4, 5];

  const handleExport = () => {
    setToastMessage('Exporting administrative CSV report...');
    setTimeout(() => {
      setToastMessage('');
      alert('NEXORA Campus Item Ledger exported successfully (demo mode).');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome & Admin Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs font-semibold mb-2">
                <Shield size={14} />
                <span>VVITU Security & Administrative Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Operations & Analytics Command
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time campus property tracking, recovery metrics, and pending claim workflows.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="btn-secondary text-xs flex items-center gap-2 py-2.5"
              >
                <Download size={15} />
                <span>Export Audit CSV</span>
              </button>
              <Link to="/admin/verification" className="btn-primary text-xs flex items-center gap-2">
                <Clock size={15} />
                <span>Review Pending Claims</span>
              </Link>
            </div>
          </div>

          {toastMessage && (
            <div className="p-3 bg-electric-500/20 border border-electric-500/40 text-electric-300 text-xs rounded-xl flex items-center gap-2">
              <Activity size={15} className="animate-spin" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 6 Key StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Registered Campus Users"
              value={stats.totalUsers || users.length}
              icon={Users}
              change="+14% this month"
              changeType="up"
              color="blue"
            />
            <StatCard
              title="Active Lost Reports"
              value={stats.totalLost}
              icon={FileX}
              change="Total logged to date"
              changeType="down"
              color="red"
            />
            <StatCard
              title="Found Items Deposited"
              value={stats.totalFound}
              icon={FileCheck}
              change="Campus safe storage"
              changeType="up"
              color="green"
            />
            <StatCard
              title="Successfully Returned"
              value={stats.totalReturned || 14}
              icon={CheckCircle2}
              change="94.2% return rate"
              changeType="up"
              color="green"
            />
            <StatCard
              title="Pending Verification Claims"
              value={stats.pendingClaims}
              icon={Clock}
              change="Awaiting admin review"
              changeType="up"
              color="amber"
            />
            <StatCard
              title="Suspicious / Flagged Items"
              value={stats.suspiciousItems || 1}
              icon={AlertTriangle}
              change="Requires investigation"
              changeType="down"
              color="red"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Items by Category (Bar Chart) */}
            <div className="card p-6 border-navy-700 bg-navy-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <BarChart3 size={18} className="text-electric-400" />
                    <span>Property Volume by Category</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Distribution of reported items across VVITU campus
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">Real-time</span>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-3.5">
                {categoryCounts.slice(0, 7).map((item) => {
                  const pct = Math.round((item.total / maxCategoryTotal) * 100);
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-300">{item.category}</span>
                        <span className="font-mono text-slate-400">
                          <strong className="text-white">{item.total}</strong> items (
                          <span className="text-red-400">{item.lost}L</span> /{' '}
                          <span className="text-emerald-400">{item.found}F</span>)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-navy-900 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-electric-500 to-brand-purple rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: 7-Day Trend (SVG Line Chart) */}
            <div className="card p-6 border-navy-700 bg-navy-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" />
                      <span>Weekly Inflow Dynamics</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      7-day comparison: Lost (Red) vs Found (Green)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-red-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Lost
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Found
                    </span>
                  </div>
                </div>

                {/* SVG Visual */}
                <div className="h-52 w-full pt-4">
                  <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="380" y2="20" stroke="#1E293B" strokeDasharray="4" />
                    <line x1="20" y1="70" x2="380" y2="70" stroke="#1E293B" strokeDasharray="4" />
                    <line x1="20" y1="120" x2="380" y2="120" stroke="#1E293B" strokeDasharray="4" />

                    {/* Lost Line (Red) */}
                    <polyline
                      fill="none"
                      stroke="#F87171"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points="30,100 85,60 140,115 195,35 250,85 305,50 365,85"
                    />

                    {/* Found Line (Green) */}
                    <polyline
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="3"
                      strokeLinecap="round"
                      points="30,120 85,80 140,95 195,50 250,65 305,80 365,65"
                    />

                    {/* Dots */}
                    {[
                      [30, 100],
                      [85, 60],
                      [140, 115],
                      [195, 35],
                      [250, 85],
                      [305, 50],
                      [365, 85],
                    ].map(([cx, cy], i) => (
                      <circle key={'l' + i} cx={cx} cy={cy} r="4" fill="#F87171" />
                    ))}

                    {[
                      [30, 120],
                      [85, 80],
                      [140, 95],
                      [195, 50],
                      [250, 65],
                      [305, 80],
                      [365, 65],
                    ].map(([cx, cy], i) => (
                      <circle key={'f' + i} cx={cx} cy={cy} r="4" fill="#34D399" />
                    ))}

                    {/* X axis labels */}
                    {weekDays.map((day, idx) => (
                      <text
                        key={day}
                        x={30 + idx * 56}
                        y="150"
                        fill="#94A3B8"
                        fontSize="11"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {day}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-700/80 flex items-center justify-between text-xs text-slate-400">
                <span>Peak reporting day: Thursday (Seminar Hall & Lab classes)</span>
                <span className="text-emerald-400 font-semibold">+18% faster recovery</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Audit Log & Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Campus Audit Feed */}
            <div className="card p-6 border-navy-700 bg-navy-800 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-700">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Activity size={18} className="text-electric-400" />
                  <span>Administrative Audit Stream</span>
                </h3>
                <Link
                  to="/system"
                  className="text-xs text-electric-400 hover:text-white flex items-center gap-1"
                >
                  <span>Full Audit Logs</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-navy-900/60 rounded-xl border border-navy-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-bold">
                        {log.userName?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{log.details}</p>
                        <p className="text-[11px] text-slate-400">
                          By <strong className="text-slate-300">{log.userName}</strong> •{' '}
                          <span className="font-mono text-electric-400">{log.action}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-500 text-[11px] whitespace-nowrap">
                      {formatTimeAgo(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="card p-6 border-navy-700 bg-navy-800 space-y-4">
              <h3 className="font-bold text-white text-base">Administrative Shortcuts</h3>
              <p className="text-xs text-slate-400">Quick routing to operational dashboards.</p>

              <div className="space-y-2.5">
                <Link
                  to="/admin/verification"
                  className="p-3.5 rounded-xl bg-navy-900 hover:bg-navy-700 border border-navy-700 hover:border-electric-500/50 flex items-center justify-between text-xs transition group"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Review Pending Claims</p>
                      <p className="text-[11px] text-slate-400">
                        {stats.pendingClaims} requests queued
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-white transition"
                  />
                </Link>

                <Link
                  to="/admin/items"
                  className="p-3.5 rounded-xl bg-navy-900 hover:bg-navy-700 border border-navy-700 hover:border-electric-500/50 flex items-center justify-between text-xs transition group"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck size={16} className="text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">Full Property Inventory</p>
                      <p className="text-[11px] text-slate-400">
                        {lostItems.length + foundItems.length} total items
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-white transition"
                  />
                </Link>

                <Link
                  to="/system"
                  className="p-3.5 rounded-xl bg-navy-900 hover:bg-navy-700 border border-navy-700 hover:border-electric-500/50 flex items-center justify-between text-xs transition group"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-brand-purple" />
                    <div>
                      <p className="font-semibold text-white">System & Security</p>
                      <p className="text-[11px] text-slate-400">User roles & audit logs</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-500 group-hover:text-white transition"
                  />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
