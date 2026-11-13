import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar({ onMenuToggle }) {
  const { user, role, logout } = useAuth();
  const { notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Unread notifications for this user (or global if admin)
  const unreadCount = notifications.filter(
    (n) => (n.userId === user?.id || role === 'admin' || role === 'superadmin') && !n.read
  ).length;

  const routeTitles = {
    '/dashboard': 'Dashboard Overview',
    '/browse': 'Browse Lost & Found',
    '/report-lost': 'Report Lost Item',
    '/report-found': 'Report Found Item',
    '/ai-matching': 'AI Smart Match Engine',
    '/my-activity': 'My Activity & Records',
    '/admin': 'Administrator Analytics',
    '/admin/items': 'All Items Inventory & Management',
    '/admin/verification': 'Found & Taken Item Status Control',
    '/system': 'System Administration & Security',
  };

  const currentTitle = routeTitles[location.pathname] || 'VVITU Lost & Found';

  return (
    <>
      <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-xl border-b border-navy-700/80 px-4 sm:px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 border border-navy-700 transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-electric-400">
                  VVITU Campus
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs text-slate-400 capitalize">{role || 'general'} portal</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{currentTitle}</h1>
            </div>
          </div>

          {/* Right: Quick actions, notifications, user avatar */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Quick Browse button */}
            <Link
              to="/browse"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white border border-navy-700 hover:border-navy-600 text-xs font-medium transition"
            >
              <Search size={14} className="text-electric-400" />
              <span>Browse Catalog</span>
            </Link>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-navy-800/80 text-slate-300 hover:text-white border border-navy-700 hover:border-electric-500/50 hover:bg-navy-800 transition"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-electric-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-navy-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-navy-800 border border-transparent hover:border-navy-700 transition"
              >
                {user?.avatar && !String(user.avatar).includes('pravatar.cc') ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full border border-electric-500/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-navy-800 border border-electric-500/50 flex items-center justify-center text-slate-400">
                    <User size={16} />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white truncate max-w-[110px]">
                    {user?.name || 'Arjun Reddy'}
                  </p>
                  <p className="text-[10px] text-electric-400 capitalize">{role || 'user'}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-800 border border-navy-700 shadow-2xl z-50 p-2 animate-fade-in">
                    <div className="px-3 py-2 border-b border-navy-700/80 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-electric-500/20 text-electric-300 border border-electric-500/30">
                        {user?.department || 'VVITU College'}
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs font-medium">
                      <Link
                        to="/my-activity?tab=profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-electric-400 hover:text-white hover:bg-electric-500/15 transition"
                      >
                        <User size={15} className="text-electric-400" />
                        <span>Edit My Profile</span>
                      </Link>
                      <Link
                        to="/my-activity"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-700/70 transition"
                      >
                        <User size={15} className="text-slate-400" />
                        <span>My Activity & Records</span>
                      </Link>
                      <Link
                        to="/ai-matching"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-700/70 transition"
                      >
                        <Sparkles size={15} className="text-brand-purple" />
                        <span>AI Match Center</span>
                      </Link>
                      {(role === 'admin' || role === 'superadmin') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-700/70 transition"
                        >
                          <Shield size={15} className="text-electric-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-navy-700/80 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-medium transition"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification drawer */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        userId={user?.id}
      />
    </>
  );
}
