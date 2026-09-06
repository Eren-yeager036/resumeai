import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  ArrowRight,
  Code,
  Palette,
  BarChart3,
  LineChart,
  DollarSign,
  Briefcase,
  LogOut,
  User,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getActiveUser, clearActiveUser } from '../utils/auth';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

const SAMPLE_ICONS = {
  'software-dev': Code,
  'ui-ux-designer': Palette,
  'product-manager': Briefcase,
  'data-analyst': BarChart3,
  'marketing-manager': LineChart,
  'finance-specialist': DollarSign
};

export default function Dashboard() {
  const navigate = useNavigate();
  const initialUser = getActiveUser();
  const [userName, setUserName] = useState(() => initialUser?.name || 'User');

  useEffect(() => {
    const active = getActiveUser();
    if (active) {
      setUserName(active.name);
    }
  }, []);

  const handleLogout = () => {
    clearActiveUser();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleCreateBlank = () => {
    localStorage.removeItem('pending_imported_resume');
    navigate('/dashboard/builder', { state: { isNewBlankResume: true } });
  };

  const handleLoadSample = (sample) => {
    localStorage.setItem('pending_imported_resume', JSON.stringify(sample.data));
    toast.success(`Loaded sample: ${sample.title}`);
    navigate('/dashboard/builder', { 
      state: { 
        importedResumeData: sample.data, 
        theme: sample.theme, 
        color: sample.color 
      } 
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Dashboard Top Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-extrabold text-white tracking-tight">ResumeAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
            >
              Resume Workspace
            </Link>
            <Link
              to="/dashboard/jobs"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Briefcase size={13} />
              <span>Real-Time Jobs</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">{userName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-6 lg:px-12 max-w-7xl mx-auto w-full gap-8">
        
        {/* Title Subheader */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Resume Builder Workspace & Templates</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Create a blank resume or select from unique sample templates</p>
          </div>
        </div>

        {/* Unified Cards Grid: Create Resume + Sample Resumes */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch justify-items-center">
          
          {/* Card 1: Create Blank Resume */}
          <div 
            onClick={handleCreateBlank}
            className="w-full max-w-[280px] h-[360px] rounded-[2rem] border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-900/80 flex flex-col items-center justify-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
              <Plus size={32} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Create Blank Resume</span>
            <p className="text-xs text-slate-400 mt-2 text-center">Build a fresh resume from scratch</p>
            <span className="mt-6 px-4 py-1.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-xs font-bold flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              + New Resume
            </span>
          </div>

          {/* Cards 2-7: Unique Sample Resumes */}
          {SAMPLE_RESUMES.map((sample) => {
            const IconComp = SAMPLE_ICONS[sample.id] || Sparkles;
            return (
              <div 
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className="w-full max-w-[280px] h-[360px] rounded-[2rem] border border-slate-800 bg-slate-900 hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: sample.color }}
                    >
                      <IconComp size={20} />
                    </div>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs"
                      style={{ backgroundColor: sample.color }}
                    >
                      {sample.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{sample.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{sample.subtitle}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-slate-200 truncate">{sample.data.personal.fullName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{sample.data.personal.title}</div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 italic mt-1 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      "{sample.data.summary}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1">
                    {sample.previewTags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-950 text-slate-300 text-[10px] font-medium rounded-md border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample(sample);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
                  >
                    Use Sample Resume <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}

        </div>

      </main>

      {/* Page Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950">
        <div>ResumeAI Builder • Local Storage Active</div>
      </footer>
    </div>
  );
}
