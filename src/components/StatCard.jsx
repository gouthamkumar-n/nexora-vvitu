import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue:   { bg: 'bg-blue-500/20',   icon: 'text-blue-400',   ring: 'ring-blue-500/30'   },
  green:  { bg: 'bg-green-500/20',  icon: 'text-green-400',  ring: 'ring-green-500/30'  },
  purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', ring: 'ring-purple-500/30' },
  amber:  { bg: 'bg-amber-500/20',  icon: 'text-amber-400',  ring: 'ring-amber-500/30'  },
  red:    { bg: 'bg-red-500/20',    icon: 'text-red-400',    ring: 'ring-red-500/30'    },
};

export default function StatCard({ title, value, icon: Icon, change, changeType = 'up', color = 'blue' }) {
  const palette = colorMap[color] || colorMap.blue;

  return (
    <div className="card hover:scale-[1.02] transition-transform duration-200 cursor-default">
      <div className="flex items-start justify-between">
        {/* Icon circle */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${palette.bg} ring-1 ${palette.ring}`}>
          {Icon && <Icon size={22} className={palette.icon} />}
        </div>

        {/* Trend badge */}
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              changeType === 'up'
                ? 'bg-green-500/15 text-green-400'
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            {changeType === 'up' ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {change}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm text-slate-400 mt-1 font-medium">{title}</p>
      </div>
    </div>
  );
}
