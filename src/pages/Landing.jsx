import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Bell,
  Users,
  Lock,
  BarChart2,
  Search,
  MapPin,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react';

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-900/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-purple-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            NEX<span className="text-electric-400">ORA</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="btn-primary btn-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();
          const numericTarget = parseInt(String(target).replace(/\D/g, ''), 10);

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const displayTarget = String(target);
  const prefix = displayTarget.startsWith('<') ? '< ' : '';
  const hasPlus = displayTarget.includes('+');

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{hasPlus ? '+' : ''}{suffix}
    </span>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900 text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(59,130,246,0.12) 0%, transparent 60%), ' +
            'linear-gradient(180deg, #0f1729 0%, #0a0f1e 100%)',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Decorative blurred blobs */}
        <div className="absolute top-24 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 right-10 w-80 h-80 bg-electric-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8">
            <Star size={14} className="text-purple-400" />
            AI-Powered &bull; VVITU College
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Lost Today,{' '}
            <br />
            <span className="gradient-text">Found Tomorrow.</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            NEXORA uses AI-powered matching to reunite VVITU students and staff
            with their lost belongings — fast, secure, and effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn-secondary flex items-center gap-2 px-8 py-3 text-base"
            >
              Login to Account
            </Link>
          </div>

          {/* Stat Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            {[
              { label: '500+ Items Recovered', color: 'bg-electric-500/10 border-electric-500/30 text-electric-400' },
              { label: '95% Match Rate', color: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
              { label: '24hr Avg Recovery', color: 'bg-green-500/10 border-green-500/30 text-green-400' },
            ].map((pill) => (
              <div
                key={pill.label}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium ${pill.color}`}
              >
                <CheckCircle size={14} />
                {pill.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-electric-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="section-title">How NEXORA Works</h2>
            <p className="section-subtitle max-w-xl mx-auto mt-3">
              Three easy steps to get your belongings back — powered by AI.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-px border-t-2 border-dashed border-white/10" style={{ left: '20%', right: '20%' }} />

            {[
              {
                step: '01',
                icon: <Search size={28} className="text-electric-400" />,
                title: 'Report Lost or Found',
                desc: 'Submit a detailed report with photos, description, and campus location in under 2 minutes.',
                color: 'from-electric-500/20 to-blue-600/20',
                border: 'border-electric-500/30',
              },
              {
                step: '02',
                icon: <Sparkles size={28} className="text-purple-400" />,
                title: 'AI Matching Engine',
                desc: 'Our intelligent algorithm scores and ranks matches based on category, location, time, and description.',
                color: 'from-purple-500/20 to-pink-600/20',
                border: 'border-purple-500/30',
              },
              {
                step: '03',
                icon: <CheckCircle size={28} className="text-green-400" />,
                title: 'Verified Return',
                desc: 'Admin verifies the claim and coordinates a secure handoff. Item marked as returned.',
                color: 'from-green-500/20 to-teal-600/20',
                border: 'border-green-500/30',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                {/* Step number circle */}
                <div
                  className={`relative w-28 h-28 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} flex flex-col items-center justify-center mb-6 shadow-lg`}
                >
                  {item.icon}
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-navy-700 border border-white/20 flex items-center justify-center text-xs font-bold text-slate-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-electric-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Capabilities
            </p>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle max-w-xl mx-auto mt-3">
              Purpose-built for college campuses with security, speed, and smart AI at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles size={24} className="text-electric-400" />,
                title: 'AI Smart Matching',
                desc: 'Multi-factor scoring engine matches lost and found items with up to 95% accuracy.',
                bg: 'bg-electric-500/10',
                border: 'border-electric-500/20',
              },
              {
                icon: <ShieldCheck size={24} className="text-purple-400" />,
                title: 'Secure Verification',
                desc: 'Admin-verified claim process with proof-of-ownership to prevent fraud.',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20',
              },
              {
                icon: <Bell size={24} className="text-yellow-400" />,
                title: 'Real-time Notifications',
                desc: 'Get instant alerts when a match is found or your claim status changes.',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
              },
              {
                icon: <Users size={24} className="text-blue-400" />,
                title: 'Multi-Role Access',
                desc: 'Tailored dashboards for general users, campus admins, and super admins.',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
              },
              {
                icon: <Lock size={24} className="text-green-400" />,
                title: 'Privacy Protected',
                desc: 'Personal data is never exposed publicly. Contact is handled through the system.',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
              },
              {
                icon: <BarChart2 size={24} className="text-pink-400" />,
                title: 'Analytics Dashboard',
                desc: 'Campus admins get rich insights into recovery trends, hotspots, and performance.',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`card group hover:scale-[1.02] transition-transform duration-200 border ${feature.border}`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistics ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-navy-800 to-navy-800/60 p-10 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { target: '1200', suffix: '+', label: 'Reports Filed', color: 'text-electric-400' },
                { target: '850', suffix: '+', label: 'Items Returned', color: 'text-green-400' },
                { target: '98', suffix: '%', label: 'User Satisfaction', color: 'text-purple-400' },
                { target: '24', suffix: 'h', label: 'Avg Recovery Time', color: 'text-yellow-400' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className={`text-4xl font-extrabold mb-1 ${stat.color}`}>
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits for VVITU ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-navy-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <p className="text-electric-400 text-sm font-semibold uppercase tracking-widest mb-3">
                Built for VVITU
              </p>
              <h2 className="section-title mb-5">
                Transforming Campus Lost &amp; Found
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                NEXORA was designed specifically for VVITU College, understanding the unique
                challenges of a busy campus with thousands of students and staff.
              </p>
              <ul className="space-y-4">
                {[
                  'Campus-aware location tagging across all buildings',
                  'Role-based access for students, faculty, and security',
                  'Transparent audit trail for every item and claim',
                  'Zero data exposure — privacy-first by design',
                  'Mobile-friendly for on-the-go reporting',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-electric-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-electric-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link to="/register" className="btn-primary flex items-center gap-2 w-fit">
                  Join NEXORA Today
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Decorative Card Mockup */}
            <div className="relative flex items-center justify-center">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-electric-500/10 to-purple-600/10 rounded-3xl blur-2xl" />

              <div className="relative w-full max-w-sm space-y-3">
                {/* Match Card */}
                <div className="card border border-electric-500/30 bg-navy-800/80 backdrop-blur">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-electric-500/20 flex items-center justify-center">
                      <Sparkles size={18} className="text-electric-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">AI Match Found!</p>
                      <p className="text-slate-400 text-xs">Blue Samsung Galaxy S21</p>
                    </div>
                    <span className="ml-auto badge badge-green">92%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={12} />
                    Library Block • 2 hours ago
                  </div>
                </div>

                {/* Status Card */}
                <div className="card border border-purple-500/30 bg-navy-800/80 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">Claim #RPT-L-4821</span>
                    <span className="badge badge-yellow">Pending</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-1.5 mb-2">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-electric-500 to-purple-500 w-2/3" />
                  </div>
                  <p className="text-slate-400 text-xs">Admin verification in progress…</p>
                </div>

                {/* Success Card */}
                <div className="card border border-green-500/30 bg-navy-800/80 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Item Returned!</p>
                      <p className="text-slate-400 text-xs">Collected from Security Desk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl bg-gradient-to-br from-electric-500/15 via-purple-600/10 to-navy-800 border border-electric-500/20 p-12 shadow-2xl">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Never Lose Anything Again
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of VVITU students and staff already using NEXORA.
              It's free, fast, and intelligent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary flex items-center gap-2 px-8 py-3 text-base">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-navy-900 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-purple-600 flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                  NEX<span className="text-electric-400">ORA</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered Lost &amp; Found management for VVITU College. Smart, secure, and fast.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Dashboard', 'Report Lost', 'Report Found', 'AI Matching'].map((link) => (
                  <li key={link}>
                    <Link to="/login" className="text-slate-400 hover:text-electric-400 text-sm transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Sign In', to: '/login' },
                  { label: 'Register', to: '/register' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-slate-400 hover:text-electric-400 text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>support@vvitu.edu</li>
                <li>admin@vvitu.edu</li>
                <li>VVIT University, Guntur</li>
                <li>Andhra Pradesh, India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">
              &copy; 2024 NEXORA · VVITU College · All rights reserved.
            </p>
            <p className="text-slate-600 text-xs">
              Built for VVITU Hackathon &bull; AI-Powered Lost &amp; Found
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
