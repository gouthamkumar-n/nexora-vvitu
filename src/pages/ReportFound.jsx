import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  MapPin,
  Calendar,
  CheckCircle,
  Archive,
  Building2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ImageUpload from '../components/ImageUpload';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES, CATEGORY_DEFAULT_IMAGES } from '../data/sampleData';

export default function ReportFound() {
  const { user } = useAuth();
  const { addFoundItem, locations, categories } = useApp();
  const activeCategories = categories?.length ? categories : ITEM_CATEGORIES;
  const activeLocations = locations?.length ? locations : CAMPUS_LOCATIONS;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdItem, setCreatedItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    color: '',
    foundLocation: '',
    dateFound: new Date().toISOString().split('T')[0],
    storageLocation: 'Main Block Admin Office',
    description: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.imageUrl) {
      errs.imageUrl = 'Please upload a picture of the found item so the owner can easily identify it.';
    }
    if (!formData.title.trim()) errs.title = 'Please enter the item name (e.g. Water Bottle, ID Card, Phone)';
    if (!formData.category) errs.category = 'Please choose a category';
    if (!formData.foundLocation) errs.foundLocation = 'Please select where you found it';
    if (!formData.storageLocation) errs.storageLocation = 'Please select the campus place where you are handing it over';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const imgUrl =
      formData.imageUrl ||
      CATEGORY_DEFAULT_IMAGES[formData.category] ||
      CATEGORY_DEFAULT_IMAGES['Other'];

    const summaryNote =
      formData.description.trim() ||
      `Found at ${formData.foundLocation} and handed over to ${formData.storageLocation}.`;

    const newItem = addFoundItem({
      title: formData.title.trim(),
      category: formData.category,
      brand: '',
      color: formData.color.trim() || 'Not specified',
      description: summaryNote,
      publicDescription: summaryNote,
      privateDetails: '',
      foundLocation: formData.foundLocation,
      dateFound: formData.dateFound || new Date().toISOString().split('T')[0],
      timeFound: new Date().toTimeString().slice(0, 5),
      storageLocation: formData.storageLocation,
      imageUrl: imgUrl,
      foundBy: user?.id || 'u1',
      foundByName: user?.name || 'Campus Member',
    });

    setCreatedItem(newItem);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      category: '',
      color: '',
      foundLocation: '',
      dateFound: new Date().toISOString().split('T')[0],
      storageLocation: 'Main Block Admin Office',
      description: '',
      imageUrl: '',
    });
    setErrors({});
    setCreatedItem(null);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <FileCheck size={14} />
              <span>Quick Found Item Upload &amp; Handover</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Upload Found Item
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Just upload a photo and basic item info before handing the item over to the Admin Desk — no detailed explanation needed.
            </p>
          </div>

          {!isSubmitted ? (
            <div className="card border-navy-700 bg-navy-800/90 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Photo Upload (Required so the lost person can visually identify it) */}
                <div>
                  <label className="label">1. Upload Picture of the Found Item *</label>
                  <ImageUpload
                    preview={formData.imageUrl}
                    onImageSelect={(url) => {
                      setFormData({ ...formData, imageUrl: url });
                      setErrors((p) => ({ ...p, imageUrl: '' }));
                    }}
                    label="Upload a clear photo of the item so the person who lost it can easily identify it"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.imageUrl}</p>
                  )}
                </div>

                {/* 2. Basic Item Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">2. What Item Did You Find? *</label>
                    <input
                      type="text"
                      placeholder="e.g. Black Umbrella, ID Card, Earbuds"
                      className="input-field"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setErrors((p) => ({ ...p, title: '' }));
                      }}
                    />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="label">Category *</label>
                    <select
                      className="select-field"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value });
                        setErrors((p) => ({ ...p, category: '' }));
                      }}
                    >
                      <option value="">Select Category</option>
                      {activeCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* 3. Where Found & Admin Handover Desk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">3. Where Was It Found? *</label>
                    <select
                      className="select-field"
                      value={formData.foundLocation}
                      onChange={(e) => {
                        setFormData({ ...formData, foundLocation: e.target.value });
                        setErrors((p) => ({ ...p, foundLocation: '' }));
                      }}
                    >
                      <option value="">Select Campus Location</option>
                      {activeLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    {errors.foundLocation && (
                      <p className="text-red-400 text-xs mt-1">{errors.foundLocation}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">4. Handed Over To (Collection Place) *</label>
                    <select
                      className="select-field"
                      value={formData.storageLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, storageLocation: e.target.value })
                      }
                    >
                      <option value="Main Block Admin Office">Main Block Admin Office</option>
                      <option value="Library Front Desk">Library Front Desk</option>
                      <option value="Campus Security Main Gate">Campus Security Main Gate</option>
                      <option value="Department / Lab Admin Desk">Department / Lab Admin Desk</option>
                    </select>
                    {errors.storageLocation && (
                      <p className="text-red-400 text-xs mt-1">{errors.storageLocation}</p>
                    )}
                  </div>
                </div>

                {/* Optional quick fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Color (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Black, Blue, Silver"
                      className="input-field"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label">Date Found</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="input-field"
                      value={formData.dateFound}
                      onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Short Note (Optional — Not Mandatory)</label>
                  <input
                    type="text"
                    placeholder="Optional note (e.g. found near 2nd row bench) — leave blank if not needed"
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/25 flex items-start gap-3">
                  <Archive className="text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">Simple Handover Process:</span> Upload this form and hand the item over to <strong className="text-emerald-400">{formData.storageLocation}</strong>. When the owner sees it on the website, they will come to that desk to verify and collect it.
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-navy-700">
                  <button
                    type="submit"
                    className="btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 text-sm shadow-glow w-full sm:w-auto justify-center"
                  >
                    <CheckCircle size={16} />
                    <span>Upload Found Item</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="card text-center p-8 sm:p-10 animate-fade-in max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle size={36} />
              </div>

              <div>
                <span className="badge-green text-xs mb-2">Report ID: {createdItem?.reportId}</span>
                <h2 className="text-2xl font-bold text-white mt-1">Found Item Uploaded!</h2>
                <p className="text-slate-300 text-sm mt-2">
                  Now simply hand over <strong>"{createdItem?.title}"</strong> to the administrator at:
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                  <Building2 size={16} />
                  <span>{createdItem?.storageLocation}</span>
                </div>
              </div>

              <div className="p-4 bg-navy-900/80 rounded-xl border border-navy-700 text-left text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Found At:</span>
                  <span className="font-semibold text-white">{createdItem?.foundLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kept At (Collection Desk):</span>
                  <span className="font-semibold text-emerald-400">{createdItem?.storageLocation}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/browse" className="btn-primary w-full sm:w-auto text-sm">
                  View in Campus Catalog
                </Link>
                <button
                  onClick={handleReset}
                  className="btn-secondary w-full sm:w-auto text-sm flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Upload Another Item</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
