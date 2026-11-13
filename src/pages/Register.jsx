import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const USER_TYPES = ['Student', 'Faculty', 'Staff', 'Visitor'];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics',
  'Information Technology',
  'MBA',
  'MCA',
  'Other',
];

export default function Register() {
  const { users, addUser } = useApp();
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    studentId: '',
    department: '',
    phone: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Field updater ────────────────────────────────────────────────────────────
  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear individual field error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate() {
    const e = {};

    if (!form.name.trim()) e.name = 'Full name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    else if (users.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase()))
      e.email = 'An account with this email already exists. Please sign in instead.';

    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';

    if (!form.userType) e.userType = 'Please select a user type.';

    if (form.userType === 'Student' && !form.studentId.trim())
      e.studentId = 'Student ID is required for students.';

    if (!form.department) e.department = 'Please select your department.';

    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit Indian phone number.';

    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the Terms & Privacy Policy.';

    return e;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // Simulate async

    addUser({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: 'user',
      userType: form.userType,
      studentId: form.userType === 'Student' ? form.studentId.trim() : undefined,
      department: form.department,
      phone: form.phone.trim(),
      avatar: '',
    });

    setLoading(false);
    setSuccess(true);
  }

  // ── Password strength indicator ──────────────────────────────────────────────
  function getPasswordStrength(pw) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score <= 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' };
    if (score <= 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  }

  const strength = getPasswordStrength(form.password);

  // ── Success screen ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="card border border-white/10 shadow-2xl max-w-md w-full text-center py-10">
          {/* Animated checkmark */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center animate-pulse">
              <CheckCircle size={40} className="text-green-400" />
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Account Created!</h2>
          <p className="text-slate-400 text-sm mb-2">
            Welcome to NEXORA, <span className="text-white font-medium">{form.name}</span>!
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Your account has been created successfully. You can now sign in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary flex items-center justify-center gap-2">
              Login Now
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: '', email: '', password: '', confirmPassword: '',
                  userType: '', studentId: '', department: '', phone: '', agreeTerms: false,
                });
              }}
              className="btn-secondary"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Register Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 right-1/4 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-1/4 w-64 h-64 bg-electric-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-electric-500/20">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            NEX<span className="text-electric-400">ORA</span>
          </span>
          <p className="text-slate-500 text-xs mt-1">VVITU College · Lost &amp; Found</p>
        </div>

        {/* Card */}
        <div className="card border border-white/10 shadow-2xl">
          <h1 className="text-white font-bold text-2xl mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm mb-7">Join NEXORA — it's free for VVITU members.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="label" htmlFor="reg-name">Full Name <span className="text-red-400">*</span></label>
              <input
                id="reg-name"
                type="text"
                className={`input-field ${errors.name ? 'border-red-500/60 focus:border-red-500' : ''}`}
                placeholder="e.g. Arjun Reddy"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email Address <span className="text-red-400">*</span></label>
              <input
                id="reg-email"
                type="email"
                className={`input-field ${errors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
                placeholder="you@vvitu.edu"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && <FieldError msg={errors.email} />}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.password ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {form.password && strength && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-navy-700 rounded-full h-1">
                    <div className={`h-1 rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-slate-500">Strength: <span className="text-slate-300">{strength.label}</span></p>
                </div>
              )}
              {errors.password && <FieldError msg={errors.password} />}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label" htmlFor="reg-confirm">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field pr-11 ${errors.confirmPassword ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Passwords match
                </p>
              )}
              {errors.confirmPassword && <FieldError msg={errors.confirmPassword} />}
            </div>

            {/* User Type */}
            <div>
              <label className="label" htmlFor="reg-usertype">User Type <span className="text-red-400">*</span></label>
              <div className="relative">
                <select
                  id="reg-usertype"
                  className={`select-field ${errors.userType ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  value={form.userType}
                  onChange={(e) => set('userType', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select user type…</option>
                  {USER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {errors.userType && <FieldError msg={errors.userType} />}
            </div>

            {/* Student ID – conditional */}
            {form.userType === 'Student' && (
              <div>
                <label className="label" htmlFor="reg-studentid">
                  Student ID <span className="text-red-400">*</span>
                </label>
                <input
                  id="reg-studentid"
                  type="text"
                  className={`input-field ${errors.studentId ? 'border-red-500/60 focus:border-red-500' : ''}`}
                  placeholder="e.g. VV22CS001"
                  value={form.studentId}
                  onChange={(e) => set('studentId', e.target.value)}
                  disabled={loading}
                />
                {errors.studentId && <FieldError msg={errors.studentId} />}
              </div>
            )}

            {/* Department */}
            <div>
              <label className="label" htmlFor="reg-dept">Department <span className="text-red-400">*</span></label>
              <select
                id="reg-dept"
                className={`select-field ${errors.department ? 'border-red-500/60 focus:border-red-500' : ''}`}
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                disabled={loading}
              >
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <FieldError msg={errors.department} />}
            </div>

            {/* Phone */}
            <div>
              <label className="label" htmlFor="reg-phone">Phone Number <span className="text-red-400">*</span></label>
              <input
                id="reg-phone"
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-500/60 focus:border-red-500' : ''}`}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={loading}
                maxLength={10}
                autoComplete="tel"
              />
              {errors.phone && <FieldError msg={errors.phone} />}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.agreeTerms}
                    onChange={(e) => set('agreeTerms', e.target.checked)}
                    disabled={loading}
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                    ${form.agreeTerms
                      ? 'bg-electric-500 border-electric-500'
                      : errors.agreeTerms
                        ? 'border-red-500/60 bg-transparent'
                        : 'border-slate-500 bg-transparent group-hover:border-electric-400'
                    }`}
                  >
                    {form.agreeTerms && <CheckCircle size={10} className="text-white" />}
                  </div>
                </div>
                <span className="text-slate-300 text-sm leading-relaxed">
                  I agree to NEXORA's{' '}
                  <span className="text-electric-400 hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-electric-400 hover:underline cursor-pointer">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeTerms && <FieldError msg={errors.agreeTerms} />}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>
                  <User size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-electric-400 hover:text-electric-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helper: Field Error ───────────────────────────────────────────────────────
function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={12} className="flex-shrink-0" />
      {msg}
    </p>
  );
}
