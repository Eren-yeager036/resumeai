import React from 'react';
import { Search, Sparkles, Filter, X, Globe, Briefcase } from 'lucide-react';

export default function JobFilterBar({
  searchTerm,
  onSearchChange,
  minMatchScore,
  onMinMatchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRegion,
  onRegionChange,
  selectedATS,
  onATSChange,
  onResetFilters
}) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">

      {/* Search Input Row */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search worldwide live vacancies by title, company, domain, or skills..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

          {/* Domain / Department Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Domains Worldwide</option>
              <option value="Engineering">Engineering</option>
              <option value="AI Research">AI & ML Research</option>
              <option value="Design">UI/UX & Product Design</option>
              <option value="Product">Product Management</option>
              <option value="Data">Data & Analytics</option>
              <option value="Marketing">Growth Marketing</option>
              <option value="Finance">Corporate Finance</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Sales">Sales & Account Exec</option>
              <option value="HR & Legal">HR & Legal Ops</option>
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-bold cursor-pointer"
            >
              <option value="All">All Regions</option>
              <option value="Worldwide">Remote (Worldwide)</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
            </select>
          </div>

          {/* Min Match Score Slider */}
          <div className="flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Min Fit: <span className="text-indigo-300 font-extrabold">{minMatchScore}%</span>
            </span>
            <input
              type="range"
              min="35"
              max="90"
              step="5"
              value={minMatchScore}
              onChange={(e) => onMinMatchChange(Number(e.target.value))}
              className="w-20 accent-indigo-500 h-1 cursor-pointer bg-slate-800 rounded-lg"
            />
          </div>

        </div>

        {/* Reset Button */}
        <button
          onClick={onResetFilters}
          className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>

      </div>

    </div>
  );
}
