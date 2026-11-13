import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  onFilter,
  className = '',
}) {
  const handleClear = () => {
    if (onChange) onChange('');
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search icon */}
      <Search
        size={16}
        className="absolute left-3 text-slate-400 pointer-events-none flex-shrink-0"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-9 w-full"
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-slate-400 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}

      {/* Optional filter button */}
      {onFilter && !value && (
        <button
          type="button"
          onClick={onFilter}
          className="absolute right-3 text-slate-400 hover:text-electric-400 transition-colors"
          aria-label="Open filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={15}
            height={15}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
