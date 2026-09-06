import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ResumePreview from '../components/ResumePreview';
import { Briefcase, ArrowLeft, Download, Share2 } from 'lucide-react';
import { exportToPdfMobile } from '../utils/pdfExport';
import toast from 'react-hot-toast';

export default function SharedResume() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const { resumeData, theme, color } = useMemo(() => {
    try {
      const encoded = searchParams.get('data');
      if (encoded) {
        const jsonStr = decodeURIComponent(atob(encoded));
        const parsed = JSON.parse(jsonStr);
        return {
          resumeData: parsed.data || parsed,
          theme: parsed.theme || 'modern',
          color: parsed.color || '#00C853'
        };
      }
    } catch (e) {
      console.error('Failed to parse shared resume payload:', e);
    }
    return { resumeData: null, theme: 'modern', color: '#00C853' };
  }, [location.search]);

  const previewRef = React.useRef(null);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const toastId = toast.loading('Exporting shared resume PDF...');
    try {
      await exportToPdfMobile(previewRef.current, `${resumeData?.personal?.fullName || 'Shared'}_Resume.pdf`);
      toast.success('PDF downloaded!', { id: toastId });
    } catch (e) {
      toast.error('Download failed.', { id: toastId });
    }
  };

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <Briefcase size={40} className="text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Invalid or Expired Resume Link</h2>
          <p className="text-xs text-slate-400">The shared resume link is invalid or incomplete.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
          <ArrowLeft size={16} /> ResumeAI Verified Public Profile
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Public resume link copied to clipboard!');
            }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={13} /> Copy Link
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <Download size={13} /> Download PDF
          </button>
        </div>
      </div>

      {/* Printable / Viewable Container */}
      <div className="w-full max-w-[820px] bg-white shadow-2xl rounded-sm overflow-hidden p-2">
        <div ref={previewRef}>
          <ResumePreview data={resumeData} theme={theme} color={color} />
        </div>
      </div>
    </div>
  );
}
