import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, Briefcase, User, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getActiveUser } from '../../utils/auth';
import { submitApplicationToMysql } from '../../services/mysqlService';

export default function ApplyModal({ job, activeResume, onClose }) {
  const activeUser = getActiveUser();
  const [applicantName, setApplicantName] = useState(activeResume?.personal?.fullName || activeUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(activeResume?.personal?.email || activeUser?.email || '');
  const [coverNote, setCoverNote] = useState(`Dear Hiring Team at ${job?.company || 'Company'},\n\nI am excited to submit my application for the ${job?.title || 'Position'} role. With my background as a ${activeResume?.personal?.title || 'Professional'} and key skills in ${activeResume?.skills || 'industry tools'}, I am confident in my ability to add immediate value to your team.\n\nBest regards,\n${activeResume?.personal?.fullName || activeUser?.name || 'Applicant'}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) {
      toast.error('Please enter your full name and email address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Submitting 1-Click Application to ${job?.company}...`);

    try {
      const applicationId = `app_${Date.now()}`;
      const currentUser = getActiveUser();
      const currentUserId = currentUser ? currentUser.uid : 'guest';
      const appRecord = {
        id: applicationId,
        userId: currentUserId,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        applicantName,
        applicantEmail,
        coverNote,
        submittedAt: new Date().toISOString(),
        resumeSnapshot: activeResume
      };

      // Save to localStorage applications feed
      const rawApps = localStorage.getItem('submitted_job_applications') || '[]';
      const existingApps = JSON.parse(rawApps);
      localStorage.setItem('submitted_job_applications', JSON.stringify([appRecord, ...existingApps]));

      // Save to MySQL database
      await submitApplicationToMysql(appRecord);

      setIsSubmitting(false);
      setIsApplied(true);
      toast.success(`Application submitted to ${job?.company}!`, { id: toastId });
    } catch (e) {
      setIsSubmitting(false);
      toast.error('Failed to submit application.', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {isApplied ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Application Received!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your resume and cover note have been successfully submitted directly to <strong className="text-indigo-400">{job?.company}</strong> for the position of <strong className="text-white">{job?.title}</strong>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Done & Return to Jobs
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold mb-2">
                <Sparkles size={12} /> 1-Click Direct Application
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Apply for <span className="text-indigo-400">{job?.title}</span>
              </h3>
              <p className="text-xs text-slate-400">{job?.company} • {job?.location || 'Remote'}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                  <User size={13} className="text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-indigo-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                  <FileText size={13} className="text-indigo-400" /> AI-Generated Cover Note
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} /> {isSubmitting ? 'Submitting Application...' : 'Submit Application Now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
