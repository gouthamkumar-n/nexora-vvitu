import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileX,
  FileCheck,
  Sparkles,
  Clock,
  PlusCircle,
  Search,
  ArrowRight,
  Bell,
  Activity,
  ChevronRight,
  MapPin,
  Calendar,
  User,
  Edit3,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Key,
  Building,
  Phone,
  GraduationCap,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatTimeAgo } from '../services/notificationService';
import { findTopMatches } from '../services/matchingEngine';

// ─── Action tile ────────────────────────────────────────────────────────────
function QuickActionTile({ icon: Icon, label, description, to, onClick, color = 'electric' }) {
  const navigate = useNavigate();
  const colorMap = {
    electric: 'from-electric-600/20 to-electric-500/5 border-electric-500/30 hover:border-electric-400',
    green: 'from-emerald-600/20 to-emerald-500/5 border-emerald-500/30 hover:border-emerald-400',
    purple: 'from-purple-600/20 to-purple-500/5 border-purple-500/30 hover:border-purple-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/30 hover:border-amber-400',
  };
  const iconColors = {
    electric: 'text-electric-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
  };

  return (
    <button
      onClick={() => (onClick ? onClick() : navigate(to))}
      className={`card-sm w-full text-left bg-gradient-to-br ${colorMap[color]} border transition-all duration-200
        hover:scale-[1.02] hover:shadow-card-hover group cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 p-2.5 rounded-xl bg-navy-800 border border-navy-700 ${iconColors[color]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{description}</p>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, updateUser, changePassword } = useAuth();
  const {
    lostItems,
    foundItems,
    claims,
    notifications,
    users,
    updateUser: updateAppUser,
  } = useApp();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Edit Profile Modal State right on Dashboard
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    userType: user?.userType || 'Student',
    studentId: user?.studentId || '',
    department: user?.department || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [dashboardToast, setDashboardToast] = useState('');

  const openEditProfileModal = () => {
    setProfileError('');
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      userType: user?.userType || 'Student',
      studentId: user?.studentId || '',
      department: user?.department || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      currentPassword: '',
      newPassword: '',
    });
    setIsEditProfileOpen(true);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setProfileForm((prev) => ({ ...prev, avatar: ev.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('Full Name and Email Address are required.');
      return;
    }

    const normalizedEmail = profileForm.email.trim().toLowerCase();
    const emailConflict = users.some(
      (u) => u.id !== user?.id && u.email?.toLowerCase() === normalizedEmail
    );
    if (emailConflict) {
      setProfileError('Another account is already using this email address.');
      return;
    }

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        setProfileError('New password must be at least 6 characters.');
        return;
      }
      if (!profileForm.currentPassword) {
        setProfileError('Please enter your current password to set a new password.');
        return;
      }
      const pwRes = changePassword(profileForm.currentPassword, profileForm.newPassword);
      if (!pwRes.success) {
        setProfileError(pwRes.error || 'Current password is incorrect.');
        return;
      }
    }

    const changes = {
      name: profileForm.name.trim(),
      email: normalizedEmail,
      userType: profileForm.userType,
      studentId: profileForm.studentId.trim() || null,
      department: profileForm.department.trim(),
      phone: profileForm.phone.trim(),
      avatar: profileForm.avatar ? profileForm.avatar.trim() : '',
      ...(profileForm.newPassword ? { password: profileForm.newPassword } : {}),
    };

    updateUser(changes);
    if (user?.id) {
      updateAppUser(user.id, changes);
    }

    setIsEditProfileOpen(false);
    setDashboardToast('Your profile has been updated successfully!');
    setTimeout(() => setDashboardToast(''), 3500);
  };

  const userId = user?.id;

  // Filtered data for this user
  const myLost = useMemo(() => lostItems.filter((i) => i.userId === userId), [lostItems, userId]);
  const myFound = useMemo(() => foundItems.filter((i) => i.foundBy === userId), [foundItems, userId]);
  const myClaims = useMemo(() => claims.filter((c) => c.claimantId === userId), [claims, userId]);
  const myPending = useMemo(() => myClaims.filter((c) => c.status === 'pending'), [myClaims]);
  const myNotifs = useMemo(
    () => notifications.filter((n) => n.userId === userId).slice(0, 4),
    [notifications, userId]
  );

  // AI match count: count my active lost items that have ≥1 match
  const myMatchCount = useMemo(() => {
    return myLost.filter((lost) => {
      const matches = findTopMatches(lost, foundItems, 1);
      return matches.length > 0 && matches[0].score >= 40;
    }).length;
  }, [myLost, foundItems]);

  // Recent reports: combine user's lost + found, sort by date, take 4
  const recentReports = useMemo(() => {
    return [
      ...myLost.map((i) => ({ ...i, _type: 'lost' })),
      ...myFound.map((i) => ({ ...i, _type: 'found' })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [myLost, myFound]);

  // Recent campus-wide active items so the dashboard is always rich and useful
  const latestCampusItems = useMemo(() => {
    return [
      ...lostItems.filter((i) => i.status === 'active').map((i) => ({ ...i, _type: 'lost' })),
      ...foundItems.filter((i) => i.status === 'active').map((i) => ({ ...i, _type: 'found' })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [lostItems, foundItems]);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Today's date
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {dashboardToast && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 shadow-lg">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>{dashboardToast}</span>
            </div>
          )}

          {/* ── Welcome & Profile Hero Card ──────────────────────────────── */}
          <div className="card bg-gradient-to-br from-navy-800 via-navy-800 to-electric-500/15 border border-electric-500/30 relative overflow-hidden p-6">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-12 -right-12 w-56 h-56 bg-electric-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative group w-16 h-16 flex-shrink-0">
                  {user?.avatar && !String(user.avatar).includes('pravatar.cc') ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="w-16 h-16 rounded-2xl ring-2 ring-electric-500/50 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-navy-900 ring-2 ring-electric-500/50 flex items-center justify-center text-slate-400 shadow-lg">
                      <User size={30} />
                    </div>
                  )}
                  <button
                    onClick={openEditProfileModal}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-electric-500 hover:bg-electric-400 text-white flex items-center justify-center shadow-md transition"
                    title="Edit Profile & Photo"
                  >
                    <Edit3 size={12} />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-electric-400 font-semibold mb-1">
                    <Calendar size={12} />
                    <span>{today}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {greeting}, {user?.name || 'Campus Member'}!
                  </h1>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-300">
                    <span className="badge badge-blue capitalize">
                      {user?.userType || 'Student'}
                    </span>
                    {user?.studentId && (
                      <span className="flex items-center gap-1 text-slate-300 font-mono bg-navy-900/70 px-2.5 py-0.5 rounded-lg border border-navy-700">
                        <GraduationCap size={12} className="text-electric-400" />
                        {user.studentId}
                      </span>
                    )}
                    {user?.department && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Building size={12} className="text-slate-500" />
                        {user.department}
                      </span>
                    )}
                    {user?.phone && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone size={12} className="text-slate-500" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons on Hero Banner */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={openEditProfileModal}
                  className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 border-navy-600 hover:border-electric-500/50"
                >
                  <Edit3 size={14} className="text-electric-400" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => navigate('/report-lost')}
                  className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
                >
                  <PlusCircle size={15} />
                  <span>Report Lost Item</span>
                </button>
                <button
                  onClick={() => navigate('/report-found')}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-2"
                >
                  <FileCheck size={15} />
                  <span>Report Found Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="My Lost Reports" value={myLost.length} icon={FileX} color="blue" />
            <StatCard title="My Found Reports" value={myFound.length} icon={FileCheck} color="green" />
            <StatCard title="AI Smart Matches" value={myMatchCount} icon={Sparkles} color="purple" />
            <StatCard title="Pending Claims" value={myPending.length} icon={Clock} color="amber" />
          </div>

          {/* ── Quick Actions Row ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionTile
              icon={FileX}
              label="Report Lost Item"
              description="Register a lost belonging"
              to="/report-lost"
              color="electric"
            />
            <QuickActionTile
              icon={FileCheck}
              label="Report Found Item"
              description="Log an item you found on campus"
              to="/report-found"
              color="green"
            />
            <QuickActionTile
              icon={Sparkles}
              label="AI Smart Matches"
              description="Check automated match scores"
              to="/ai-matching"
              color="purple"
            />
            <QuickActionTile
              icon={User}
              label="Edit My Profile"
              description="Update photo, details & password"
              onClick={openEditProfileModal}
              color="amber"
            />
          </div>

          {/* ── Middle Section: My Reports + Notifications ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Recent Reports Table */}
            <div className="lg:col-span-2 card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
                <div>
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <FileX size={16} className="text-electric-400" />
                    <span>My Submitted Reports</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track the live verification status of your reported items
                  </p>
                </div>
                <Link
                  to="/my-activity"
                  className="text-xs text-electric-400 hover:text-electric-300 font-semibold flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {recentReports.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-700 flex items-center justify-center mx-auto mb-3">
                    <FileX size={22} className="text-slate-500" />
                  </div>
                  <p className="text-white font-semibold text-sm">No personal reports submitted yet</p>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Lost or found something on VVITU campus? Submit a report and our AI engine will automatically scan for matches.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <button
                      onClick={() => navigate('/report-lost')}
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} /> Report Lost Item
                    </button>
                    <button
                      onClick={() => navigate('/browse')}
                      className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <Search size={14} /> Browse Campus Items
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-navy-900/70 border-b border-navy-700">
                        <th className="table-header">Item</th>
                        <th className="table-header">Type</th>
                        <th className="table-header hidden sm:table-cell">Location</th>
                        <th className="table-header">Status</th>
                        <th className="table-header hidden md:table-cell">Reported</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/50">
                      {recentReports.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-9 h-9 rounded-lg object-cover border border-navy-600 flex-shrink-0"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-white line-clamp-1 max-w-[170px]">
                                  {item.title}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400">
                                  {item.reportId || item.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span
                              className={`badge text-[10px] font-bold uppercase ${
                                item._type === 'lost' ? 'badge-red' : 'badge-green'
                              }`}
                            >
                              {item._type}
                            </span>
                          </td>
                          <td className="table-cell hidden sm:table-cell text-slate-300">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-electric-400 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">
                                {item._type === 'lost' ? item.location : item.foundLocation}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <Badge status={item.status} />
                          </td>
                          <td className="table-cell hidden md:table-cell text-slate-400">
                            {formatTimeAgo(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notifications Panel */}
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
                  <h2 className="font-bold text-white text-base flex items-center gap-2">
                    <Bell size={16} className="text-electric-400" />
                    <span>Notifications</span>
                  </h2>
                  <span className="badge badge-blue">
                    {myNotifs.filter((n) => !n.read).length} unread
                  </span>
                </div>

                {myNotifs.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Bell size={28} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-300 font-medium text-sm">All caught up!</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Alerts for AI matches and claim verifications will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-navy-700/60">
                    {myNotifs.map((notif) => (
                      <li
                        key={notif.id}
                        onClick={() => navigate(notif.link || '/my-activity')}
                        className={`px-5 py-3.5 hover:bg-navy-700/50 transition-colors cursor-pointer ${
                          !notif.read ? 'border-l-2 border-electric-500 bg-navy-900/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                              notif.type === 'match'
                                ? 'bg-purple-500/20'
                                : notif.type === 'claim_approved'
                                ? 'bg-emerald-500/20'
                                : notif.type === 'claim_rejected'
                                ? 'bg-red-500/20'
                                : 'bg-electric-500/20'
                            }`}
                          >
                            <Sparkles
                              size={13}
                              className={
                                notif.type === 'match'
                                  ? 'text-purple-400'
                                  : notif.type === 'claim_approved'
                                  ? 'text-emerald-400'
                                  : notif.type === 'claim_rejected'
                                  ? 'text-red-400'
                                  : 'text-electric-400'
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{notif.title}</p>
                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-slate-500 text-[11px] mt-1">
                              {formatTimeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 border-t border-navy-700 bg-navy-900/40 text-center">
                <Link
                  to="/my-activity"
                  className="text-xs text-electric-400 hover:text-electric-300 font-semibold"
                >
                  Open Notification Inbox →
                </Link>
              </div>
            </div>
          </div>

          {/* ── Latest Campus Lost & Found Feed ──────────────────────────── */}
          <div className="card p-6 border-navy-700 bg-navy-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-white text-base flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span>Live Campus Lost &amp; Found Feed</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Recent items reported across VVITU College campus
                </p>
              </div>
              <Link
                to="/browse"
                className="btn-secondary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Search size={13} />
                <span>Browse Full Catalog</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestCampusItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/browse')}
                  className="rounded-2xl bg-navy-900/90 border border-navy-700 hover:border-electric-500/40 overflow-hidden transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-36 overflow-hidden relative bg-navy-950">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-2.5 left-2.5 badge text-[10px] font-bold uppercase shadow ${
                        item._type === 'lost' ? 'badge-red' : 'badge-green'
                      }`}
                    >
                      {item._type}
                    </span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description || item.publicDescription}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={11} className="text-electric-400 flex-shrink-0" />
                        <span className="truncate">
                          {item._type === 'lost' ? item.location : item.foundLocation}
                        </span>
                      </span>
                      <span className="text-slate-500 flex-shrink-0">
                        {item.dateLost || item.dateFound}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Edit My Profile Modal (Accessible Directly from Dashboard) ── */}
          <Modal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            title="Edit My Profile & Password"
            size="lg"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {profileError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl bg-navy-900 border border-navy-700">
                {profileForm.avatar && !String(profileForm.avatar).includes('pravatar.cc') ? (
                  <img
                    src={profileForm.avatar}
                    alt="Avatar Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-electric-500/60 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-navy-800 border-2 border-electric-500/60 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <User size={28} />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="label text-xs mb-0">Profile Photo (Optional)</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                      Upload From Device
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    {profileForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatar: '' })}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                      >
                        Remove Photo
                      </button>
                    )}
                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      className="input-field text-xs py-1.5 flex-1 min-w-[160px]"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field text-xs"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Login Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input-field text-xs"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Campus Member Type</label>
                  <select
                    className="select-field text-xs"
                    value={profileForm.userType}
                    onChange={(e) => setProfileForm({ ...profileForm, userType: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>
                <div>
                  <label className="label">Student / Staff ID</label>
                  <input
                    type="text"
                    placeholder="e.g. VV22CS001"
                    className="input-field text-xs"
                    value={profileForm.studentId}
                    onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Department / Branch</label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Optional Password Change */}
              <div className="pt-3 border-t border-navy-700">
                <p className="text-white font-semibold text-xs mb-2 flex items-center gap-1.5">
                  <Key size={13} className="text-brand-purple" />
                  <span>Change Password (Optional — leave blank to keep current)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="input-field text-xs"
                      value={profileForm.currentPassword}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, currentPassword: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="input-field text-xs"
                      value={profileForm.newPassword}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, newPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-700">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Profile Changes
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
