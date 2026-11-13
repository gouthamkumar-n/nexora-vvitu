import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText,
  FileCheck,
  ShieldCheck,
  Bell,
  User,
  Key,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Building,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatTimeAgo } from '../services/notificationService';

export default function MyActivity() {
  const { user, updateUser, changePassword } = useAuth();
  const {
    lostItems,
    foundItems,
    claims,
    notifications,
    users,
    updateLostItem,
    updateUser: updateAppUser,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'lost';
  }); // 'lost' | 'found' | 'claims' | 'notifications' | 'profile'

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t && ['lost', 'found', 'claims', 'notifications', 'profile'].includes(t)) {
      setActiveTab(t);
    }
  }, [location.search]);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileStudentId, setProfileStudentId] = useState(user?.studentId || '');
  const [profileUserType, setProfileUserType] = useState(user?.userType || 'Student');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileDepartment, setProfileDepartment] = useState(user?.department || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileToast, setProfileToast] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Filter user records
  const myLost = lostItems.filter((i) => i.userId === user?.id);
  const myFound = foundItems.filter((i) => i.foundBy === user?.id);
  const myClaims = claims.filter((c) => c.claimantId === user?.id);
  const myNotifs = notifications.filter((n) => n.userId === user?.id);

  const handleWithdrawLost = (id) => {
    if (window.confirm('Are you sure you want to withdraw this lost report?')) {
      updateLostItem(id, { status: 'withdrawn' });
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setProfileAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');
    if (!profileName.trim() || !profileEmail.trim()) {
      setProfileError('Full Name and Email Address are required.');
      return;
    }
    const normalizedEmail = profileEmail.trim().toLowerCase();
    const emailConflict = users.some(
      (u) => u.id !== user?.id && u.email?.toLowerCase() === normalizedEmail
    );
    if (emailConflict) {
      setProfileError('Another account is already using this email address.');
      return;
    }

    const changes = {
      name: profileName.trim(),
      email: normalizedEmail,
      studentId: profileStudentId.trim() || null,
      userType: profileUserType,
      phone: profilePhone.trim(),
      department: profileDepartment.trim(),
      avatar: profileAvatar ? profileAvatar.trim() : '',
    };
    updateUser(changes);
    if (user?.id) {
      updateAppUser(user.id, changes);
    }
    setProfileToast('Profile details & login email updated successfully!');
    setTimeout(() => setProfileToast(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    const res = changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordError(res.error || 'Failed to update password.');
      return;
    }
    setPasswordToast('Password updated and saved to your account!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                My Campus Activity & Profile
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Track your submitted reports, claim statuses, notifications, and profile details.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hidden gap-2 p-1.5 bg-navy-800/80 rounded-2xl border border-navy-700 mb-8 max-w-full">
            <button
              onClick={() => setActiveTab('lost')}
              className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === 'lost' ? 'active' : ''
              }`}
            >
              <FileText size={15} />
              <span>Lost Reports ({myLost.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === 'found' ? 'active' : ''
              }`}
            >
              <FileCheck size={15} />
              <span>Found Reports ({myFound.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === 'claims' ? 'active' : ''
              }`}
            >
              <ShieldCheck size={15} />
              <span>Ownership Claims ({myClaims.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === 'notifications' ? 'active' : ''
              }`}
            >
              <Bell size={15} />
              <span>Notifications ({myNotifs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === 'profile' ? 'active' : ''
              }`}
            >
              <User size={15} />
              <span>Account Profile</span>
            </button>
          </div>

          {/* TAB 1: MY LOST REPORTS */}
          {activeTab === 'lost' && (
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="p-5 border-b border-navy-700/80 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">My Registered Lost Items</h3>
                <span className="text-xs text-slate-400">{myLost.length} items logged</span>
              </div>

              {myLost.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-navy-900/60 border-b border-navy-700">
                        <th className="table-header">Report ID</th>
                        <th className="table-header">Item</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Lost Location</th>
                        <th className="table-header">Date Lost</th>
                        <th className="table-header">Status</th>
                        <th className="table-header text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/50">
                      {myLost.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell font-mono text-xs text-electric-400 font-semibold">
                            {item.reportId || item.id}
                          </td>
                          <td className="table-cell font-medium text-white">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-9 h-9 rounded-lg object-cover border border-navy-600"
                              />
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell text-xs">{item.category}</td>
                          <td className="table-cell text-xs text-slate-300">{item.location}</td>
                          <td className="table-cell text-xs text-slate-400">{item.dateLost}</td>
                          <td className="table-cell">
                            <Badge status={item.status} />
                          </td>
                          <td className="table-cell text-right">
                            {item.status === 'active' && (
                              <button
                                onClick={() => handleWithdrawLost(item.id)}
                                className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
                              >
                                Withdraw
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={FileText}
                    title="No Lost Items Reported"
                    description="You have not submitted any lost property reports yet."
                    actionLabel="Report a Lost Item"
                    onAction={() => (window.location.href = '/report-lost')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY FOUND REPORTS */}
          {activeTab === 'found' && (
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="p-5 border-b border-navy-700/80 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">My Found Property Reports</h3>
                <span className="text-xs text-slate-400">{myFound.length} items registered</span>
              </div>

              {myFound.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-navy-900/60 border-b border-navy-700">
                        <th className="table-header">Report ID</th>
                        <th className="table-header">Item</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Found Location</th>
                        <th className="table-header">Storage Location</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/50">
                      {myFound.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell font-mono text-xs text-emerald-400 font-semibold">
                            {item.reportId || item.id}
                          </td>
                          <td className="table-cell font-medium text-white">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-9 h-9 rounded-lg object-cover border border-navy-600"
                              />
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {item.publicDescription || item.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell text-xs">{item.category}</td>
                          <td className="table-cell text-xs text-slate-300">{item.foundLocation}</td>
                          <td className="table-cell text-xs text-emerald-400 font-medium">
                            {item.storageLocation}
                          </td>
                          <td className="table-cell text-xs text-slate-400">{item.dateFound}</td>
                          <td className="table-cell">
                            <Badge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={FileCheck}
                    title="No Found Items Reported"
                    description="You have not submitted any found items yet."
                    actionLabel="Report a Found Item"
                    onAction={() => (window.location.href = '/report-found')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY CLAIMS */}
          {activeTab === 'claims' && (
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="p-5 border-b border-navy-700/80 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Ownership Verification Claims</h3>
                <span className="text-xs text-slate-400">{myClaims.length} active claims</span>
              </div>

              {myClaims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-navy-900/60 border-b border-navy-700">
                        <th className="table-header">Claim ID</th>
                        <th className="table-header">Target Item</th>
                        <th className="table-header">Match Score</th>
                        <th className="table-header">Submitted At</th>
                        <th className="table-header">Claim Status</th>
                        <th className="table-header">Admin Verification Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/50">
                      {myClaims.map((claim) => {
                        const foundItem = foundItems.find((f) => f.id === claim.foundItemId);
                        return (
                          <tr key={claim.id} className="table-row">
                            <td className="table-cell font-mono text-xs text-slate-300">
                              {claim.id}
                            </td>
                            <td className="table-cell font-semibold text-white">
                              {foundItem?.title || 'Found Property Listing'}
                            </td>
                            <td className="table-cell">
                              <span className="badge-purple font-mono font-bold text-xs">
                                {claim.matchScore || 85}% Match
                              </span>
                            </td>
                            <td className="table-cell text-xs text-slate-400">
                              {new Date(claim.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="table-cell">
                              <Badge status={claim.status} />
                            </td>
                            <td className="table-cell text-xs text-slate-300 max-w-xs">
                              {claim.adminNotes ? (
                                <span className="p-1.5 rounded bg-navy-900/80 border border-navy-700 block">
                                  {claim.adminNotes}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">
                                  Pending administrative review...
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={ShieldCheck}
                    title="No Claims Submitted"
                    description="You have not submitted any ownership claims for found items."
                    actionLabel="Explore Found Items"
                    onAction={() => (window.location.href = '/browse')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="card p-6 border-navy-700 bg-navy-800 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-navy-700">
                <h3 className="font-bold text-white text-base">Notification Inbox</h3>
                <button
                  onClick={() => markAllNotificationsRead(user?.id)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Mark All as Read
                </button>
              </div>

              {myNotifs.length > 0 ? (
                <div className="space-y-3">
                  {myNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                        n.read
                          ? 'bg-navy-900/40 border-navy-700/60 text-slate-400'
                          : 'bg-navy-900 border-electric-500/40 text-white shadow-md'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-electric-500/10 border border-electric-500/30 flex items-center justify-center flex-shrink-0 text-electric-400 mt-0.5">
                        <Bell size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">{n.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-electric-400 mt-2"></span>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No Notifications"
                  description="You are all caught up! Updates regarding your reports and claims will appear here."
                />
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="card p-6 border-navy-700 bg-navy-800 text-center lg:col-span-1">
                {user?.avatar && !String(user.avatar).includes('pravatar.cc') ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full mx-auto border-2 border-electric-500 shadow-glow mb-4 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-navy-900 border-2 border-electric-500 shadow-glow mb-4 flex items-center justify-center text-slate-400">
                    <User size={40} />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                <div className="mt-3 inline-block">
                  <Badge status="purple">{user?.role?.toUpperCase() || 'USER'}</Badge>
                </div>

                <div className="mt-6 pt-6 border-t border-navy-700/80 text-left space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap size={16} className="text-electric-400" />
                    <span>Student / Faculty ID:</span>
                    <strong className="text-white ml-auto">
                      {user?.studentId || 'VV22CS001'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building size={16} className="text-electric-400" />
                    <span>Department:</span>
                    <strong className="text-white ml-auto">
                      {user?.department || 'Computer Science'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-electric-400" />
                    <span>Phone:</span>
                    <strong className="text-white ml-auto">{user?.phone || '9876543210'}</strong>
                  </div>
                </div>
              </div>

              {/* Edit forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information Form */}
                <div className="card p-6 border-navy-700 bg-navy-800">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-electric-400" />
                    <span>Update Personal Information &amp; Avatar</span>
                  </h3>

                  {profileToast && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle size={15} />
                      <span>{profileToast}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl bg-navy-900/60 border border-navy-700">
                      {profileAvatar && !String(profileAvatar).includes('pravatar.cc') ? (
                        <img
                          src={profileAvatar}
                          alt="Avatar Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-electric-500/60 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-navy-800 border-2 border-electric-500/60 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <User size={28} />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <label className="label text-xs mb-0">Profile Photo (Optional)</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarFileChange}
                            />
                          </label>
                          {profileAvatar && (
                            <button
                              type="button"
                              onClick={() => setProfileAvatar('')}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition"
                            >
                              Remove Photo
                            </button>
                          )}
                          <input
                            type="text"
                            placeholder="Or paste image URL..."
                            className="input-field text-xs py-1.5 flex-1 min-w-[180px]"
                            value={profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="input-field text-sm"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Login Email Address *</label>
                        <input
                          type="email"
                          required
                          className="input-field text-sm"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Campus Member Type</label>
                        <select
                          className="select-field text-sm"
                          value={profileUserType}
                          onChange={(e) => setProfileUserType(e.target.value)}
                        >
                          <option value="Student">Student</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Staff">Staff</option>
                          <option value="Visitor">Visitor</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Student / Employee ID</label>
                        <input
                          type="text"
                          placeholder="e.g. VV22CS001"
                          className="input-field text-sm"
                          value={profileStudentId}
                          onChange={(e) => setProfileStudentId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Contact Phone</label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Department / Branch</label>
                        <input
                          type="text"
                          className="input-field text-sm"
                          value={profileDepartment}
                          onChange={(e) => setProfileDepartment(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="submit" className="btn-primary text-xs">
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className="card p-6 border-navy-700 bg-navy-800">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Key size={18} className="text-brand-purple" />
                    <span>Security & Password</span>
                  </h3>

                  {passwordToast && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle size={15} />
                      <span>{passwordToast}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="label">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input-field text-sm"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">New Password</label>
                        <input
                          type="password"
                          placeholder="Min 8 characters"
                          className="input-field text-sm"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="Repeat new password"
                          className="input-field text-sm"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="btn-secondary text-xs hover:border-brand-purple"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
