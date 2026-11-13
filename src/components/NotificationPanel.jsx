import React, { useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, AlertCircle, Info, CheckCircle, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimeAgo, getNotificationColor } from '../services/notificationService';
import EmptyState from './EmptyState';

const typeIconMap = {
  match:   { Icon: Sparkles,     color: 'text-purple-400' },
  claim:   { Icon: CheckCircle,  color: 'text-green-400'  },
  update:  { Icon: Info,         color: 'text-blue-400'   },
  alert:   { Icon: AlertCircle,  color: 'text-red-400'    },
  system:  { Icon: Info,         color: 'text-slate-400'  },
};

// Sparkles inline since we can't use wildcard import
function Sparkles({ size = 18, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
    </svg>
  );
}

function NotificationIcon({ type }) {
  const entry = typeIconMap[type] || typeIconMap.system;
  const { Icon, color } = entry;
  return (
    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-navy-700 border border-white/10`}>
      <Icon size={16} className={color} />
    </div>
  );
}

export default function NotificationPanel({ isOpen, onClose, userId }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const panelRef = useRef(null);

  // Filter to this user's notifications
  const userNotifs = (notifications || [])
    .filter((n) => !n.userId || n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-navy-800 border-l border-white/10
          shadow-2xl flex flex-col transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-electric-400" />
            <span className="text-white font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-electric-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead && markAllNotificationsRead(userId)}
                className="btn-ghost btn-xs flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                All read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {userNotifs.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up! Check back later for updates on your items."
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {userNotifs.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markNotificationRead && markNotificationRead(n.id)}
                  className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors
                    ${n.isRead
                      ? 'hover:bg-white/5'
                      : 'bg-electric-500/5 hover:bg-electric-500/10 border-l-2 border-electric-500'
                    }`}
                >
                  <NotificationIcon type={n.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-snug ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-electric-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTimeAgo(n.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
