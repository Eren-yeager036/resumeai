import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  ExternalLink,
  Loader2
} from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';

export default function MatchBreakdownModal({
  job,
  matchResult,
  isOpen,
  onClose,
  onApplyDirect,
  onTailorResume
}) {
  const [isTailoring, setIsTailoring] = useState(false);

  if (!isOpen || !job || !matchResult) return null;

  const { matchScore, matchedSkills, missingSkills, matchReasoning, suggestions } = matchResult;

  const handleTailorClick = async () => {
    setIsTailoring(true);
    await onTailorResume(job);
    setIsTailoring(false);
    onClose();
  };

  // Color stroke based on match score
  let scoreColor = '#10B981'; // Green
  if (matchScore < 70) scoreColor = '#F59E0B'; // Amber
  if (matchScore < 50) scoreColor = '#EF4444'; // Red

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div className="flex items-center gap-4">
            <CompanyLogo domain={job.domain} companyName={job.company} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{job.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {matchScore}% Match
                </span>
              </div>
              <p className="text-sm font-medium text-slate-400 mt-0.5">
                {job.company} • {job.location} • <span className="text-emerald-400 font-semibold">{job.salary}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* Match Score & Rationale Header Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Score Radial Ring */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke={scoreColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - matchScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{matchScore}%</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Match</span>
              </div>
            </div>

            {/* Rationale Text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Fit Rationale</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {matchReasoning}
              </p>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Matched Skills */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Skills ({matchedSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No direct skill matches found</span>
                )}
              </div>
            </div>

            {/* Missing Qualifications */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Qualifications ({missingSkills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">
                    🎉 You meet all listed skill requirements!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Actionable Optimization Steps
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {suggestions.map((sug, idx) => (
                <li key={idx} className="leading-relaxed">{sug}</li>
              ))}
            </ul>
          </div>

          {/* Job Description Brief */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Role Overview
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
              {job.description}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={handleTailorClick}
            disabled={isTailoring}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
          >
            {isTailoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Tailoring Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto-Tailor Resume for this Job</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onApplyDirect(job);
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>Apply Direct Now</span>
            <ExternalLink className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
