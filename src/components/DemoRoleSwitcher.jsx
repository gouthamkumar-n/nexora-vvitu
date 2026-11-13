import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, User, ShieldCheck, Crown, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  {
    key: 'user',
    label: 'General User',
    icon: User,
    badge: 'badge-blue',
    path: '/dashboard',
    desc: 'Student / Staff',
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    badge: 'badge-green',
    path: '/admin',
    desc: 'College Admin',
  },
  {
    key: 'superadmin',
    label: 'Super Admin',
    icon: Crown,
    badge: 'badge-purple',
    path: '/system',
    desc: 'System Manager',
  },
];

export default function DemoRoleSwitcher() {
  const { user, demoSwitch } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const currentRole = user?.role || 'user';
  const currentEntry = roles.find((r) => r.key === currentRole) || roles[0];
  const CurrentIcon = currentEntry.icon;

  const handleSwitch = async (role) => {
    if (role === currentRole) return;
    const target = roles.find((r) => r.key === role);
    if (demoSwitch) {
      await demoSwitch(role);
    }
    if (target) navigate(target.path);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      <div className="bg-navy-800 border border-yellow-500/40 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden min-w-[200px]">
        {/* Demo label bar */}
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 bg-yellow-500/15 cursor-pointer"
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex items-center gap-1.5">
            <FlaskConical size={13} className="text-yellow-400" />
            <span className="text-yellow-400 text-xs font-black tracking-widest uppercase">Demo Mode</span>
          </div>
          {collapsed ? (
            <ChevronUp size={13} className="text-yellow-400" />
          ) : (
            <ChevronDown size={13} className="text-yellow-400" />
          )}
        </div>

        {!collapsed && (
          <div className="p-3 flex flex-col gap-1.5">
            {/* Current role indicator */}
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <CurrentIcon size={14} className="text-slate-400" />
              <span className="text-xs text-slate-300">
                Current:{' '}
                <span className={`badge ${currentEntry.badge} text-xs`}>{currentEntry.label}</span>
              </span>
            </div>

            {/* Role buttons */}
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = role.key === currentRole;
              return (
                <button
                  key={role.key}
                  onClick={() => handleSwitch(role.key)}
                  disabled={isActive}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left w-full transition-all duration-150
                    ${isActive
                      ? 'bg-electric-500/20 border border-electric-500/40 cursor-default'
                      : 'hover:bg-navy-700 border border-transparent hover:border-white/10 cursor-pointer'
                    }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? 'text-electric-400' : 'text-slate-400'}
                  />
                  <div>
                    <p className={`text-xs font-semibold ${isActive ? 'text-electric-400' : 'text-slate-200'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                  {isActive && (
                    <span className="ml-auto text-electric-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
