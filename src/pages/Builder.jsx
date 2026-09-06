import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Save, Download, Settings, Plus, Trash2, Maximize2, Minimize2, Image as ImageIcon, Share2, Eye, EyeOff, Layout, Palette, User, Mail, Phone, MapPin, Briefcase, Globe, RotateCcw, Database, Info, Wand2, Calendar, Sparkles, FolderPlus, Bookmark, WifiOff } from 'lucide-react';
import Input from '../components/Input';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import ImageCropper from '../components/ImageCropper';
import { getActiveUser } from '../utils/auth';
import { saveResumeToMysql, getResumesFromMysql } from '../services/mysqlService';
import { generateAiSummary, suggestAiSkills, enhanceBulletPoint } from '../services/aiService';
import { exportToPdfMobile } from '../utils/pdfExport';


const SECTIONS = [
  { id: 'personal', title: 'Personal Info' },
  { id: 'summary', title: 'Summary' },
  { id: 'experience', title: 'Experience' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' }
];

const INITIAL_DATA = {
  personal: {
    fullName: '', email: '', countryCode: '+91', phone: '', location: '', title: '', linkedin: '', github: '', photo: '', originalPhoto: '', transparentPhoto: '', photoBgColor: '#ffffff'
  },
  summary: '',
  experience: [],
  education: [],
  skills: ''
};

function normalizeResumeData(raw) {
  if (!raw) return INITIAL_DATA;
  return {
    ...INITIAL_DATA,
    ...raw,
    personal: {
      ...INITIAL_DATA.personal,
      ...(raw.personal || {})
    },
    summary: raw.summary || '',
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    skills: typeof raw.skills === 'string' ? raw.skills : (Array.isArray(raw.skills) ? raw.skills.join(', ') : '')
  };
}

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getActiveUser());
  const [currentSection, setCurrentSection] = useState(0);

  const passedResume = location.state?.resumeToLoad;

  // Theme & color
  const [theme, setTheme] = useState(passedResume?.theme || location.state?.theme || 'modern');
  const [themeColor, setThemeColor] = useState(
    passedResume?.themeColor || passedResume?.theme_color || location.state?.color || '#00C853'
  );
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showAccentPanel, setShowAccentPanel] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'

  // Offline Mode & Public Share Link state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Multi-Resume Management State
  const [savedResumesList, setSavedResumesList] = useState(() => {
    try {
      const activeUser = getActiveUser();
      const userId = activeUser ? activeUser.uid : 'guest';
      const raw = localStorage.getItem(`saved_resumes_library_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [activeResumeId, setActiveResumeId] = useState(() => {
    if (passedResume?.id) return passedResume.id;
    return 'default';
  });
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  // Initial resume data state
  const [resumeData, setResumeData] = useState(() => {
    if (passedResume?.data) {
      return normalizeResumeData(passedResume.data);
    }
    if (location.state?.isNewBlankResume) {
      return INITIAL_DATA;
    }
    const stateData = location.state?.importedResumeData;
    const pendingImportStr = localStorage.getItem('pending_imported_resume');

    let importToLoad = stateData;
    if (!importToLoad && pendingImportStr) {
      try {
        importToLoad = JSON.parse(pendingImportStr);
      } catch (e) {}
    }

    if (importToLoad) {
      return normalizeResumeData(importToLoad);
    }

    const activeUser = getActiveUser();
    const userId = activeUser ? activeUser.uid : 'guest';
    const savedLocal = localStorage.getItem(`resumeData_${userId}`);
    if (savedLocal) {
      try {
        return normalizeResumeData(JSON.parse(savedLocal));
      } catch (e) {}
    }

    return INITIAL_DATA;
  });

  // Sync auth state and load resumes from MySQL + localStorage
  useEffect(() => {
    const active = getActiveUser();
    if (active) {
      setCurrentUser(active);
    }

    const loadUserResumes = async (userObj) => {
      if (!userObj?.uid) return;
      const rawLib = localStorage.getItem(`saved_resumes_library_${userObj.uid}`);
      let localResumes = [];
      if (rawLib) {
        try {
          localResumes = JSON.parse(rawLib);
          setSavedResumesList(localResumes);
        } catch (e) {}
      }

      // Fetch user's saved resumes from MySQL
      try {
        const dbResumes = await getResumesFromMysql(userObj.uid);
        if (dbResumes && dbResumes.length > 0) {
          setSavedResumesList(dbResumes);
        }
      } catch (dbErr) {
        console.warn('Note loading resumes from MySQL:', dbErr);
      }
    };

    if (active) {
      loadUserResumes(active);
    }
  }, [location.state]);

  // Debounced Auto-Save to Local Storage & Database
  const autoSaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      const activeUser = currentUser || getActiveUser();
      const userId = activeUser ? activeUser.uid : 'guest';
      const resumeIdToSave = activeResumeId !== 'default' ? activeResumeId : 'primary_resume';
      const resumeTitle = `${resumeData?.personal?.fullName || 'Untitled'} - ${resumeData?.personal?.title || 'Resume'}`;

      const record = {
        id: resumeIdToSave,
        userId: userId,
        title: resumeTitle,
        theme,
        themeColor,
        data: resumeData
      };

      // Background save to local storage & MySQL
      await saveResumeToMysql(userId, record);
      
      // Update saved resumes list if matching
      setSavedResumesList(prev => {
        const idx = prev.findIndex(r => r.id === resumeIdToSave);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...record, updatedAt: new Date().toISOString() };
          return updated;
        }
        return prev;
      });

      setSaveStatus('saved');
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [resumeData, theme, themeColor, activeResumeId, currentUser]);

  const containerRef = useRef(null);
  const printRef = useRef(null);
  const innerPreviewRef = useRef(null);
  const [activeMobileTab, setActiveMobileTab] = useState('edit');
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [scale, setScale] = useState(0.85);

  // Auto calculate resume sheet preview scale based on container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 24;
        if (containerWidth > 0) {
          const calculatedScale = Math.min(1, Math.max(0.35, containerWidth / 794));
          setScale(calculatedScale);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeMobileTab]);

  // Save current resume to local storage & MySQL database
  const handleSaveToDatabase = async () => {
    setIsSavingLocal(true);
    setSaveStatus('saving');
    const activeUser = currentUser || getActiveUser();
    const userId = activeUser ? activeUser.uid : 'guest';
    const resumeIdToSave = activeResumeId !== 'default' ? activeResumeId : 'primary_resume';
    const resumeTitle = `${resumeData?.personal?.fullName || 'Untitled'} Resume`;

    const record = {
      id: resumeIdToSave,
      userId: userId,
      title: resumeTitle,
      theme,
      themeColor,
      data: resumeData
    };

    // Save to MySQL database & local storage
    await saveResumeToMysql(userId, record);

    setSavedResumesList(prev => {
      const idx = prev.findIndex(r => r.id === resumeIdToSave);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...record, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [record, ...prev];
    });

    setSaveStatus('saved');
    toast.success('Resume saved & database synced successfully!');
    setTimeout(() => setIsSavingLocal(false), 500);
  };

  // Save current resume as a NEW saved resume version in user's library & MySQL
  const handleSaveAsNewResume = async (titleToSave) => {
    const personal = resumeData?.personal || {};
    const title = titleToSave || newResumeTitle.trim() || `${personal.fullName || 'Untitled'} - ${personal.title || 'Resume'}`;
    const newId = `resume_${Date.now()}`;
    const newRecord = {
      id: newId,
      title: title,
      updatedAt: new Date().toISOString(),
      theme,
      themeColor,
      data: resumeData
    };

    const updatedList = [newRecord, ...savedResumesList.filter(r => r.id !== newId)];
    setSavedResumesList(updatedList);
    setActiveResumeId(newId);

    const activeUser = currentUser || getActiveUser();
    const userId = activeUser ? activeUser.uid : 'guest';

    // Save to MySQL database & local storage
    await saveResumeToMysql(userId, newRecord);

    setNewResumeTitle('');
    setSaveStatus('saved');
    toast.success(`Saved to database as new resume: "${title}"!`);
  };

  // Switch between saved resumes in user's library
  const handleSwitchSavedResume = (resumeId) => {
    if (resumeId === 'default') return;
    const found = savedResumesList.find(r => r.id === resumeId);
    if (found) {
      setResumeData(normalizeResumeData(found.data));
      if (found.theme) setTheme(found.theme);
      if (found.themeColor || found.theme_color) setThemeColor(found.themeColor || found.theme_color);
      setActiveResumeId(found.id);
      toast.success(`Loaded resume: "${found.title}"`);
    }
  };


  // AI Summary Generator using Gemini API
  const handleGenerateSummary = async () => {
    const toastId = toast.loading('Connecting to Gemini AI to generate summary...');
    try {
      const aiSummaryText = await generateAiSummary(
        resumeData?.personal?.title || 'Professional',
        resumeData?.skills || ''
      );
      updateData('summary', null, aiSummaryText);
      toast.success('AI Summary generated successfully with Gemini!', { id: toastId });
    } catch (e) {
      toast.error('Failed to generate summary with AI.', { id: toastId });
    }
  };

  // AI Skill Suggestion Engine using Gemini API
  const handleSuggestSkills = async () => {
    const toastId = toast.loading('Connecting to Gemini AI for skill suggestions...');
    try {
      const suggestedSkills = await suggestAiSkills(resumeData?.personal?.title || 'Professional');
      updateData('skills', null, suggestedSkills);
      toast.success('AI Skill suggestions applied!', { id: toastId });
    } catch (e) {
      toast.error('Failed to suggest skills.', { id: toastId });
    }
  };

  // AI Bullet Point Rewriter using Gemini API
  const handleOptimizeExperienceDescription = async (idx) => {
    const expItem = resumeData?.experience?.[idx] || {};
    const currentText = expItem.description || '';
    const roleTitle = expItem.position || resumeData?.personal?.title || 'Professional';
    const roleCompany = expItem.company || '';
    const toastId = toast.loading(`Gemini AI is generating tailored bullets for ${roleTitle}...`);
    try {
      const enhancedText = await enhanceBulletPoint(currentText, roleTitle, roleCompany);
      handleArrayUpdate('experience', idx, 'description', enhancedText);
      toast.success(`AI Bullets tailored for ${roleTitle}!`, { id: toastId });
    } catch (e) {
      toast.error('Failed to enhance bullet points.', { id: toastId });
    }
  };

  // Direct Mobile-Friendly PDF Export
  const handleMobileDownloadPdf = async () => {
    if (!innerPreviewRef.current) return;
    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating direct PDF download...');
    try {
      await exportToPdfMobile(innerPreviewRef.current, `${resumeData?.personal?.fullName || 'Resume'}_CV.pdf`);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Direct PDF export failed. Using browser print fallback.', { id: toastId });
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const updateData = (section, field, value) => {
    setResumeData(prev => {
      const safePrev = prev || INITIAL_DATA;
      if (section === 'personal') {
        return { ...safePrev, personal: { ...(safePrev.personal || {}), [field]: value } };
      }
      return { ...safePrev, [section]: value };
    });
  };

  const handleArrayAdd = (section, defaultObj) => {
    setResumeData(prev => ({
      ...(prev || INITIAL_DATA),
      [section]: [...((prev && prev[section]) || []), defaultObj]
    }));
  };

  const handleArrayUpdate = (section, index, field, value) => {
    setResumeData(prev => {
      const arr = [...((prev && prev[section]) || [])];
      arr[index] = { ...(arr[index] || {}), [field]: value };
      return { ...(prev || INITIAL_DATA), [section]: arr };
    });
  };

  const handleArrayRemove = (section, index) => {
    setResumeData(prev => ({
      ...(prev || INITIAL_DATA),
      [section]: ((prev && prev[section]) || []).filter((_, i) => i !== index)
    }));
  };

  const handleGoToJobPortal = () => {
    localStorage.setItem('pending_imported_resume', JSON.stringify(resumeData));
    toast.success('Resume connected! Navigating to Real-Time Job Portal...');
    navigate('/dashboard/jobs');
  };

  const handleEraseAllDetails = () => {
    if (window.confirm("Are you sure you want to erase all resume details and picture? This will clear everything to create a fresh new resume.")) {
      setResumeData(INITIAL_DATA);
      setCropImageSrc(null);
      setCurrentSection(0);

      const activeUser = currentUser || getActiveUser();
      const userId = activeUser ? activeUser.uid : 'guest';
      const localKey = `resumeData_${userId}`;
      localStorage.setItem(localKey, JSON.stringify(INITIAL_DATA));

      toast.success('All resume details & picture erased! Ready to create a new resume.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedDataUrl) => {
    updateData('personal', 'photo', croppedDataUrl);
    setCropImageSrc(null);
    toast.success('Photo uploaded successfully!');
  };

  const handleRemovePhoto = () => {
    updateData('personal', 'photo', '');
    toast.success('Photo removed');
  };

  const handleCopyShareLink = () => {
    try {
      const payload = { data: resumeData, theme, color: themeColor };
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
      const shareUrl = `${window.location.origin}/share?data=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Public Read-Only Resume link copied to clipboard!');
    } catch (e) {
      toast.error('Failed to generate share link.');
    }
  };

  const nextSection = () => {
    if (currentSection < SECTIONS.length - 1) setCurrentSection(prev => prev + 1);
  };

  const prevSection = () => {
    if (currentSection > 0) setCurrentSection(prev => prev - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col overflow-hidden bg-gray-50 font-sans">
      <div className="hidden print:block font-sans">
        <div ref={printRef} id="printable-resume" className="printable-resume-wrapper">
          <ResumePreview data={resumeData} theme={theme} color={themeColor} />
        </div>
      </div>

      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropImageSrc(null)} 
        />
      )}
      
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1 text-center text-xs font-bold flex items-center justify-center gap-2 z-30 shrink-0 shadow-sm">
          <WifiOff size={14} />
          <span>Offline Mode Active — Edits & PDF Exports are cached locally and will sync when back online.</span>
        </div>
      )}

      {/* Sub Header */}
      <div className="min-h-14 bg-gray-50/90 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 py-2 flex flex-wrap justify-between items-center shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Link to="/dashboard" className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-xs sm:text-sm">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Back to Workspace</span><span className="sm:hidden">Back</span>
          </Link>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <button
            onClick={handleGoToJobPortal}
            className="px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Match this resume against live job openings in real-time"
          >
            <Briefcase size={13} />
            <Sparkles size={12} className="animate-pulse" />
            <span>Find Jobs</span>
          </button>

          {/* Database Live Auto-Save Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 shadow-xs">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-amber-600">Saving to DB...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <Database size={11} className="text-emerald-600" />
                <span className="text-emerald-700">Database Synced</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          {/* Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Copy Public Read-Only Share Link"
          >
            <Share2 size={13} /> <span>Share Link</span>
          </button>

          {/* Multi-Resume Selector if library contains saved resumes */}
          {savedResumesList.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-xs">
              <Bookmark size={12} className="text-indigo-600 shrink-0" />
              <select
                value={activeResumeId}
                onChange={(e) => handleSwitchSavedResume(e.target.value)}
                className="text-[11px] font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="default">My Saved Library ({savedResumesList.length})</option>
                {savedResumesList.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleSaveToDatabase}
            disabled={isSavingLocal}
            className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Save current resume"
          >
            <Save size={13} /> <span>{isSavingLocal ? 'Saving...' : 'Save'}</span>
          </button>

          <button 
            onClick={() => {
              const defaultName = `${resumeData?.personal?.fullName || 'My'}_${resumeData?.personal?.title || 'Resume'}`;
              const title = prompt('Enter a title to save this resume version into your library:', defaultName);
              if (title) handleSaveAsNewResume(title);
            }}
            className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Save as a new separate resume version in your personal library"
          >
            <FolderPlus size={13} /> <span>Save As New</span>
          </button>

          <button 
            onClick={handleEraseAllDetails}
            className="px-2.5 sm:px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            title="Erase all details and picture to create a new resume"
          >
            <Trash2 size={13} /> <span className="hidden sm:inline">Erase</span>
          </button>

          <button 
            onClick={handleMobileDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Download PDF directly (Works on Mobile iOS/Android & Desktop)"
          >
            <Download size={13} /> <span>{isDownloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-gray-200/90 p-1 rounded-xl mx-4 my-1 shrink-0 border border-gray-300 shadow-inner justify-center gap-1 z-20">
        <button
          type="button"
          onClick={() => setActiveMobileTab('edit')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'edit'
              ? 'bg-white text-gray-900 shadow-md border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User size={15} /> Edit Form
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMobileTab === 'preview'
              ? 'bg-white text-gray-900 shadow-md border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye size={15} /> Live Preview
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full lg:w-[480px] xl:w-[540px] border-r border-gray-200 bg-white flex flex-col shrink-0 z-10 transition-all ${
          activeMobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-white overflow-x-auto shrink-0 scrollbar-none">
            {SECTIONS.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => setCurrentSection(idx)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                  currentSection === idx
                    ? 'border-primary text-primary bg-indigo-50/30'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                  currentSection === idx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                {sec.title}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThemePanel(!showThemePanel)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  showThemePanel ? 'bg-indigo-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Layout size={14} /> Template
              </button>
              <button
                onClick={() => setShowAccentPanel(!showAccentPanel)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  showAccentPanel ? 'bg-indigo-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette size={14} /> Accent
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSection}
                disabled={currentSection === 0}
                className="px-2.5 py-1 text-xs font-bold text-gray-500 disabled:opacity-40 hover:text-gray-900 transition-colors"
              >
                &lt; Prev
              </button>
              <button
                onClick={nextSection}
                disabled={currentSection === SECTIONS.length - 1}
                className="px-3 py-1 text-xs font-bold bg-gray-900 text-white rounded-lg disabled:opacity-40 hover:bg-primary transition-colors"
              >
                Next &gt;
              </button>
            </div>
          </div>

          {/* Theme Selection Panel Dropdown */}
          <AnimatePresence>
            {showThemePanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-indigo-50/50 border-b border-gray-200 p-4 shrink-0 overflow-hidden"
              >
                <div className="text-xs font-bold text-gray-700 mb-2">Select Template Layout</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'modern', label: 'Modern', desc: 'Clean & Tech' },
                    { id: 'creative', label: 'Creative', desc: 'Bold Header' },
                    { id: 'classic', label: 'Classic', desc: 'Traditional' },
                    { id: 'professional', label: 'Executive', desc: 'Two Column' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemePanel(false); }}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                        theme === t.id ? 'bg-white border-primary text-primary shadow-sm ring-2 ring-primary/20' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>{t.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Accent Color Selection Panel Dropdown */}
          <AnimatePresence>
            {showAccentPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-indigo-50/50 border-b border-gray-200 p-4 shrink-0 overflow-hidden"
              >
                <div className="text-xs font-bold text-gray-700 mb-2">Select Accent Theme Color</div>
                <div className="flex flex-wrap gap-2">
                  {['#00C853', '#6366f1', '#ec4899', '#0284c7', '#d97706', '#059669', '#111827'].map(c => (
                    <button
                      key={c}
                      onClick={() => { setThemeColor(c); setShowAccentPanel(false); }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        themeColor === c ? 'scale-110 border-gray-900 shadow-md' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor Form Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Section 0: Personal Info */}
            {currentSection === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
                  <p className="text-xs text-gray-500">Get Started with the personal information</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative bg-gray-100"
                    >
                      {resumeData.personal.photo ? (
                        <img 
                          src={resumeData.personal.photo} 
                          alt="User Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="text-gray-400" size={24} />
                      )}
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors shadow-xs">
                        <ImageIcon size={14} className="text-primary" />
                        <span>Upload User Image</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {resumeData.personal.photo && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    label="Full Name" 
                    placeholder="e.g. Alex Vance" 
                    value={resumeData?.personal?.fullName || ''}
                    onChange={(e) => updateData('personal', 'fullName', e.target.value)} 
                  />
                  <Input 
                    label="Professional Title" 
                    placeholder="e.g. Senior Software Engineer" 
                    value={resumeData?.personal?.title || ''}
                    onChange={(e) => updateData('personal', 'title', e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    label="Email Address" 
                    placeholder="e.g. alex@example.com" 
                    type="email"
                    value={resumeData?.personal?.email || ''}
                    onChange={(e) => updateData('personal', 'email', e.target.value)} 
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="e.g. 9876543210" 
                    value={resumeData?.personal?.phone || ''}
                    onChange={(e) => updateData('personal', 'phone', e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    label="Location / City" 
                    placeholder="e.g. San Francisco, CA" 
                    value={resumeData?.personal?.location || ''}
                    onChange={(e) => updateData('personal', 'location', e.target.value)} 
                  />
                  <Input 
                    label="LinkedIn Profile" 
                    placeholder="linkedin.com/in/username" 
                    value={resumeData?.personal?.linkedin || ''}
                    onChange={(e) => updateData('personal', 'linkedin', e.target.value)} 
                  />
                </div>
              </div>
            )}

            {/* Section 1: Summary */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Professional Summary</h3>
                    <p className="text-xs text-gray-500">Briefly introduce your career highlights</p>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 size={13} /> AI Generate
                  </button>
                </div>

                <textarea
                  rows={6}
                  placeholder="Write a concise overview of your background, key strengths, and career goals..."
                  value={resumeData.summary}
                  onChange={(e) => updateData('summary', null, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Section 2: Experience */}
            {currentSection === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Work Experience</h3>
                    <p className="text-xs text-gray-500">Add your previous roles and accomplishments</p>
                  </div>
                  <button
                    onClick={() => handleArrayAdd('experience', { position: '', company: '', location: '', startDate: '', endDate: '', description: '' })}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Add Role
                  </button>
                </div>

                {(resumeData.experience || []).map((exp, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">Role #{idx + 1}</span>
                      <button
                        onClick={() => handleArrayRemove('experience', idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Job Title / Position"
                        placeholder="e.g. Lead Developer"
                        value={exp.position}
                        onChange={(e) => handleArrayUpdate('experience', idx, 'position', e.target.value)}
                      />
                      <Input
                        label="Company Name"
                        placeholder="e.g. Apex Tech"
                        value={exp.company}
                        onChange={(e) => handleArrayUpdate('experience', idx, 'company', e.target.value)}
                      />
                    </div>

                    {/* Interactive Calendar Month Picker */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Calendar size={13} className="text-primary" /> Start Date (Month / Year)
                        </label>
                        <input
                          type="month"
                          value={exp.startDate || ''}
                          onChange={(e) => handleArrayUpdate('experience', idx, 'startDate', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Calendar size={13} className="text-primary" /> End Date (Month / Year)
                        </label>
                        <input
                          type="month"
                          value={exp.endDate || ''}
                          onChange={(e) => handleArrayUpdate('experience', idx, 'endDate', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-700">Description / Responsibilities</label>
                        <button
                          type="button"
                          onClick={() => handleOptimizeExperienceDescription(idx)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Wand2 size={12} /> AI Fix Grammar
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="• Key responsibility or achievement..."
                        value={exp.description}
                        onChange={(e) => handleArrayUpdate('experience', idx, 'description', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 3: Education */}
            {currentSection === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Education</h3>
                    <p className="text-xs text-gray-500">List academic degrees and certifications</p>
                  </div>
                  <button
                    onClick={() => handleArrayAdd('education', { degree: '', school: '', location: '', startDate: '', endDate: '', description: '' })}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Add Education
                  </button>
                </div>

                {(resumeData.education || []).map((edu, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">Education #{idx + 1}</span>
                      <button
                        onClick={() => handleArrayRemove('education', idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Degree / Major"
                        placeholder="e.g. B.S. in Computer Science"
                        value={edu.degree}
                        onChange={(e) => handleArrayUpdate('education', idx, 'degree', e.target.value)}
                      />
                      <Input
                        label="School / University"
                        placeholder="e.g. UC Berkeley"
                        value={edu.school}
                        onChange={(e) => handleArrayUpdate('education', idx, 'school', e.target.value)}
                      />
                    </div>

                    {/* Interactive Calendar Month Picker */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Calendar size={13} className="text-primary" /> Start Date (Month / Year)
                        </label>
                        <input
                          type="month"
                          value={edu.startDate || ''}
                          onChange={(e) => handleArrayUpdate('education', idx, 'startDate', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Calendar size={13} className="text-primary" /> End Date (Month / Year)
                        </label>
                        <input
                          type="month"
                          value={edu.endDate || ''}
                          onChange={(e) => handleArrayUpdate('education', idx, 'endDate', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 4: Skills */}
            {currentSection === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Core Skills & Technical Keywords</h3>
                    <p className="text-xs text-gray-500">Comma-separated list of skills</p>
                  </div>
                  <button
                    onClick={handleSuggestSkills}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 size={13} /> AI Suggest
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder="e.g. React, Node.js, TypeScript, Python, Figma, TailwindCSS, PostgreSQL"
                  value={resumeData.skills}
                  onChange={(e) => updateData('skills', null, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Column */}
        <div ref={containerRef} className={`flex-1 bg-gray-100 p-6 overflow-auto items-center justify-center ${
          activeMobileTab === 'edit' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div 
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top center',
              width: '794px',
              minHeight: '1123px'
            }}
            className="bg-white shadow-2xl rounded-sm overflow-hidden transition-transform duration-200"
          >
            <div ref={innerPreviewRef}>
              <ResumePreview data={resumeData} theme={theme} color={themeColor} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
