import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Filter,
  ShieldCheck,
  Radio
} from 'lucide-react';
import toast from 'react-hot-toast';

import { INITIAL_JOBS_FEED, fetchLiveJobsFromAPI, getCachedLiveJobs } from '../services/jobService';
import { calculateJobMatch } from '../services/matchingEngine';
import { tailorResumeForJob } from '../services/aiService';
import { realtimeNotifier } from '../services/sseService';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

import JobCard from '../components/jobs/JobCard';
import JobFilterBar from '../components/jobs/JobFilterBar';
import MatchBreakdownModal from '../components/jobs/MatchBreakdownModal';

export default function JobBoard() {
  const navigate = useNavigate();

  // Active Candidate Resume state
  const [activeResume, setActiveResume] = useState(() => {
    const raw = localStorage.getItem('pending_imported_resume');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return SAMPLE_RESUMES[0].data;
  });

  const [activeResumeTitle, setActiveResumeTitle] = useState(() => {
    return activeResume.personal?.title || SAMPLE_RESUMES[0].title;
  });

  // Dynamic Live Jobs state
  const [liveJobsList, setLiveJobsList] = useState(() => getCachedLiveJobs());
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [jobSource, setJobSource] = useState('all'); // 'all' | 'live' | 'verified'

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(40);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedATS, setSelectedATS] = useState('All');

  // Selected Job for Match Breakdown Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatchResult, setSelectedMatchResult] = useState(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Auto-fetch live jobs on mount if no cached jobs exist
  useEffect(() => {
    const loadLiveJobs = async () => {
      setIsLoadingLive(true);
      const jobs = await fetchLiveJobsFromAPI();
      if (jobs && jobs.length > 0) {
        setLiveJobsList(jobs);
        toast.success(`Connected to Live Job API! Loaded ${jobs.length} real-time positions.`, { id: 'live-jobs-toast' });
      }
      setIsLoadingLive(false);
    };

    loadLiveJobs();
  }, []);

  const handleRefreshLiveJobs = async () => {
    setIsLoadingLive(true);
    const toastId = toast.loading('Connecting to live job APIs (Arbeitnow & Jobicy)...');
    const jobs = await fetchLiveJobsFromAPI();
    setIsLoadingLive(false);

    if (jobs && jobs.length > 0) {
      setLiveJobsList(jobs);
      toast.success(`Refreshed! Found ${jobs.length} active live vacancies.`, { id: toastId });
    } else {
      toast.error('Unable to reach external job APIs right now. Displaying verified positions.', { id: toastId });
    }
  };

  // Subscribe to SSE Real-time Notification Feed
  useEffect(() => {
    const unsubscribe = realtimeNotifier.subscribe((eventData) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-xs text-white">{eventData.title}</div>
            <div className="text-[11px] text-slate-300">{eventData.message}</div>
          </div>
        </div>
      ), { duration: 4000, position: 'bottom-right' });
    });

    return () => unsubscribe();
  }, []);

  // Combined Jobs list based on source tab
  const combinedJobsFeed = useMemo(() => {
    if (jobSource === 'live') {
      return liveJobsList.length > 0 ? liveJobsList : INITIAL_JOBS_FEED;
    }
    if (jobSource === 'verified') {
      return INITIAL_JOBS_FEED;
    }
    // 'all' -> combine live jobs + verified initial jobs, avoiding exact duplicates
    const combined = [...liveJobsList, ...INITIAL_JOBS_FEED];
    return combined;
  }, [liveJobsList, jobSource]);

  // Compute matches for all combined jobs dynamically against active candidate resume
  const matchResultsMap = useMemo(() => {
    const map = {};
    combinedJobsFeed.forEach((job) => {
      map[job.id] = calculateJobMatch(activeResume, job);
    });
    return map;
  }, [activeResume, combinedJobsFeed]);

  // Filtered Jobs List
  const filteredJobs = useMemo(() => {
    return combinedJobsFeed.filter((job) => {
      const match = matchResultsMap[job.id];
      if (match && match.matchScore < minMatchScore) return false;

      if (selectedDepartment !== 'All' && job.department !== selectedDepartment) return false;
      if (selectedRegion !== 'All' && job.region !== selectedRegion) return false;
      if (selectedATS !== 'All' && job.atsType !== selectedATS) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = (job.title || '').toLowerCase().includes(query);
        const companyMatch = (job.company || '').toLowerCase().includes(query);
        const deptMatch = (job.department || '').toLowerCase().includes(query);
        const skillMatch = (job.requiredSkills || []).some((s) => s.toLowerCase().includes(query));
        if (!titleMatch && !companyMatch && !deptMatch && !skillMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      const scoreA = matchResultsMap[a.id]?.matchScore || 0;
      const scoreB = matchResultsMap[b.id]?.matchScore || 0;
      return scoreB - scoreA;
    });
  }, [combinedJobsFeed, matchResultsMap, minMatchScore, selectedDepartment, selectedRegion, selectedATS, searchTerm]);

  // Handle Resume Preset Switch
  const handleSelectPresetResume = (sample) => {
    setActiveResume(sample.data);
    setActiveResumeTitle(sample.title);
    localStorage.setItem('pending_imported_resume', JSON.stringify(sample.data));
    toast.success(`Active resume updated to: ${sample.title}`);
  };

  // Inspect Match Breakdown
  const handleInspectMatch = (job, matchResult) => {
    setSelectedJob(job);
    setSelectedMatchResult(matchResult);
    setIsBreakdownOpen(true);
  };

  // Auto-Tailor Resume for Job
  const handleTailorResume = async (job) => {
    const tailored = await tailorResumeForJob(activeResume, job);
    localStorage.setItem('pending_imported_resume', JSON.stringify(tailored));
    toast.success(`Generated tailored resume variant for ${job.company}!`);
    navigate('/dashboard/builder', { state: { importedResumeData: tailored } });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-extrabold text-white tracking-tight">ResumeAI</span>
          </Link>

          {/* Core App Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <Link
              to="/dashboard"
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Resume Builder
            </Link>
            <Link
              to="/dashboard/jobs"
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
            >
              Real-Time Jobs
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-8 gap-6 sm:gap-8">
        
        {/* Banner: Active Resume Context Switcher */}
        <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Real-Time Matching Active
                </span>
                {liveJobsList.length > 0 && (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Live API Connected ({liveJobsList.length})
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
                Matching Live Positions against: <span className="text-indigo-300">{activeResume.personal?.fullName || 'Candidate'} ({activeResumeTitle})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scores dynamically update as live jobs are fetched from external APIs or candidate experience is modified.
              </p>
            </div>
          </div>

          {/* Quick Resume Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 hidden lg:inline">Switch Profile:</span>
            <select
              value={SAMPLE_RESUMES.find(s => s.title === activeResumeTitle)?.id || 'custom'}
              onChange={(e) => {
                const sample = SAMPLE_RESUMES.find(s => s.id === e.target.value);
                if (sample) handleSelectPresetResume(sample);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none font-bold cursor-pointer w-full md:w-auto"
            >
              {SAMPLE_RESUMES.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.title} ({sample.data.personal.fullName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <JobFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minMatchScore={minMatchScore}
          onMinMatchChange={setMinMatchScore}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedATS={selectedATS}
          onATSChange={setSelectedATS}
          jobSource={jobSource}
          onJobSourceChange={setJobSource}
          isLoadingLive={isLoadingLive}
          onRefreshLiveFeed={handleRefreshLiveJobs}
          onResetFilters={() => {
            setSearchTerm('');
            setMinMatchScore(35);
            setSelectedDepartment('All');
            setSelectedRegion('All');
            setSelectedATS('All');
            setJobSource('all');
          }}
        />

        {/* Results Counter Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200">
              Live Job Openings ({filteredJobs.length})
            </h3>
            <span className="text-xs text-slate-500">• Sorted by AI Match Score</span>
          </div>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Direct Apply Ready</span>
          </div>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const matchResult = matchResultsMap[job.id];

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  matchResult={matchResult}
                  onInspectMatch={handleInspectMatch}
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full py-16 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-3">
            <Filter className="w-10 h-10 text-slate-600" />
            <h3 className="text-base font-bold text-white">No jobs matched your current filter criteria</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Try lowering the minimum match score slider or clearing your search keywords.
            </p>
            <button
              onClick={() => {
                setMinMatchScore(40);
                setSearchTerm('');
                setSelectedDepartment('All');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </main>

      {/* Match Breakdown Modal */}
      {selectedJob && selectedMatchResult && (
        <MatchBreakdownModal
          job={selectedJob}
          matchResult={selectedMatchResult}
          isOpen={isBreakdownOpen}
          onClose={() => setIsBreakdownOpen(false)}
          onApplyDirect={(job) => {
            if (job?.applyUrl) {
              window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          onTailorResume={handleTailorResume}
        />
      )}

      {/* Page Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950">
        ResumeAI Real-Time Matching Engine • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
