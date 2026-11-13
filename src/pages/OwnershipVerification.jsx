import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  Search,
  Package,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function OwnershipVerification() {
  const { user } = useAuth();
  const {
    foundItems,
    updateFoundItem,
    addAuditLog,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'found' | 'taken'
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');

  const filteredItems = foundItems.filter((item) => {
    const isTaken = item.status === 'returned' || item.status === 'taken';
    if (filterTab === 'found' && isTaken) return false;
    if (filterTab === 'taken' && !isTaken) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.foundLocation?.toLowerCase().includes(q) ||
        item.storageLocation?.toLowerCase().includes(q) ||
        item.reportId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (item) => {
    const isCurrentlyTaken = item.status === 'returned' || item.status === 'taken';
    const nextStatus = isCurrentlyTaken ? 'active' : 'returned';

    updateFoundItem(item.id, { status: nextStatus });

    addAuditLog({
      action: 'ITEM_STATUS_UPDATED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: item.id,
      targetType: 'found_item',
      details: `Marked "${item.title}" as ${
        nextStatus === 'returned' ? 'Taken (Handed Over Offline)' : 'Found (Available at Desk)'
      }`,
    });

    setToast(
      `"${item.title}" status updated to ${
        nextStatus === 'returned' ? 'TAKEN (Handed Over)' : 'FOUND (Available at Desk)'
      }.`
    );
    setTimeout(() => setToast(''), 3000);
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <ShieldCheck size={14} />
                <span>Offline Desk Handover &amp; Status Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Found &amp; Taken Item Status Control
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                When a student visits the collection desk in person, verify their sincerity offline and toggle the item status between <strong>Found</strong> and <strong>Taken</strong>.
              </p>
            </div>
          </div>

          {toast && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 shadow-lg">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="card p-4 bg-navy-800 border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex p-1 bg-navy-900 rounded-xl border border-navy-700 text-xs font-semibold">
              {[
                { id: 'all', label: `All Items (${foundItems.length})` },
                {
                  id: 'found',
                  label: `Found / At Desk (${
                    foundItems.filter((i) => i.status !== 'returned' && i.status !== 'taken').length
                  })`,
                },
                {
                  id: 'taken',
                  label: `Taken / Handed Over (${
                    foundItems.filter((i) => i.status === 'returned' || i.status === 'taken').length
                  })`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterTab(t.id)}
                  className={`px-3.5 py-2 rounded-lg transition ${
                    filterTab === t.id
                      ? 'bg-electric-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search item, desk location..."
                className="input-field pl-9 py-2 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="card p-12 text-center border-navy-700 bg-navy-800">
              <Package size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No Found Items in This View</p>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded found items will appear here with their collection desk location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const isTaken = item.status === 'returned' || item.status === 'taken';
                return (
                  <div
                    key={item.id}
                    className="card p-0 overflow-hidden border-navy-700 bg-navy-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-navy-950">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-3 right-3 badge text-xs font-bold shadow ${
                            isTaken ? 'badge-green' : 'badge-blue'
                          }`}
                        >
                          {isTaken ? 'TAKEN' : 'FOUND (AT DESK)'}
                        </span>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
                          {item.reportId || item.id}
                        </span>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <div>
                          <span className="text-[11px] font-semibold text-electric-400 uppercase">
                            {item.category}
                          </span>
                          <h3 className="font-bold text-white text-base truncate">{item.title}</h3>
                        </div>

                        <div className="p-3 rounded-xl bg-navy-900 border border-navy-700 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <MapPin size={13} className="flex-shrink-0" />
                            <span className="truncate">
                              Kept At: {item.storageLocation || 'Main Block Admin Office'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={13} className="flex-shrink-0 text-slate-500" />
                            <span className="truncate">Found Near: {item.foundLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={13} className="flex-shrink-0 text-slate-500" />
                            <span>Date Found: {item.dateFound}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${
                          isTaken
                            ? 'bg-navy-700 hover:bg-navy-600 text-slate-200 border border-navy-600'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isTaken ? (
                          <>
                            <RotateCcw size={14} />
                            <span>Change Status Back to Found (At Desk)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={15} />
                            <span>Mark Status as Taken (Handed Over)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
