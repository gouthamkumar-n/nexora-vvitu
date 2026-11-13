import React from 'react';
import { MapPin, Calendar, Eye, CheckCircle } from 'lucide-react';
import Badge from './Badge';
import { formatTimeAgo } from '../services/notificationService';
import { CATEGORY_DEFAULT_IMAGES } from '../data/sampleData';

const categoryColors = {
  Electronics:   'badge-blue',
  'Bags & Wallets': 'badge-purple',
  'ID & Cards':  'badge-yellow',
  Clothing:      'badge-green',
  Books:         'badge-blue',
  Jewelry:       'badge-purple',
  Sports:        'badge-green',
  Other:         'badge-gray',
};

// Gradient placeholder by category
const gradientMap = {
  Electronics:   'from-blue-900 to-cyan-800',
  'Bags & Wallets': 'from-purple-900 to-pink-800',
  'ID & Cards':  'from-amber-900 to-yellow-700',
  Clothing:      'from-green-900 to-teal-800',
  Books:         'from-sky-900 to-blue-800',
  Jewelry:       'from-fuchsia-900 to-purple-800',
  Sports:        'from-emerald-900 to-green-700',
  Other:         'from-slate-800 to-slate-700',
};

export default function ItemCard({ item, type = 'lost', onView, onClaim, isAdmin, onToggleStatus }) {
  if (!item) return null;

  const isTaken = item.status === 'returned' || item.status === 'taken';

  const catBadge = categoryColors[item.category] || 'badge-gray';
  const gradient = gradientMap[item.category] || 'from-slate-800 to-slate-700';

  const dateLabel = type === 'lost' ? item.dateLost : item.dateFound;
  const timeLabel = dateLabel ? formatTimeAgo(dateLabel) : '';

  const displayImg =
    item.imageUrl ||
    item.image ||
    CATEGORY_DEFAULT_IMAGES[item.category] ||
    CATEGORY_DEFAULT_IMAGES['Other'];

  return (
    <div className="card p-0 overflow-hidden hover:scale-[1.015] hover:shadow-card-hover transition-all duration-200 flex flex-col">
      {/* Image / Placeholder */}
      <div className="relative h-44 w-full bg-navy-700 flex-shrink-0">
        {displayImg ? (
          <img
            src={displayImg}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl opacity-30">
              {item.category === 'Electronics'    ? '📱'
               : item.category === 'Bags & Wallets' ? '👜'
               : item.category === 'ID & Cards'   ? '🪪'
               : item.category === 'Clothing'     ? '👕'
               : item.category === 'Books'        ? '📚'
               : item.category === 'Jewelry'      ? '💍'
               : item.category === 'Sports'       ? '⚽'
               : '📦'}
            </span>
          </div>
        )}

        {/* Type ribbon */}
        <div
          className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            type === 'lost'
              ? 'bg-red-500/90 text-white'
              : 'bg-green-500/90 text-white'
          }`}
        >
          {type === 'lost' ? 'Lost' : 'Found'}
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {type === 'found' ? (
            <span
              className={`badge text-xs font-bold ${
                isTaken ? 'badge-green' : 'badge-blue'
              }`}
            >
              {isTaken ? 'Taken' : 'Found (At Desk)'}
            </span>
          ) : (
            <Badge status={item.status} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className={`badge ${catBadge} self-start mb-2 text-xs`}>{item.category}</span>

        {/* Title */}
        <h3 className="text-white font-semibold text-base leading-snug mb-2 line-clamp-1">
          {item.title}
        </h3>

        {/* Location & Date */}
        <div className="flex flex-col gap-1 mb-3">
          {(item.location || item.foundLocation) && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <MapPin size={12} className="text-electric-400 flex-shrink-0" />
              <span className="truncate">{item.location || item.foundLocation}</span>
            </div>
          )}
          {type === 'found' && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="truncate">
                Kept at: {item.storageLocation || 'Main Block Admin Office'}
              </span>
            </div>
          )}
          {timeLabel && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Calendar size={12} className="text-electric-400 flex-shrink-0" />
              <span>{timeLabel}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex gap-2">
            <button
              onClick={() => onView && onView(item)}
              className="btn-primary btn-sm flex items-center gap-1.5 flex-1 justify-center"
            >
              <Eye size={14} />
              View Details
            </button>

            {onClaim && type === 'found' && !isTaken && (
              <button
                onClick={() => onClaim(item)}
                className="btn-secondary btn-sm flex items-center gap-1.5 flex-1 justify-center border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15"
              >
                <MapPin size={14} />
                Where to Collect
              </button>
            )}
          </div>

          {isAdmin && onToggleStatus && (
            <button
              onClick={() => onToggleStatus(item)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                isTaken
                  ? 'bg-electric-500/15 text-electric-400 border-electric-500/30 hover:bg-electric-500/25'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
            >
              <CheckCircle size={13} />
              <span>{isTaken ? 'Admin: Mark as Found (At Desk)' : 'Admin: Mark as Taken'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
