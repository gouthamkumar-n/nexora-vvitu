import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  Copy,
  Trash2,
  X,
  MapPin,
  Calendar,
  Lock,
  Archive,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../data/sampleData';

export default function ItemManagement() {
  const { user } = useAuth();
  const {
    lostItems,
    foundItems,
    categories,
    updateLostItem,
    updateFoundItem,
    deleteLostItem,
    deleteFoundItem,
    addAuditLog,
  } = useApp();
  const activeCategories = categories?.length ? categories : ITEM_CATEGORIES;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected for slide-in drawer
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('lost');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusChangeValue, setStatusChangeValue] = useState('');

  // Combined inventory list
  const allItems = useMemo(() => {
    const lost = lostItems.map((i) => ({ ...i, itemType: 'lost' }));
    const found = foundItems.map((i) => ({
      ...i,
      itemType: 'found',
      location: i.foundLocation,
      dateLost: i.dateFound,
      userName: i.foundByName,
    }));
    return [...lost, ...found];
  }, [lostItems, foundItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesType = !typeFilter || item.itemType === typeFilter;
      const matchesCategory = !categoryFilter || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [allItems, searchTerm, statusFilter, typeFilter, categoryFilter]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSelectedType(item.itemType);
    setStatusChangeValue(item.status);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = (newStatus) => {
    if (!selectedItem) return;

    if (selectedType === 'lost') {
      updateLostItem(selectedItem.id, { status: newStatus });
    } else {
      updateFoundItem(selectedItem.id, { status: newStatus });
    }

    addAuditLog({
      action: 'ITEM_STATUS_UPDATED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: selectedItem.id,
      targetType: selectedType === 'lost' ? 'lost_item' : 'found_item',
      details: `Updated status of "${selectedItem.title}" to ${newStatus}`,
    });

    setSelectedItem((prev) => ({ ...prev, status: newStatus }));
  };

  const handleFlagSuspicious = (item) => {
    const isLost = item.itemType === 'lost';
    if (isLost) {
      updateLostItem(item.id, { status: 'suspicious' });
    } else {
      updateFoundItem(item.id, { status: 'suspicious' });
    }

    addAuditLog({
      action: 'ITEM_FLAGGED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: item.id,
      targetType: isLost ? 'lost_item' : 'found_item',
      details: `Admin flagged "${item.title}" as suspicious`,
    });
  };

  const handleDeleteItem = (item) => {
    if (!window.confirm(`Permanently delete "${item.title}" from campus inventory?`)) return;
    if (item.itemType === 'lost') {
      deleteLostItem(item.id);
    } else {
      deleteFoundItem(item.id);
    }
    addAuditLog({
      action: 'ITEM_DELETED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: item.id,
      targetType: item.itemType === 'lost' ? 'lost_item' : 'found_item',
      details: `Deleted ${item.itemType} item "${item.title}" (${item.reportId || item.id})`,
    });
    if (selectedItem?.id === item.id) {
      setIsDrawerOpen(false);
      setSelectedItem(null);
    }
  };

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = (status) => {
    selectedIds.forEach((id) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        if (item.itemType === 'lost') {
          updateLostItem(id, { status });
        } else {
          updateFoundItem(id, { status });
        }
      }
    });

    addAuditLog({
      action: 'BULK_STATUS_UPDATE',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: null,
      targetType: 'bulk',
      details: `Bulk updated ${selectedIds.length} items to "${status}"`,
    });

    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Item Inventory Management
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Supervise, inspect, verify, and resolve all reported items across campus.
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="card p-4 sm:p-5 bg-navy-800 border-navy-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search by title, ID, description..."
                  className="input-field pl-9 py-2 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Type filter */}
              <div>
                <select
                  className="select-field py-2 text-xs"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types (Lost & Found)</option>
                  <option value="lost">Lost Only</option>
                  <option value="found">Found Only</option>
                </select>
              </div>

                {/* Status filter */}
              <div>
                <select
                  className="select-field py-2 text-xs"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Found / Active (At Desk)</option>
                  <option value="returned">Taken / Returned</option>
                  <option value="claimed">Claimed / Pending</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              {/* Category filter */}
              <div>
                <select
                  className="select-field py-2 text-xs"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {activeCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions Bar if items selected */}
            {selectedIds.length > 0 && (
              <div className="p-3 bg-electric-500/10 border border-electric-500/30 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                <span className="font-semibold text-white">
                  {selectedIds.length} item(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    Mark as Found (At Desk)
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('suspicious')}
                    className="btn-danger text-[11px] py-1 px-2.5"
                  >
                    Flag Suspicious
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('returned')}
                    className="btn-success text-[11px] py-1 px-2.5"
                  >
                    Mark as Taken
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-slate-400 hover:text-white ml-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="card p-0 border-navy-700 bg-navy-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-900/80 border-b border-navy-700 text-xs">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredItems.length && filteredItems.length > 0
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded bg-navy-900 border-navy-600 text-electric-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Report ID</th>
                    <th className="table-header">Item Details</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Campus Location</th>
                    <th className="table-header">Reported By</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`table-row transition-colors ${
                          isSelected ? 'bg-electric-500/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(item.id)}
                            className="rounded bg-navy-900 border-navy-600 text-electric-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge text-[10px] font-bold ${
                              item.itemType === 'lost' ? 'badge-red' : 'badge-green'
                            }`}
                          >
                            {item.itemType?.toUpperCase()}
                          </span>
                        </td>
                        <td className="table-cell font-mono text-xs text-slate-300">
                          {item.reportId || item.id}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-9 h-9 rounded-lg object-cover border border-navy-600 flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-white text-xs">{item.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {item.description || item.publicDescription}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-xs">{item.category}</td>
                        <td className="table-cell text-xs text-slate-300">{item.location}</td>
                        <td className="table-cell text-xs text-slate-300">{item.userName || 'Student'}</td>
                        <td className="table-cell text-xs text-slate-400">{item.dateLost}</td>
                        <td className="table-cell">
                          <Badge status={item.status} />
                        </td>
                        <td className="table-cell text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const isTaken = item.status === 'returned' || item.status === 'taken';
                                const nextStatus = isTaken ? 'active' : 'returned';
                                if (item.itemType === 'lost') {
                                  updateLostItem(item.id, { status: nextStatus });
                                } else {
                                  updateFoundItem(item.id, { status: nextStatus });
                                }
                                addAuditLog({
                                  action: 'ITEM_STATUS_UPDATED',
                                  userId: user?.id || 'admin',
                                  userName: user?.name || 'Administrator',
                                  targetId: item.id,
                                  targetType: item.itemType === 'lost' ? 'lost_item' : 'found_item',
                                  details: `Changed "${item.title}" status to ${nextStatus === 'returned' ? 'Taken' : 'Found (At Desk)'}`,
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1 ${
                                item.status === 'returned' || item.status === 'taken'
                                  ? 'bg-electric-500/15 text-electric-400 border-electric-500/30 hover:bg-electric-500/25'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              }`}
                              title="Toggle Found / Taken status"
                            >
                              <CheckCircle size={12} />
                              <span>
                                {item.status === 'returned' || item.status === 'taken'
                                  ? 'Mark Found'
                                  : 'Mark Taken'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleSelectItem(item)}
                              className="p-1.5 rounded-lg bg-navy-700 hover:bg-electric-500/20 text-slate-300 hover:text-electric-400 transition"
                              title="Inspect Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleFlagSuspicious(item)}
                              className="p-1.5 rounded-lg bg-navy-700 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition"
                              title="Flag as Suspicious"
                            >
                              <AlertTriangle size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 rounded-lg bg-navy-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLIDE-IN INSPECTION SIDE PANEL */}
          {isDrawerOpen && selectedItem && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsDrawerOpen(false)}
              />

              <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-navy-800 border-l border-navy-700 p-6 flex flex-col justify-between overflow-y-auto animate-slide-in">
                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-navy-700">
                      <div>
                        <span
                          className={`badge text-[10px] font-bold ${
                            selectedItem.itemType === 'lost' ? 'badge-red' : 'badge-green'
                          }`}
                        >
                          {selectedItem.itemType?.toUpperCase()} REPORT
                        </span>
                        <h2 className="text-lg font-bold text-white mt-1">{selectedItem.title}</h2>
                      </div>
                      <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="mt-4 rounded-xl overflow-hidden border border-navy-700 h-48 bg-navy-950">
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Attributes */}
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="p-3 bg-navy-900 rounded-xl space-y-2 border border-navy-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Report ID:</span>
                          <span className="font-mono text-electric-400 font-semibold">
                            {selectedItem.reportId || selectedItem.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Category:</span>
                          <span className="text-white font-medium">{selectedItem.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Brand / Color:</span>
                          <span className="text-white font-medium">
                            {selectedItem.brand || 'N/A'} • {selectedItem.color}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="text-white font-medium">{selectedItem.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Reported By:</span>
                          <span className="text-white font-medium">
                            {selectedItem.userName || 'Campus User'}
                          </span>
                        </div>
                      </div>

                      {/* Public Description */}
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Public Summary
                        </span>
                        <p className="p-3 bg-navy-900/60 rounded-xl border border-navy-700 text-slate-300">
                          {selectedItem.description || selectedItem.publicDescription}
                        </p>
                      </div>

                      {/* PRIVATE IDENTIFYING DETAILS (Admin Only) */}
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Lock size={14} />
                          <span>Confidential Private Identifiers (Admin Only)</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {selectedItem.privateDetails ||
                            'No private secondary details specified during report intake.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="pt-6 border-t border-navy-700 space-y-3">
                    <div>
                      <label className="label text-xs">Update Status</label>
                      <select
                        className="select-field text-xs py-2"
                        value={statusChangeValue}
                        onChange={(e) => {
                          setStatusChangeValue(e.target.value);
                          handleUpdateStatus(e.target.value);
                        }}
                      >
                        <option value="active">Found (Available at Desk)</option>
                        <option value="returned">Taken (Collected by Owner)</option>
                        <option value="suspicious">Suspicious (Flagged)</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="btn-secondary w-full text-xs"
                    >
                      Done Inspecting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
