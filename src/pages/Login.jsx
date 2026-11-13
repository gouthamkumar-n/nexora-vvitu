import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Zap,
  Users,
  Shield,
  Crown,
  AlertCircle,
  Mail,
  CheckCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 'standard' = Shared login for Students, Faculty, Staff & Administrators
  // 'superadmin' = Dedicated portal for the top-level Super Administrator
  const [loginMode, setLoginMode] = useState('standard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');

  function switchMode(mode) {
    setLoginMode(mode);
    setError('');
    setShowForgot(false);
  }

  function validate() {
    if (!email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 4) return 'Password is too short.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = login(email.trim(), password, loginMode);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    // Automatically route based on authenticated role:
    // - superadmin -> /system (Super Admin Control Center)
    // - admin      -> /admin  (Administrator Dashboard)
    // - user       -> /dashboard (Student / User Dashboard)
    if (result.redirectTo) {
      navigate(result.redirectTo);
    } else if (result.role === 'superadmin') {
      navigate('/system');
    } else if (result.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  }

  function handleForgotSubmit(e) {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered campus email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Enter a valid email address.');
      return;
    }
    setForgotSent(true);
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-electric-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-electric-500/20 group-hover:scale-105 transition-transform">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">
              NEX<span className="text-electric-400">ORA</span>
            </span>
          </Link>
          <p className="text-slate-400 text-xs mt-1">VVITU College · Lost &amp; Found Portal</p>
        </div>

        {/* Portal Mode Switcher: Unified Campus Login vs Super Admin Portal */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-navy-800/90 border border-white/10 rounded-2xl mb-5 shadow-lg">
          <button
            type="button"
            onClick={() => switchMode('standard')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              loginMode === 'standard'
                ? 'bg-electric-500 text-white shadow-md shadow-electric-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={15} />
            <span>Campus Login</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('superadmin')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              loginMode === 'superadmin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown size={15} />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Main Card */}
        <div
          className={`card shadow-2xl transition-colors ${
            loginMode === 'superadmin'
              ? 'border border-purple-500/30 bg-navy-800/95'
              : 'border border-white/10'
          }`}
        >
          {/* Header Banner */}
          {loginMode === 'standard' ? (
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-400 text-[11px] font-semibold mb-2.5">
                <Shield size={12} />
                <span>Students, Faculty &amp; Administrators</span>
              </div>
              <h1 className="text-white font-bold text-2xl mb-1">Campus Sign In</h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enter your campus credentials. Administrators are automatically directed to the{' '}
                <span className="text-slate-200 font-medium">Administrator Console</span> and students/staff to the{' '}
                <span className="text-slate-200 font-medium">User Dashboard</span>.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-semibold mb-2.5">
                <Crown size={12} className="text-amber-400" />
                <span>Root System Authority</span>
              </div>
              <h1 className="text-white font-bold text-2xl mb-1">Super Admin Portal</h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                Restricted top-level access for the VVITU Super Administrator to appoint administrators, manage user privileges, and oversee system security.
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-xs mb-5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {!showForgot ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="label" htmlFor="login-email">
                  {loginMode === 'superadmin' ? 'Super Admin Email' : 'Campus Email Address'}
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder={
                    loginMode === 'superadmin'
                      ? 'Enter Super Admin email'
                      : 'name@vvitu.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotSent(false);
                      setForgotError('');
                      setForgotEmail(email);
                    }}
                    className="text-xs text-electric-400 hover:text-electric-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loginMode === 'superadmin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/25'
                    : 'btn-primary'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : loginMode === 'superadmin' ? (
                  <>
                    <Lock size={15} />
                    <span>Sign In as Super Admin</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Panel */
            <div>
              <button
                onClick={() => setShowForgot(false)}
                className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back to Sign In
              </button>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                  <p className="text-slate-300 text-sm mb-3">
                    Enter your institutional email address to receive password recovery instructions.
                  </p>
                  {forgotError && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2 text-sm">
                      <AlertCircle size={14} />
                      {forgotError}
                    </div>
                  )}
                  <div>
                    <label className="label" htmlFor="forgot-email">
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      className="input-field"
                      placeholder="you@vvitu.edu"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    Send Recovery Link
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Recovery Instructions Sent</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    If an account exists for <span className="text-white">{forgotEmail}</span>, a recovery link has been dispatched.
                  </p>
                  <button
                    onClick={() => setShowForgot(false)}
                    className="btn-secondary text-sm"
                  >
                    Return to Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Info & Registration Link */}
          {!showForgot && (
            <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
              {loginMode === 'standard' ? (
                <p className="text-center text-slate-400 text-sm">
                  Student or faculty without an account?{' '}
                  <Link
                    to="/register"
                    className="text-electric-400 hover:text-electric-300 font-semibold transition-colors"
                  >
                    Create Student / Staff Account
                  </Link>
                </p>
              ) : (
                <p className="text-center text-slate-400 text-xs">
                  Are you a Student or Campus Administrator?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('standard')}
                    className="text-electric-400 hover:text-electric-300 font-semibold transition-colors"
                  >
                    Switch to Campus Login
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
