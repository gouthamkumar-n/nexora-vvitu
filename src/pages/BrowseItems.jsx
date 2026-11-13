import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Eye,
  X,
  FileQuestion,
  AlertTriangle,
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../data/sampleData';

export default function BrowseItems() {
  const { user, isAdmin } = useAuth();
  const { lostItems, foundItems, locations, categories, updateLostItem, updateFoundItem, addAuditLog } = useApp();
  const activeCategories = categories?.length ? categories : ITEM_CATEGORIES;
  const activeLocations = locations?.length ? locations : CAMPUS_LOCATIONS;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('found'); // default to 'found' so lost persons immediately see uploaded found items & photos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isSuspiciousModalOpen, setIsSuspiciousModalOpen] = useState(false);

  // Suspicious report state
  const [suspiciousReason, setSuspiciousReason] = useState('');
  const [suspiciousSuccess, setSuspiciousSuccess] = useState(false);

  // Filter items
  const currentList = activeTab === 'lost' ? lostItems : foundItems;

  const filteredItems = useMemo(() => {
    return currentList.filter((item) => {
      // Exclude returned/archived from general browse if desired, or show all
      const matchesSearch =
        !searchTerm.trim() ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !selectedCategory || item.category === selectedCategory;

      const loc = activeTab === 'lost' ? item.location : item.foundLocation;
      const matchesLocation = !selectedLocation || loc === selectedLocation;

      const dateField = activeTab === 'lost' ? item.dateLost : item.dateFound;
      const matchesDate = !selectedDate || dateField === selectedDate;

      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });
  }, [currentList, searchTerm, selectedCategory, selectedLocation, selectedDate, activeTab]);

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenCollectInfo = (item) => {
    setSelectedItem(item);
    setIsCollectModalOpen(true);
  };

  const handleAdminToggleStatus = (item) => {
    const isCurrentlyTaken = item.status === 'returned' || item.status === 'taken';
    const nextStatus = isCurrentlyTaken ? 'active' : 'returned';
    if (activeTab === 'lost') {
      updateLostItem(item.id, { status: nextStatus });
    } else {
      updateFoundItem(item.id, { status: nextStatus });
    }
    if (selectedItem?.id === item.id) {
      setSelectedItem((prev) => ({ ...prev, status: nextStatus }));
    }
    addAuditLog({
      action: 'ITEM_STATUS_UPDATED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: item.id,
      targetType: activeTab === 'lost' ? 'lost_item' : 'found_item',
      details: `Changed status of "${item.title}" to ${nextStatus === 'returned' ? 'Taken (Handed Over)' : 'Found (At Desk)'}`,
    });
  };

  const handleReportSuspicious = (e) => {
    e.preventDefault();
    if (!suspiciousReason.trim()) return;

    if (activeTab === 'lost') {
      updateLostItem(selectedItem.id, { status: 'suspicious' });
    } else {
      updateFoundItem(selectedItem.id, { status: 'suspicious' });
    }

    addAuditLog({
      action: 'ITEM_FLAGGED',
      userId: user?.id || 'guest',
      userName: user?.name || 'Reporter',
      targetId: selectedItem.id,
      targetType: activeTab === 'lost' ? 'lost_item' : 'found_item',
      details: `Item flagged as suspicious: ${suspiciousReason}`,
    });

    setSuspiciousSuccess(true);
    setTimeout(() => {
      setIsSuspiciousModalOpen(false);
      setIsDetailOpen(false);
      setSuspiciousSuccess(false);
      setSuspiciousReason('');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Campus Item Directory
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time registry of all lost & found belongings on VVITU campus.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1 bg-navy-800 rounded-xl border border-navy-700">
              <button
                onClick={() => {
                  setActiveTab('lost');
                  setVisibleCount(9);
                }}
                className={`tab-button flex items-center gap-2 ${
                  activeTab === 'lost' ? 'active' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Lost Reports ({lostItems.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('found');
                  setVisibleCount(9);
                }}
                className={`tab-button flex items-center gap-2 ${
                  activeTab === 'found' ? 'active' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Found Items ({foundItems.length})</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="card p-4 sm:p-5 mb-8 bg-navy-800/80 border-navy-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative md:col-span-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search item, brand, notes..."
                  className="input-field pl-9 py-2.5 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div>
                <select
                  className="select-field py-2.5 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories ({activeCategories.length})</option>
                  {activeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location filter */}
              <div>
                <select
                  className="select-field py-2.5 text-sm"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All VVITU Locations</option>
                  {activeLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input-field py-2.5 text-sm flex-1"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {(selectedCategory || selectedLocation || selectedDate || searchTerm) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSelectedLocation('');
                      setSelectedDate('');
                    }}
                    className="btn-secondary px-3 py-2 text-xs whitespace-nowrap"
                    title="Reset Filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Filter tags feedback */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-navy-700/60">
              <span>
                Showing <strong className="text-white">{displayedItems.length}</strong> of{' '}
                <strong className="text-white">{filteredItems.length}</strong> listings
              </span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Filter size={13} />
                <span>Filters Active</span>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {displayedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    type={activeTab}
                    onView={() => handleOpenDetail(item)}
                    onClaim={activeTab === 'found' ? () => handleOpenCollectInfo(item) : undefined}
                    isAdmin={isAdmin}
                    onToggleStatus={handleAdminToggleStatus}
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              {visibleCount < filteredItems.length && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="btn-secondary px-8 py-3 text-sm font-semibold hover:border-electric-500 shadow-lg"
                  >
                    Load More Items ({filteredItems.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={FileQuestion}
              title="No Listings Found"
              description="No reports match your current search and filter criteria. Try adjusting keywords or clearing filters."
              actionLabel="Clear All Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLocation('');
                setSelectedDate('');
              }}
            />
          )}

          {/* ITEM DETAIL MODAL */}
          <Modal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title={selectedItem?.title || 'Item Details'}
            size="lg"
          >
            {selectedItem && (
              <div className="space-y-6">
                {/* Image and Badges */}
                <div className="relative h-60 rounded-xl overflow-hidden bg-navy-950 border border-navy-700">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`badge font-bold text-xs ${
                        activeTab === 'lost' ? 'badge-red' : 'badge-green'
                      }`}
                    >
                      {activeTab === 'lost' ? 'LOST REPORT' : 'FOUND ITEM'}
                    </span>
                    <Badge status={selectedItem.status} />
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300">
                    ID: {selectedItem.reportId || selectedItem.id}
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-navy-900/70 p-4 rounded-xl border border-navy-700">
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="font-semibold text-white">{selectedItem.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Brand</span>
                    <span className="font-semibold text-white">
                      {selectedItem.brand || 'Unbranded / Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Primary Color</span>
                    <span className="font-semibold text-white">{selectedItem.color}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {activeTab === 'lost' ? 'Lost Location' : 'Found Location'}
                    </span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <MapPin size={13} className="text-electric-400" />
                      {selectedItem.location || selectedItem.foundLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date Reported</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Calendar size={13} className="text-slate-400" />
                      {selectedItem.dateLost || selectedItem.dateFound}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Collection Place (Kept At)</span>
                    <span className="font-semibold text-emerald-400">
                      {selectedItem.storageLocation || 'Main Block Admin Office'}
                    </span>
                  </div>
                </div>

                {/* Collection Instructions for Found Items */}
                {activeTab === 'found' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <MapPin size={15} />
                      <span>Handover &amp; Collection Location: {selectedItem.storageLocation || 'Main Block Admin Office'}</span>
                    </div>
                    <p className="leading-relaxed">
                      If this is your item, please go directly to{' '}
                      <strong className="text-white">
                        {selectedItem.storageLocation || 'Main Block Admin Office'}
                      </strong>{' '}
                      on campus. The Administrator will verify your sincerity in person (offline) and hand over the item.
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Item Notes
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-navy-900/40 p-3.5 rounded-xl border border-navy-700/60">
                    {selectedItem.description ||
                      selectedItem.publicDescription ||
                      'Uploaded and handed over to the campus admin desk.'}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-navy-700">
                  <button
                    onClick={() => {
                      setIsSuspiciousModalOpen(true);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                  >
                    <AlertTriangle size={14} />
                    <span>Report Suspicious Listing</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => handleAdminToggleStatus(selectedItem)}
                        className="btn-secondary text-xs py-2 px-3.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15 flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        <span>
                          {selectedItem.status === 'returned' || selectedItem.status === 'taken'
                            ? 'Mark as Found (At Desk)'
                            : 'Mark as Taken'}
                        </span>
                      </button>
                    )}
                    {activeTab === 'found' &&
                      selectedItem.status !== 'returned' &&
                      selectedItem.status !== 'taken' && (
                        <button
                          onClick={() => {
                            setIsDetailOpen(false);
                            handleOpenCollectInfo(selectedItem);
                          }}
                          className="btn-primary text-sm flex items-center gap-2"
                        >
                          <MapPin size={16} />
                          Where to Collect Item
                        </button>
                      )}
                    <button onClick={() => setIsDetailOpen(false)} className="btn-secondary text-sm">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* COLLECTION LOCATION MODAL (Offline Verification at Campus Desk) */}
          <Modal
            isOpen={isCollectModalOpen}
            onClose={() => setIsCollectModalOpen(false)}
            title="Where to Collect Your Item"
            size="md"
          >
            {selectedItem && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-navy-900 border border-navy-700">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-20 h-20 rounded-xl object-cover border border-navy-600 flex-shrink-0"
                  />
                  <div>
                    <span className="badge badge-blue text-[10px] mb-1">
                      {selectedItem.status === 'returned' || selectedItem.status === 'taken'
                        ? 'TAKEN'
                        : 'FOUND (AT DESK)'}
                    </span>
                    <h3 className="text-base font-bold text-white">{selectedItem.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Found near: {selectedItem.foundLocation} • {selectedItem.dateFound}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <MapPin size={15} />
                    <span>Campus Handover &amp; Collection Location</span>
                  </span>
                  <p className="text-lg font-extrabold text-white">
                    {selectedItem.storageLocation || 'Main Block Admin Office'}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Please go directly to{' '}
                    <strong className="text-white">
                      {selectedItem.storageLocation || 'Main Block Admin Office'}
                    </strong>{' '}
                    to collect this item. The Administrator at the desk will verify your sincerity in person (offline) before handing it over and updating the status to <strong>Taken</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-navy-700">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAdminToggleStatus(selectedItem);
                        setIsCollectModalOpen(false);
                      }}
                      className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>
                        {selectedItem.status === 'returned' || selectedItem.status === 'taken'
                          ? 'Mark as Found (At Desk)'
                          : 'Admin: Mark as Taken'}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCollectModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Got It, Close
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* REPORT SUSPICIOUS MODAL */}
          <Modal
            isOpen={isSuspiciousModalOpen}
            onClose={() => setIsSuspiciousModalOpen(false)}
            title="Report Suspicious Listing"
            size="sm"
          >
            {suspiciousSuccess ? (
              <div className="text-center py-4 space-y-2 animate-fade-in">
                <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Report Logged</p>
                <p className="text-xs text-slate-400">
                  Campus moderators have been notified to review this listing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSuspicious} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Why do you believe this listing is suspicious, duplicate, or violating college
                  guidelines?
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Duplicate post, fraudulent claim, offensive image..."
                  className="input-field text-xs"
                  value={suspiciousReason}
                  onChange={(e) => setSuspiciousReason(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-navy-700">
                  <button
                    type="button"
                    onClick={() => setIsSuspiciousModalOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-danger text-xs flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Submit Flag
                  </button>
                </div>
              </form>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
}
