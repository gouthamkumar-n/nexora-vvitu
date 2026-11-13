import React, { useState, useMemo } from 'react';
import {
  MapPin, Sparkles, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, XCircle, FileText, Upload, X, Trophy, Zap,
  Clock, Package, Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { computeAllMatches, getConfidenceBadge } from '../services/matchingEngine';
import { formatTimeAgo } from '../services/notificationService';

// ─── Score Gauge (SVG semicircle) ───────────────────────────────────────────
function ScoreGauge({ score }) {
  const radius = 54;
  const stroke = 10;
  const normalizedR = radius - stroke / 2;
  const circumference = Math.PI * normalizedR; // half-circle
  const offset = circumference - (score / 100) * circumference;

  let arcColor = '#ef4444'; // red ≤40
  if (score > 70) arcColor = '#10b981'; // emerald
  else if (score > 40) arcColor = '#f59e0b'; // amber

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="70" viewBox="0 0 120 70" className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} 65 A ${normalizedR} ${normalizedR} 0 0 1 ${120 - stroke / 2} 65`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${stroke / 2} 65 A ${normalizedR} ${normalizedR} 0 0 1 ${120 - stroke / 2} 65`}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Score number */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
        >
          {score}%
        </text>
      </svg>
      <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
        Match Score
      </span>
    </div>
  );
}

// ─── Confidence Badge ────────────────────────────────────────────────────────
function ConfidencePill({ score }) {
  const { label } = getConfidenceBadge(score);
  let cls = 'badge badge-red';
  if (score >= 70) cls = 'badge badge-green';
  else if (score >= 40) cls = 'badge badge-yellow';
  return <span className={cls}>{label}</span>;
}

// ─── Breakdown Table ─────────────────────────────────────────────────────────
function BreakdownTable({ breakdown, reasons }) {
  const SIGNALS = [
    { key: 'category', label: 'Category',    weight: 25, maxPts: 25 },
    { key: 'color',    label: 'Color',       weight: 20, maxPts: 20 },
    { key: 'name',     label: 'Name',        weight: 20, maxPts: 20 },
    { key: 'brand',    label: 'Brand',       weight: 15, maxPts: 15 },
    { key: 'description', label: 'Description', weight: 10, maxPts: 10 },
    { key: 'location', label: 'Location',    weight: 5,  maxPts: 5  },
    { key: 'date',     label: 'Date Proximity', weight: 5, maxPts: 5 },
  ];

  return (
    <div className="mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="table-header">Signal</th>
            <th className="table-header text-center">Weight</th>
            <th className="table-header text-center">Score</th>
            <th className="table-header">Status</th>
          </tr>
        </thead>
        <tbody>
          {SIGNALS.map((s) => {
            const pts = breakdown?.[s.key] ?? 0;
            const pct = s.maxPts > 0 ? Math.round((pts / s.maxPts) * 100) : 0;
            const hit = pts > 0;
            return (
              <tr key={s.key} className="table-row">
                <td className="table-cell font-medium">{s.label}</td>
                <td className="table-cell text-center text-slate-400">{s.weight}pts</td>
                <td className="table-cell text-center">
                  <span className={hit ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {pts}/{s.maxPts}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    {hit
                      ? <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                      : <XCircle size={13} className="text-slate-600 shrink-0" />}
                    <span className="text-xs text-slate-400">
                      {hit ? `${pct}% match` : 'No match'}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          {/* Image row – always 0 */}
          <tr className="table-row opacity-50">
            <td className="table-cell font-medium">Image</td>
            <td className="table-cell text-center text-slate-400">0pts</td>
            <td className="table-cell text-center text-slate-500">—</td>
            <td className="table-cell text-xs text-amber-500 italic">AI integration required</td>
          </tr>
        </tbody>
      </table>

      {reasons?.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-navy-900/60 border border-navy-700">
          <p className="text-xs font-semibold text-slate-400 mb-1.5">Match Reasons</p>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                <Sparkles size={11} className="text-electric-400 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Item Panel ───────────────────────────────────────────────────────────────
function ItemPanel({ item, side }) {
  const isLost = side === 'lost';
  const date   = isLost ? item.dateLost   : item.dateFound;
  const loc    = isLost ? item.location   : item.foundLocation;
  const label  = isLost ? 'Lost'          : 'Found';
  const accent = isLost ? 'text-red-400'  : 'text-emerald-400';

  return (
    <div className={`flex-1 p-4 rounded-xl bg-navy-900/50 border ${isLost ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${accent}`}>{label}</span>
        <span className="badge badge-gray text-[10px]">{item.category}</span>
      </div>

      {/* Image */}
      <div className="w-full h-28 rounded-lg overflow-hidden bg-navy-700 mb-3 flex items-center justify-center">
        {(item.imageUrl || item.image) ? (
          <img src={item.imageUrl || item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <Package size={32} className="text-slate-600" />
        )}
      </div>

      <p className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2">{item.title}</p>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{loc || 'Unknown location'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={11} className="shrink-0" />
          <span>{date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}</span>
        </div>
        {!isLost && item.storageLocation && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Package size={11} className="shrink-0" />
            <span>Stored: {item.storageLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Collection Location Modal (Offline Verification at Campus Desk) ──────────
function ClaimModal({ match, onClose, onSuccess }) {
  const { updateFoundItem, updateLostItem, addAuditLog } = useApp();
  const { user, isAdmin } = useAuth();
  const isTaken = match.foundItem.status === 'returned' || match.foundItem.status === 'taken';

  function handleAdminToggle() {
    const nextStatus = isTaken ? 'active' : 'returned';
    updateFoundItem(match.foundItem.id, { status: nextStatus });
    if (match.lostItem?.id) {
      updateLostItem(match.lostItem.id, { status: nextStatus });
    }
    addAuditLog({
      action: 'ITEM_STATUS_UPDATED',
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      targetId: match.foundItem.id,
      targetType: 'found_item',
      details: `Changed status of "${match.foundItem.title}" to ${nextStatus === 'returned' ? 'Taken (Handed Over)' : 'Found (At Desk)'}`,
    });
    onSuccess?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-navy-800 rounded-2xl border border-navy-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MapPin size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Where to Collect Your Item</h2>
              <p className="text-xs text-slate-400">
                Match confidence: <span className="text-electric-400 font-semibold">{match.score}%</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Found Item Card */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-navy-900 border border-navy-700">
            {(match.foundItem.imageUrl || match.foundItem.image) && (
              <img
                src={match.foundItem.imageUrl || match.foundItem.image}
                alt={match.foundItem.title}
                className="w-20 h-20 rounded-xl object-cover border border-navy-600 flex-shrink-0"
              />
            )}
            <div>
              <span className={`badge text-[10px] mb-1 ${isTaken ? 'badge-green' : 'badge-blue'}`}>
                {isTaken ? 'TAKEN' : 'FOUND (AT DESK)'}
              </span>
              <h3 className="text-base font-bold text-white">{match.foundItem.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Found at: {match.foundItem.foundLocation}
              </p>
            </div>
          </div>

          {/* Campus Handover Location */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin size={15} />
              <span>Campus Handover &amp; Collection Location</span>
            </span>
            <p className="text-lg font-extrabold text-white">
              {match.foundItem.storageLocation || 'Main Block Admin Office'}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              To collect this item, please visit{' '}
              <strong className="text-white">
                {match.foundItem.storageLocation || 'Main Block Admin Office'}
              </strong>{' '}
              in person. The Administrator at the desk will verify your sincerity offline before handing over the item and marking its status as <strong>Taken</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-navy-700">
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminToggle}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs flex items-center gap-1.5"
              >
                <CheckCircle size={15} />
                <span>{isTaken ? 'Admin: Mark as Found (At Desk)' : 'Admin: Mark as Taken'}</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Got It, Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ lostItem, match }) {
  const [expanded, setExpanded] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const isTaken = match.foundItem.status === 'returned' || match.foundItem.status === 'taken';

  return (
    <div className="card border border-navy-700 hover:border-electric-500/30 transition-all duration-200">
      {/* Main row */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Lost item */}
        <ItemPanel item={lostItem} side="lost" />

        {/* Centre gauge */}
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-2 shrink-0">
          <ScoreGauge score={match.score} />
          <ConfidencePill score={match.score} />
          {isTaken && (
            <span className="badge badge-green text-xs flex items-center gap-1">
              <CheckCircle size={11} /> Taken
            </span>
          )}
        </div>

        {/* Found item */}
        <ItemPanel item={match.foundItem} side="found" />
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-navy-700/60">
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost btn-sm flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <Eye size={14} />
          Match Breakdown
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          onClick={() => setClaiming(true)}
          className="btn-primary btn-sm flex items-center gap-2"
        >
          <MapPin size={14} />
          Where to Collect ({match.foundItem.storageLocation || 'Main Block Admin Office'})
        </button>
      </div>

      {/* Breakdown */}
      {expanded && (
        <BreakdownTable breakdown={match.breakdown} reasons={match.reasons} />
      )}

      {/* Collection location modal */}
      {claiming && (
        <ClaimModal
          match={{ lostItem, foundItem: match.foundItem, score: match.score }}
          onClose={() => setClaiming(false)}
          onSuccess={() => setClaiming(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIMatching() {
  const { lostItems, foundItems } = useApp();
  const { user }                  = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myItemsOnly, setMyItemsOnly] = useState(true);
  const [sortBy, setSortBy]           = useState('score'); // 'score' | 'recent'

  // Compute all matches
  const allMatchGroups = useMemo(() => {
    const activeLost  = myItemsOnly
      ? lostItems.filter((i) => i.userId === user?.id && i.status === 'active')
      : lostItems.filter((i) => i.status === 'active');
    return computeAllMatches(activeLost, foundItems);
  }, [lostItems, foundItems, myItemsOnly, user]);

  // Flatten to per-match rows with sorting
  const flatMatches = useMemo(() => {
    const rows = [];
    allMatchGroups.forEach(({ lostItem, matches }) => {
      matches.forEach((m) => rows.push({ lostItem, match: m }));
    });
    if (sortBy === 'score') rows.sort((a, b) => b.match.score - a.match.score);
    else rows.sort((a, b) => new Date(b.lostItem.createdAt) - new Date(a.lostItem.createdAt));
    return rows;
  }, [allMatchGroups, sortBy]);

  return (
    <div className="min-h-screen bg-navy-900 text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Sparkles size={22} className="text-electric-400" />
            AI Smart Matching
          </h1>
          <p className="section-subtitle">Potential matches between lost and found items</p>
        </div>
      </div>

      {/* ⚠️ AI Notice Banner */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-300">AI Assistance Notice</p>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Match scores are computed from text attributes only. Image comparison requires additional AI integration.
            Scores help identify candidates – <strong>human verification is always required.</strong>{' '}
            Never claim ownership based on score alone.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* My Items toggle */}
        <div className="flex items-center rounded-xl overflow-hidden border border-navy-600 bg-navy-800">
          <button
            onClick={() => setMyItemsOnly(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${myItemsOnly ? 'bg-electric-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            My Items Only
          </button>
          <button
            onClick={() => setMyItemsOnly(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${!myItemsOnly ? 'bg-electric-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Items
          </button>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select-field"
        >
          <option value="score">Sort: Highest Score</option>
          <option value="recent">Sort: Most Recent</option>
        </select>

        <span className="text-sm text-slate-400 ml-auto">
          {flatMatches.length} potential {flatMatches.length === 1 ? 'match' : 'matches'} found
        </span>
      </div>

      {/* Match cards */}
      {flatMatches.length === 0 ? (
        <div className="card flex flex-col items-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center">
            <Sparkles size={32} className="text-slate-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white mb-1">No Matches Found</p>
            <p className="text-slate-400 text-sm max-w-xs">
              {myItemsOnly
                ? "No potential matches for your active lost items yet. Try switching to 'All Items'."
                : 'No matches between active lost and found items currently.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {flatMatches.map(({ lostItem, match }, idx) => (
            <MatchCard key={`${lostItem.id}-${match.foundItem.id}-${idx}`} lostItem={lostItem} match={match} />
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
