import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

/**
 * CompanyLogo component with multi-tier fallback:
 * Tier 1: Clearbit Logo API
 * Tier 2: Google Favicon API
 * Tier 3: Styled SVG Monogram with company initial
 */
export default function CompanyLogo({ domain, companyName = '', size = 'md', className = '' }) {
  const [tier, setTier] = useState(1); // 1 = Clearbit, 2 = Google Favicon, 3 = Fallback Monogram

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs text-[10px]',
    md: 'w-11 h-11 text-sm text-xs',
    lg: 'w-14 h-14 text-lg text-sm'
  }[size] || 'w-11 h-11 text-sm';

  const cleanDomain = (domain || '').replace(/^https?:\/\//, '').split('/')[0];
  const initial = (companyName || cleanDomain || 'C').charAt(0).toUpperCase();

  // Dynamic gradient background for initial monogram
  const bgGradients = [
    'from-indigo-600 to-purple-600',
    'from-emerald-600 to-teal-600',
    'from-blue-600 to-cyan-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-pink-600'
  ];
  const charCode = initial.charCodeAt(0) || 0;
  const gradientClass = bgGradients[charCode % bgGradients.length];

  if (tier === 1 && cleanDomain) {
    return (
      <img
        src={`https://logo.clearbit.com/${cleanDomain}`}
        alt={`${companyName || cleanDomain} logo`}
        onError={() => setTier(2)}
        className={`${sizeClasses} rounded-xl object-contain bg-slate-900 border border-slate-800 p-1.5 shadow-sm ${className}`}
      />
    );
  }

  if (tier === 2 && cleanDomain) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
        alt={`${companyName || cleanDomain} favicon`}
        onError={() => setTier(3)}
        className={`${sizeClasses} rounded-xl object-contain bg-slate-900 border border-slate-800 p-1.5 shadow-sm ${className}`}
      />
    );
  }

  // Tier 3: Monogram Fallback Tile
  return (
    <div
      className={`${sizeClasses} rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-extrabold text-white shadow-md border border-slate-700/50 ${className}`}
    >
      {initial ? initial : <Building2 className="w-5 h-5" />}
    </div>
  );
}
