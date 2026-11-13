import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  FileCheck,
  Sparkles,
  User,
  Package,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Shield,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Badge from './Badge';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Items', path: '/browse', icon: Search },
    { name: 'Report Lost', path: '/report-lost', icon: PlusCircle },
    { name: 'Report Found', path: '/report-found', icon: FileCheck },
    { name: 'AI Matching', path: '/ai-matching', icon: Sparkles },
    { name: 'My Profile & Activity', path: '/my-activity?tab=profile', icon: User },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Item Management', path: '/admin/items', icon: Package },
    { name: 'Found / Taken Status', path: '/admin/verification', icon: ShieldCheck },
    { name: 'Browse Items', path: '/browse', icon: Search },
    { name: 'AI Matching', path: '/ai-matching', icon: Sparkles },
    { name: 'My Profile & Activity', path: '/my-activity?tab=profile', icon: User },
  ];

  const superAdminNav = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Item Management', path: '/admin/items', icon: Package },
    { name: 'Found / Taken Status', path: '/admin/verification', icon: ShieldCheck },
    { name: 'System Settings', path: '/system', icon: Settings },
    { name: 'Browse Items', path: '/browse', icon: Search },
    { name: 'AI Matching', path: '/ai-matching', icon: Sparkles },
    { name: 'My Profile & Activity', path: '/my-activity?tab=profile', icon: User },
  ];

  let currentNav = userNav;
  if (role === 'admin') currentNav = adminNav;
  if (role === 'superadmin') currentNav = superAdminNav;

  const roleLabel =
    role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Administrator' : 'Student / Faculty';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-800/95 backdrop-blur-xl border-r border-navy-700 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-navy-700/80">
            <Link to="/" onClick={onClose} className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Role pill indicator */}
          <div className="px-5 py-3 bg-navy-900/40 border-b border-navy-700/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              {role === 'superadmin' ? (
                <Award size={13} className="text-brand-purple" />
              ) : role === 'admin' ? (
                <Shield size={13} className="text-electric-400" />
              ) : (
                <User size={13} className="text-emerald-400" />
              )}
              {roleLabel}
            </span>
            <Badge status={role === 'superadmin' ? 'purple' : role === 'admin' ? 'blue' : 'active'}>
              {role || 'user'}
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} className="transition-transform group-hover:scale-110" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout at bottom */}
        <div className="p-4 border-t border-navy-700 bg-navy-900/60">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar && !String(user.avatar).includes('pravatar.cc') ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full border border-electric-500/40 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy-800 border border-electric-500/40 flex items-center justify-center text-slate-400 flex-shrink-0">
                <User size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'user@vvitu.edu'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-navy-700/60 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-navy-600/60 hover:border-red-500/30 text-xs font-semibold transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
