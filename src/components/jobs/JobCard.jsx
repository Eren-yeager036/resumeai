import React from 'react';
import {
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  DollarSign,
  ChevronRight,
  Briefcase,
  Check
} from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';

export default function JobCard({
  job,
  matchResult,
  appliedStatus = null,
  onInspectMatch,
  onOpenPortal,
  onConfirmApplied
}) {
  const { matchScore, matchedSkills, missingSkills } = matchResult;

  // Score styling
  let scoreBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (matchScore < 75) scoreBg = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  if (matchScore < 60) scoreBg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between gap-5 group">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <CompanyLogo domain={job.domain} companyName={job.company} size="md" />
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
              <span className="font-bold text-slate-200">{job.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {job.location}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5 shadow-sm ${scoreBg}`}>
            <span>{matchScore}% Match</span>
          </div>
        </div>

      </div>

      {/* Salary & Department Specs */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{job.salary}</span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          <span>{job.department}</span>
        </div>
        <span className="text-slate-700">•</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-extrabold uppercase">
          {job.atsType} ATS
        </span>
        {job.isLiveApi && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
            ⚡ Live API
          </span>
        )}
      </div>

      {/* Matched vs Missing Skill Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {matchedSkills.length} Matched Skills
          </span>
          {missingSkills.length > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {missingSkills.length} Gap
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {matchedSkills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold"
            >
              {skill}
            </span>
          ))}
          {missingSkills.slice(0, 2).map((skill, idx) => (
            <span
              key={`missing-${idx}`}
              className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-semibold line-through opacity-80"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        
        <button
          onClick={() => onInspectMatch(job, matchResult)}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Why match?</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

      </div>

    </div>
  );
}
