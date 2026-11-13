import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileX,
  MapPin,
  Calendar,
  Clock,
  Image as ImageIcon,
  Lock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Eye,
  Info,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, CATEGORY_DEFAULT_IMAGES } from '../data/sampleData';
import { findTopMatches, getConfidenceBadge } from '../services/matchingEngine';

// ─── Inline ImageUpload (lightweight, no dependency) ─────────────────────────
function ImageUpload({ value, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="border-2 border-dashed border-navy-600 hover:border-electric-500 rounded-xl transition-colors">
      <label className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer">
        {value ? (
          <img src={value} alt="Preview" className="max-h-40 rounded-lg object-cover" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center">
              <ImageIcon size={22} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-slate-300 text-sm font-medium">Click to upload image</p>
              <p className="text-slate-500 text-xs mt-1">JPG, PNG, WEBP – max 5 MB</p>
            </div>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
      {value && (
        <div className="text-center pb-3">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current, steps }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, idx) => {
        const done    = idx < current;
        const active  = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done    ? 'bg-emerald-500 text-white' :
                  active  ? 'bg-electric-500 text-white ring-4 ring-electric-500/25' :
                            'bg-navy-700 text-slate-400'
                }`}
              >
                {done ? <CheckCircle size={16} /> : idx + 1}
              </div>
              <p className={`mt-1.5 text-xs font-medium hidden sm:block whitespace-nowrap ${
                active ? 'text-electric-400' : done ? 'text-emerald-400' : 'text-slate-500'
              }`}>{label}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                done ? 'bg-emerald-500' : 'bg-navy-700'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

// ─── Review row ───────────────────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-navy-700 last:border-0">
      <span className="text-slate-400 text-sm w-32 flex-shrink-0">{label}</span>
      <span className="text-white text-sm break-words">{value}</span>
    </div>
  );
}

const STEPS = ['Item Details', 'Location & Time', 'Evidence & Submit'];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReportLost() {
  const { user } = useAuth();
  const { addLostItem, foundItems, locations, categories } = useApp();
  const navigate = useNavigate();
  const activeCategories = categories?.length ? categories : ITEM_CATEGORIES;
  const activeLocations = locations?.length ? locations : CAMPUS_LOCATIONS;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep]       = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [newItem, setNewItem] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '', category: '', brand: '', color: '',
    description: '', location: '', dateLost: '',
    timeLost: '', image: null, privateDetails: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  // ── Validation per step ──────────────────────────────────────────────────
  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.title.trim())           errs.title       = 'Item name is required.';
      if (!form.category)               errs.category    = 'Please select a category.';
      if (!form.color.trim())           errs.color       = 'Color is required.';
    }
    if (s === 1) {
      if (!form.location)               errs.location    = 'Please select a location.';
      if (!form.dateLost)               errs.dateLost    = 'Date lost is required.';
    }
    return errs;
  };

  const advance = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const finalImage =
      form.image ||
      CATEGORY_DEFAULT_IMAGES[form.category] ||
      CATEGORY_DEFAULT_IMAGES['Other'];

    const item = addLostItem({
      title:          form.title.trim(),
      category:       form.category,
      brand:          form.brand.trim() || null,
      color:          form.color.trim(),
      description:    form.description.trim(),
      location:       form.location,
      dateLost:       form.dateLost,
      timeLost:       form.timeLost || null,
      image:          finalImage,
      imageUrl:       finalImage,
      privateDetails: form.privateDetails.trim() || null,
      userId:         user.id,
      userName:       user.name,
    });
    setNewItem(item);
    setSubmitted(true);
  };

  // ── AI Matches after submit ──────────────────────────────────────────────
  const topMatches = useMemo(() => {
    if (!newItem) return [];
    return findTopMatches(newItem, foundItems, 3);
  }, [newItem, foundItems]);

  // Today's date string for max attribute
  const today = new Date().toISOString().split('T')[0];

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted && newItem) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="card text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Report Submitted!</h2>
            <p className="text-slate-400 mt-2">
              Your lost item report <span className="text-electric-400 font-mono">{newItem.reportId}</span> has been submitted.
            </p>
          </div>

          {topMatches.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-purple-400" />
                AI Found {topMatches.length} Potential Match{topMatches.length > 1 ? 'es' : ''}!
              </h3>
              <div className="space-y-3">
                {topMatches.map(({ foundItem, score, confidence }) => {
                  const badge = getConfidenceBadge(score);
                  return (
                    <div key={foundItem.id} className="card-sm flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{foundItem.title}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {foundItem.foundLocation}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-bold ${
                          badge.color === 'green' ? 'text-emerald-400' :
                          badge.color === 'amber' ? 'text-amber-400'   : 'text-red-400'
                        }`}>{score}%</p>
                        <p className="text-slate-500 text-xs">{badge.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/browse')}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Eye size={16} /> View Matches
            </button>
            <button
              onClick={() => {
                setForm({
                  title: '', category: '', brand: '', color: '',
                  description: '', location: '', dateLost: '',
                  timeLost: '', image: null, privateDetails: '',
                });
                setErrors({});
                setStep(0);
                setSubmitted(false);
                setNewItem(null);
              }}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <FileX size={20} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Report Lost Item</h1>
                <p className="text-slate-400 text-sm">Fill in the details to register your lost item</p>
              </div>
            </div>
          </div>

        {/* Step bar */}
        <div className="mb-8">
          <StepBar current={step} steps={STEPS} />
        </div>

        {/* Card */}
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-white border-b border-navy-700 pb-3">
            Step {step + 1}: {STEPS[step]}
          </h2>

          {/* ── Step 0: Item Details ─────────────────────────────────────── */}
          {step === 0 && (
            <>
              <Field label="Item Name" required error={errors.title}>
                <input
                  className="input-field"
                  placeholder="e.g. Samsung Galaxy S23"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
              </Field>

              <Field label="Category" required error={errors.category}>
                <select className="select-field" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category…</option>
                  {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Brand" error={errors.brand}>
                  <input
                    className="input-field"
                    placeholder="e.g. Samsung, Apple (optional)"
                    value={form.brand}
                    onChange={e => set('brand', e.target.value)}
                  />
                </Field>
                <Field label="Color" required error={errors.color}>
                  <input
                    className="input-field"
                    placeholder="e.g. Black, Blue/White"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Description (Optional)" error={errors.description}
                hint="Briefly describe your item if needed.">
                <textarea
                  className="input-field min-h-[85px] resize-y"
                  placeholder="Optional: Brief description of the item..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </Field>
            </>
          )}

          {/* ── Step 1: Location & Time ───────────────────────────────────── */}
          {step === 1 && (
            <>
              <Field label="Lost Location" required error={errors.location}>
                <select className="select-field" value={form.location} onChange={e => set('location', e.target.value)}>
                  <option value="">Select campus location…</option>
                  {activeLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date Lost" required error={errors.dateLost}>
                  <input
                    type="date"
                    className="input-field"
                    max={today}
                    value={form.dateLost}
                    onChange={e => set('dateLost', e.target.value)}
                  />
                </Field>
                <Field label="Approximate Time" error={errors.timeLost}>
                  <input
                    type="time"
                    className="input-field"
                    value={form.timeLost}
                    onChange={e => set('timeLost', e.target.value)}
                  />
                </Field>
              </div>

              <div className="rounded-xl bg-electric-500/10 border border-electric-500/20 p-4 flex gap-3">
                <Info size={16} className="text-electric-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm">
                  Being specific about the location and time significantly improves the AI matching accuracy.
                </p>
              </div>
            </>
          )}

          {/* ── Step 2: Photo & Submit ────────────────────────────────────── */}
          {step === 2 && (
            <>
              <Field label="Upload Item Photo (Optional)" error={errors.image}
                hint="A photo helps you and others visually identify your item.">
                <ImageUpload value={form.image} onChange={v => set('image', v)} />
              </Field>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong className="text-emerald-400">How Collection Works:</strong> When someone finds your item, they upload its picture and hand it over to a designated campus desk (such as the <strong>Main Block Admin Office</strong>). Once you spot your item on the website, simply go to that location where the Administrator will verify your sincerity offline and hand it over.
                </p>
              </div>

              {/* Review summary */}
              <div className="rounded-xl bg-navy-700/60 border border-navy-600 p-4">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Eye size={14} className="text-electric-400" /> Review Summary
                </h3>
                <ReviewRow label="Item Name"   value={form.title} />
                <ReviewRow label="Category"    value={form.category} />
                <ReviewRow label="Brand"       value={form.brand} />
                <ReviewRow label="Color"       value={form.color} />
                <ReviewRow label="Location"    value={form.location} />
                <ReviewRow label="Date Lost"   value={form.dateLost} />
                <ReviewRow label="Time"        value={form.timeLost} />
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2 border-t border-navy-700">
            {step > 0 && (
              <button onClick={back} className="btn-secondary flex items-center gap-2">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <button onClick={advance} className="btn-primary flex items-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle size={16} /> Submit Report
              </button>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
