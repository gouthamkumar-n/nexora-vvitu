import React from 'react';

const sizes = {
  sm: { icon: 28, text: 'text-lg', tagline: 'text-xs' },
  md: { icon: 36, text: 'text-2xl', tagline: 'text-xs' },
  lg: { icon: 52, text: 'text-4xl', tagline: 'text-sm' },
};

export default function Logo({ size = 'md', tagline = false, className = '' }) {
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* Hexagon SVG Icon */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hex-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="inner-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Hexagon body */}
          <polygon
            points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
            fill="url(#hex-grad)"
          />
          {/* Inner N letter */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="800"
            fontFamily="'Inter', sans-serif"
            letterSpacing="-1"
          >
            N
          </text>
        </svg>

        {/* Wordmark */}
        <span
          className={`font-black tracking-widest gradient-text ${s.text}`}
          style={{ letterSpacing: '0.15em' }}
        >
          NEXORA
        </span>
      </div>

      {tagline && (
        <p className={`text-slate-400 italic mt-1 ${s.tagline}`}>
          Lost Today, Found Tomorrow.
        </p>
      )}
    </div>
  );
}
