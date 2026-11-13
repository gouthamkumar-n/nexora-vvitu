import React from 'react';

const ringSize = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-[3px]',
  lg: 'w-16 h-16 border-4',
};

const textSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export default function LoadingSpinner({ size = 'md', text, className = '' }) {
  const ring = ringSize[size] || ringSize.md;
  const txt  = textSize[size] || textSize.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${ring} rounded-full border-electric-500/30 border-t-electric-500 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`text-slate-400 ${txt}`}>{text}</p>
      )}
    </div>
  );
}
