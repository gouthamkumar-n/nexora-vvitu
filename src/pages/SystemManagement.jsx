import React, { useState } from 'react';
import {
  Users,
  Shield,
  MapPin,
  Tag,
  FileText,
  Settings,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { StorageService } from '../services/storageService';
import { CAMPUS_LOCATIONS as INITIAL_LOCATIONS, ITEM_CATEGORIES as INITIAL_CATEGORIES } from '../data/sampleData';

export default function SystemManagement() {
  const { user, updateUser: updateAuthSession } = useAuth();
  const {
    users,
    auditLogs,
    locations: appLocations,
    categories: appCategories,
    settings,
    updateUser,
    deleteUser,
    addUser,
    updateLocations,
    updateCategories,
    updateSettings,
    addAuditLog,
    clearAllInventory,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'admins' | 'locations' | 'categories' | 'logs' | 'settings' | 'security'

  // Locations & Categories synced with AppContext & LocalStorage
  const locations = appLocations?.length ? appLocations : INITIAL_LOCATIONS;
  const [newLocation, setNewLocation] = useState('');
  const categories = appCategories?.length ? appCategories : INITIAL_CATEGORIES;
  const [newCategory, setNewCategory] = useState('');

  // Admin creation modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Administration',
    phone: '',
  });
  const [adminError, setAdminError] = useState('');
  const [actionToast, setActionToast] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    systemName: settings?.systemName || 'NEXORA',
    contactEmail: settings?.contactEmail || 'lost-found@vvitu.edu',
    maxUploadSizeMB: settings?.maxUploadSizeMB || 5,
    sessionTimeoutMinutes: settings?.sessionTimeoutMinutes || 60,
  });
  const [settingsToast, setSettingsToast] = useState('');

  // Super Admin own credentials form
  const [superAdminForm, setSuperAdminForm] = useState({
    name: user?.name || 'Nukapothula Goutham Kumar',
    email: user?.email || 'nukapothulagouthamkumar@gmail.com',
    password: user?.password || 'Goutham@23',
  });
  const [superAdminToast, setSuperAdminToast] = useState('');

  // Search in audit logs
  const [logSearch, setLogSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(''), 3500);
  };

  // Handlers
  const handleToggleUserStatus = (u) => {
    const nextState = u.isActive === false ? true : false;
    updateUser(u.id, { isActive: nextState });
    addAuditLog({
      action: 'USER_STATUS_TOGGLED',
      userId: user?.id || 'superadmin',
      userName: user?.name || 'Super Admin',
      targetId: u.id,
      targetType: 'user',
      details: `${nextState ? 'Activated' : 'Deactivated'} user account ${u.email}`,
    });
    showToast(`${u.name} (${u.email}) has been ${nextState ? 'activated' : 'suspended'}.`);
  };

  const handleDeleteUser = (u) => {
    if (u.id === user?.id) {
      showToast('You cannot delete your own currently logged-in Super Admin account.');
      return;
    }
    if (window.confirm(`Permanently remove account "${u.name}" (${u.email}) from the system?`)) {
      deleteUser(u.id);
      addAuditLog({
        action: 'USER_DELETED',
        userId: user?.id || 'superadmin',
        userName: user?.name || 'Super Admin',
        targetId: u.id,
        targetType: 'user',
        details: `Deleted account ${u.name} (${u.email})`,
      });
      showToast(`Account "${u.name}" (${u.email}) has been permanently removed.`);
    }
  };

  const handleChangeRole = (userId, newRole) => {
    const targetUser = users.find((u) => u.id === userId);
    updateUser(userId, {
      role: newRole,
      userType: newRole === 'admin' ? 'Staff' : targetUser?.userType || 'Student',
    });
    addAuditLog({
      action: 'ROLE_MODIFIED',
      userId: user?.id || 'superadmin',
      userName: user?.name || 'Super Admin',
      targetId: userId,
      targetType: 'user',
      details: `Modified role for ${targetUser?.email || userId} to ${newRole.toUpperCase()}`,
    });
    showToast(
      newRole === 'admin'
        ? `Granted Administrator access to ${targetUser?.name || 'user'}. They will now log in directly to the Admin Dashboard.`
        : `Updated ${targetUser?.name || 'user'} role to ${newRole.toUpperCase()}.`
    );
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    setAdminError('');
    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      setAdminError('Full name and email address are required.');
      return;
    }
    if (!adminForm.password || adminForm.password.length < 6) {
      setAdminError('Please set a login password of at least 6 characters.');
      return;
    }
    const normalizedEmail = adminForm.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      setAdminError('A user with this email already exists. You can grant them Admin access from the User Directory.');
      return;
    }

    addUser({
      name: adminForm.name.trim(),
      email: normalizedEmail,
      password: adminForm.password,
      role: 'admin',
      userType: 'Staff',
      department: adminForm.department || 'Administration',
      phone: adminForm.phone.trim(),
      avatar: '',
    });

    addAuditLog({
      action: 'ADMIN_CREATED',
      userId: user?.id || 'superadmin',
      userName: user?.name || 'Super Admin',
      targetId: null,
      targetType: 'user',
      details: `Created new administrator account for ${adminForm.name.trim()} (${normalizedEmail})`,
    });

    setIsAdminModalOpen(false);
    showToast(`Administrator account created for ${adminForm.name.trim()} (${normalizedEmail}). They can now log in via Campus Login.`);
    setAdminForm({ name: '', email: '', password: '', department: 'Administration', phone: '' });
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    if (!locations.includes(newLocation.trim())) {
      updateLocations([...locations, newLocation.trim()]);
      showToast(`Added "${newLocation.trim()}" to campus locations.`);
    }
    setNewLocation('');
  };

  const handleRemoveLocation = (loc) => {
    updateLocations(locations.filter((l) => l !== loc));
    showToast(`Removed "${loc}" from campus locations.`);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (!categories.includes(newCategory.trim())) {
      updateCategories([...categories, newCategory.trim()]);
      showToast(`Added "${newCategory.trim()}" to item categories.`);
    }
    setNewCategory('');
  };

  const handleRemoveCategory = (cat) => {
    updateCategories(categories.filter((c) => c !== cat));
    showToast(`Removed "${cat}" from item categories.`);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsToast('Configuration settings persisted successfully!');
    setTimeout(() => setSettingsToast(''), 3000);
  };

  const handleSaveSuperAdminCredentials = (e) => {
    e.preventDefault();
    if (!superAdminForm.email.trim() || !superAdminForm.password || superAdminForm.password.length < 6) {
      return;
    }
    const targetId = user?.id || 'super1';
    const changes = {
      name: superAdminForm.name.trim(),
      email: superAdminForm.email.trim().toLowerCase(),
      password: superAdminForm.password,
      customCredentials: true,
    };
    updateUser(targetId, changes);
    updateAuthSession(changes);
    addAuditLog({
      action: 'SUPERADMIN_CREDENTIALS_UPDATED',
      userId: targetId,
      userName: changes.name,
      targetId,
      targetType: 'user',
      details: `Updated Super Admin login email to ${changes.email}`,
    });
    setSuperAdminToast('Super Admin login email & password updated!');
    setTimeout(() => setSuperAdminToast(''), 3500);
  };

  const handleClearSampleItems = () => {
    if (
      window.confirm(
        'Clear all Lost Items, Found Items, and Claims to start with a clean inventory for daily campus use? (All User & Administrator accounts will be preserved.)'
      )
    ) {
      clearAllInventory();
      addAuditLog({
        action: 'INVENTORY_CLEARED',
        userId: user?.id || 'superadmin',
        userName: user?.name || 'Super Admin',
        targetId: null,
        targetType: 'system',
        details: 'Cleared all sample/existing inventory items to start fresh for daily campus operations.',
      });
      showToast('All inventory items and claims cleared! Ready for live daily reports.');
    }
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        'WARNING: This will restore all initial sample items, claims, and default accounts. Continue?'
      )
    ) {
      StorageService.reset();
      window.location.reload();
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.userName?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action?.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light text-xs font-semibold mb-2">
                <Shield size={14} />
                <span>Super Administrator Privilege Mode</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                System Administration & Security
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage accounts, configure campus master records, inspect audit trails, and maintain
                system parameters.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {actionToast && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2.5 shadow-lg">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>{actionToast}</span>
            </div>
          )}

          <div className="flex overflow-x-auto scrollbar-hidden gap-2 p-1.5 bg-navy-800 rounded-2xl border border-navy-700 max-w-full">
            {[
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'admins', label: 'Administrators', icon: Shield },
              { id: 'locations', label: 'Campus Locations', icon: MapPin },
              { id: 'categories', label: 'Item Categories', icon: Tag },
              { id: 'logs', label: 'Security Audit Logs', icon: FileText },
              { id: 'settings', label: 'General Settings', icon: Settings },
              { id: 'security', label: 'Security Health', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-white text-base">Campus User Directory</h3>
                <div className="relative w-full sm:w-64">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="input-field pl-8 py-1.5 text-xs"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-navy-900/80 border-b border-navy-700">
                      <th className="table-header">User</th>
                      <th className="table-header">Email Address</th>
                      <th className="table-header">Type / Department</th>
                      <th className="table-header">Assigned Role</th>
                      <th className="table-header">Status</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-700/50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2.5">
                            {u.avatar && !String(u.avatar).includes('pravatar.cc') ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full border border-navy-600 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-navy-900 border border-navy-600 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Users size={14} />
                              </div>
                            )}
                            <span className="font-semibold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-slate-300 font-mono">{u.email}</td>
                        <td className="table-cell text-slate-400">
                          {u.userType || 'Student'} • {u.department || 'General'}
                        </td>
                        <td className="table-cell">
                          <select
                            className="bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-xs text-white"
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="admin">Administrator</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${
                              u.isActive !== false ? 'badge-green' : 'badge-red'
                            }`}
                          >
                            {u.isActive !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role === 'user' && (
                              <button
                                onClick={() => handleChangeRole(u.id, 'admin')}
                                className="px-2.5 py-1 rounded text-[11px] font-semibold bg-electric-500/15 text-electric-400 border border-electric-500/30 hover:bg-electric-500/25 transition flex items-center gap-1"
                                title="Grant Administrator Dashboard Access"
                              >
                                <UserCheck size={12} />
                                <span>Grant Admin</span>
                              </button>
                            )}
                            {u.role === 'admin' && (
                              <button
                                onClick={() => handleChangeRole(u.id, 'user')}
                                className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition flex items-center gap-1"
                                title="Revoke Administrator Access back to Student/User"
                              >
                                <UserX size={12} />
                                <span>Revoke Admin</span>
                              </button>
                            )}
                            {u.id !== user?.id && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                                    u.isActive !== false
                                      ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  {u.isActive !== false ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                                  title="Delete Account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADMINISTRATORS */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">College Administrative Staff</h3>
                  <p className="text-xs text-slate-400">
                    Personnel authorized to review item reports and conduct claim verifications.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Create Administrator</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users
                  .filter((u) => u.role === 'admin' || u.role === 'superadmin')
                  .map((adm) => (
                    <div
                      key={adm.id}
                      className="card p-5 border-navy-700 bg-navy-800 flex items-start gap-4"
                    >
                      {adm.avatar && !String(adm.avatar).includes('pravatar.cc') ? (
                        <img
                          src={adm.avatar}
                          alt={adm.name}
                          className="w-12 h-12 rounded-full border border-electric-500/50 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-navy-900 border border-electric-500/50 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Shield size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{adm.name}</h4>
                          <Badge status={adm.role === 'superadmin' ? 'purple' : 'blue'}>
                            {adm.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{adm.email}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Dept: <strong className="text-slate-300">{adm.department || 'Admin'}</strong>
                        </p>
                        {adm.role === 'admin' && (
                          <div className="mt-3 pt-2.5 border-t border-navy-700 flex items-center gap-2">
                            <button
                              onClick={() => handleChangeRole(adm.id, 'user')}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 transition flex items-center gap-1"
                            >
                              <UserX size={12} />
                              <span>Revoke Admin</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: CAMPUS LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="card p-6 border-navy-700 bg-navy-800 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">VVITU Campus Locations</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Designated zones used in lost/found intake dropdowns across the application.
                </p>
              </div>

              <form onSubmit={handleAddLocation} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. New Research Wing, North Cafeteria"
                  className="input-field text-xs py-2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <button type="submit" className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Plus size={14} />
                  <span>Add Location</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className="p-3 bg-navy-900 rounded-xl border border-navy-700 flex items-center justify-between text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-electric-400" />
                      <span>{loc}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveLocation(loc)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ITEM CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="card p-6 border-navy-700 bg-navy-800 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">Item Taxonomy Categories</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard classification labels used for filtering and weighted AI matching.
                </p>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Scientific Calculators, Musical Instruments"
                  className="input-field text-xs py-2"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="submit" className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="p-3 bg-navy-900 rounded-xl border border-navy-700 flex items-center justify-between text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-brand-purple" />
                      <span>{cat}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">Complete Audit Trail</h3>
                  <p className="text-xs text-slate-400">
                    Immutable event ledger of all system interactions, logins, and status changes.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="input-field pl-8 py-1.5 text-xs"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-navy-900/80 border-b border-navy-700">
                      <th className="table-header">Timestamp</th>
                      <th className="table-header">Action Code</th>
                      <th className="table-header">Initiated By</th>
                      <th className="table-header">Details Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-700/50">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="table-row">
                        <td className="table-cell font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="table-cell">
                          <span className="badge-purple font-mono font-semibold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="table-cell text-slate-300 font-medium">
                          {log.userName || 'System'}
                        </td>
                        <td className="table-cell text-slate-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card p-6 border-navy-700 bg-navy-800 max-w-2xl space-y-6">
              <div>
                <h3 className="font-bold text-white text-base">System Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Campus-wide application parameters and institutional identity.
                </p>
              </div>

              {settingsToast && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle size={15} />
                  <span>{settingsToast}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="label">Application Brand Name</label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    value={settingsForm.systemName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, systemName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label">Official Lost & Found Department Email</label>
                  <input
                    type="email"
                    className="input-field text-xs"
                    value={settingsForm.contactEmail}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Max Image Upload Limit (MB)</label>
                    <input
                      type="number"
                      className="input-field text-xs"
                      value={settingsForm.maxUploadSizeMB}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          maxUploadSizeMB: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="label">Session Timeout (Minutes)</label>
                    <input
                      type="number"
                      className="input-field text-xs"
                      value={settingsForm.sessionTimeoutMinutes}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          sessionTimeoutMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-700 flex justify-end">
                  <button type="submit" className="btn-primary text-xs">
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Super Admin Login Credentials Form */}
              <div className="pt-6 border-t border-navy-700 space-y-4">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Lock size={15} className="text-brand-purple" />
                    <span>Super Admin Login Credentials</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Change the email address, display name, and password used to sign in on the Super Admin portal tab.
                  </p>
                </div>

                {superAdminToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle size={15} />
                    <span>{superAdminToast}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSuperAdminCredentials} className="space-y-4 text-xs">
                  <div>
                    <label className="label">Super Admin Name</label>
                    <input
                      type="text"
                      required
                      className="input-field text-xs"
                      value={superAdminForm.name}
                      onChange={(e) =>
                        setSuperAdminForm({ ...superAdminForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Super Admin Login Email</label>
                      <input
                        type="email"
                        required
                        className="input-field text-xs"
                        value={superAdminForm.email}
                        onChange={(e) =>
                          setSuperAdminForm({ ...superAdminForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Super Admin Password (min 6 chars)</label>
                      <input
                        type="text"
                        required
                        minLength={6}
                        className="input-field text-xs font-mono"
                        value={superAdminForm.password}
                        onChange={(e) =>
                          setSuperAdminForm({ ...superAdminForm, password: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary text-xs">
                      Update Super Admin Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 border-navy-700 bg-navy-800 text-center">
                  <span className="text-3xl font-mono font-extrabold text-emerald-400">100%</span>
                  <p className="text-xs text-slate-300 font-semibold mt-1">Audit Trail Integrity</p>
                  <p className="text-[11px] text-slate-500 mt-1">All events timestamped</p>
                </div>

                <div className="card p-5 border-navy-700 bg-navy-800 text-center">
                  <span className="text-3xl font-mono font-extrabold text-electric-400">0</span>
                  <p className="text-xs text-slate-300 font-semibold mt-1">Failed Auth Breaches</p>
                  <p className="text-[11px] text-slate-500 mt-1">Simulated intrusion lock</p>
                </div>

                <div className="card p-5 border-navy-700 bg-navy-800 text-center">
                  <span className="text-3xl font-mono font-extrabold text-brand-purple">
                    {users.length}
                  </span>
                  <p className="text-xs text-slate-300 font-semibold mt-1">Active Campus Profiles</p>
                  <p className="text-[11px] text-slate-500 mt-1">RBAC validated</p>
                </div>
              </div>

              {/* Data Reset Danger Zone */}
              <div className="card p-6 border-red-500/30 bg-red-500/5 space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle size={22} />
                  <h3 className="font-bold text-white text-base">
                    System Database Reset (Danger Zone)
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Manage campus inventory state. You can clear all sample/existing items to begin with an empty inventory for daily operations (preserving all users &amp; administrators), or restore initial campus seed records.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleClearSampleItems}
                    className="btn-primary text-xs flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Clear All Items (Start Fresh for Daily Use)</span>
                  </button>
                  <button
                    onClick={handleResetDemoData}
                    className="btn-danger text-xs flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Restore Initial Seed Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CREATE ADMIN MODAL */}
          <Modal
            isOpen={isAdminModalOpen}
            onClose={() => {
              setIsAdminModalOpen(false);
              setAdminError('');
            }}
            title="Create Administrator Account"
            size="md"
          >
            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              {adminError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="input-field text-xs"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Campus Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@vvitu.edu"
                  className="input-field text-xs"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Initial Login Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters (used on Campus Login)"
                  className="input-field text-xs"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This administrator will sign in on the standard Campus Login page and be automatically routed to the Administrator Dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Department</label>
                  <input
                    type="text"
                    className="input-field text-xs"
                    value={adminForm.department}
                    onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    className="input-field text-xs"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-navy-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setAdminError('');
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Grant Access &amp; Create Admin
                </button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
