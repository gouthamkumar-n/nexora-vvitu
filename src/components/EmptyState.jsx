import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Icon circle */}
      {Icon && (
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-navy-700 border border-white/10 mb-5">
          <Icon size={36} className="text-slate-500" />
        </div>
      )}

      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>

      {description && (
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      )}

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
