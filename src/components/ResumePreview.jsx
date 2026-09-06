import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const LinkedinIcon = ({ size = 13, className, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = ({ size = 13, className, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present') return 'Present';
  
  const match = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const [_, year, month] = match;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  }
  return dateStr;
};

const formatDisplayUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?/, '');
  cleaned = cleaned.replace(/\/$/, '');
  if (cleaned.length > 40) {
    return cleaned.substring(0, 37) + '...';
  }
  return cleaned;
};

const ResumePreview = forwardRef(({ data, theme, color }, ref) => {
  const safeData = data || { personal: {}, summary: '', experience: [], education: [], skills: '' };
  const personal = safeData.personal || {};
  const experience = safeData.experience || [];
  const education = safeData.education || [];
  const skills = safeData.skills || '';

  const getThemeStyles = () => {
    switch(theme) {
      case 'classic':
        return {
          font: 'font-serif',
          headerClass: 'text-center border-b border-gray-800 pb-3 mb-4',
          sectionHeader: 'text-sm font-bold uppercase tracking-widest text-gray-800 mb-2 border-b border-gray-300 pb-1',
          accent: color || '#333333',
        };
      case 'professional':
        return {
          font: 'font-sans',
          headerClass: 'border-l-4 pl-4 mb-4',
          sectionHeader: 'text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 bg-gray-100 px-2 py-1 rounded-sm',
          accent: color || '#2563eb',
        };
      case 'creative':
        return {
          font: 'font-sans',
          headerClass: 'flex flex-col items-start mb-5',
          sectionHeader: 'text-base font-extrabold capitalize text-gray-900 mb-2',
          accent: color || '#ec4899',
        };
      case 'minimal':
        return {
          font: 'font-sans tracking-tight',
          headerClass: 'mb-5',
          sectionHeader: 'text-xs font-bold uppercase tracking-widest text-gray-400 mb-2',
          accent: color || '#111827',
        };
      case 'modern':
      default:
        return {
          font: 'font-sans',
          headerClass: 'flex justify-between items-start border-b border-gray-200 pb-4 mb-4 gap-4',
          sectionHeader: 'text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 border-b border-gray-200 pb-1',
          accent: color || '#00C853',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div 
      ref={ref}
      className={`bg-white text-gray-800 w-full flex flex-col ${styles.font} print:p-0 print:m-0`}
      style={{
        width: '100%',
        maxWidth: '794px',
        height: 'auto',
        minHeight: 'auto',
        padding: '32px 36px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1e293b',
        lineHeight: '1.5',
        ...(theme === 'modern' ? { borderTop: `6px solid ${styles.accent}` } : {})
      }}
    >
      {/* Header */}
      <div 
        className={styles.headerClass} 
        style={theme === 'professional' ? { borderColor: styles.accent } : {}}
      >
        <div className={`flex ${theme === 'modern' ? 'items-center gap-4 flex-1 min-w-0' : 'flex-col items-center gap-3 mb-2'}`}>
          {personal.photo && (
            <div 
              className="w-20 h-20 rounded-full overflow-hidden shrink-0 shadow-sm border border-white flex items-center justify-center"
              style={{ backgroundColor: personal.photoBgColor || '#ffffff' }}
            >
              <img 
                src={personal.photo} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <div className={`${theme !== 'modern' ? 'text-center' : 'min-w-0 flex-1'}`}>
            <h1 
              className="text-2xl font-bold tracking-tight text-gray-900 uppercase" 
              style={{ 
                color: theme === 'creative' ? styles.accent : '#0f172a',
                lineHeight: '1.35',
                paddingBottom: '2px',
                marginBottom: '2px'
              }}
            >
              {personal.fullName || 'YOUR NAME'}
            </h1>
            <h2 
              className="text-sm font-semibold mt-1" 
              style={{ 
                color: theme !== 'creative' ? styles.accent : '#475569',
                lineHeight: '1.35',
                paddingBottom: '2px'
              }}
            >
              {personal.title || 'Professional Title'}
            </h2>
          </div>
        </div>
        
        <div 
          className={`text-xs text-gray-600 ${theme === 'modern' ? 'text-right space-y-1.5 shrink-0 max-w-[50%]' : 'flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2'}`}
          style={{ lineHeight: '1.4' }}
        >
          {personal.email && (
            <p className={`flex items-center gap-1.5 ${theme === 'modern' ? 'justify-end' : ''}`} style={{ margin: '2px 0' }}>
              <Mail size={13} style={{ color: styles.accent }} className="shrink-0" />
              <a href={`mailto:${personal.email}`} className="hover:underline text-gray-700 font-medium" style={{ lineHeight: '1.4' }}>
                {personal.email}
              </a>
            </p>
          )}
          {personal.phone && (
            <p className={`flex items-center gap-1.5 ${theme === 'modern' ? 'justify-end' : ''}`} style={{ margin: '2px 0' }}>
              <Phone size={13} style={{ color: styles.accent }} className="shrink-0" />
              <span className="whitespace-nowrap font-medium" style={{ lineHeight: '1.4' }}>
                {personal.phone.startsWith('+') ? personal.phone : `${personal.countryCode || '+91'} ${personal.phone}`.trim()}
              </span>
            </p>
          )}
          {personal.location && (
            <p className={`flex items-center gap-1.5 ${theme === 'modern' ? 'justify-end' : ''}`} style={{ margin: '2px 0' }}>
              <MapPin size={13} style={{ color: styles.accent }} className="shrink-0" />
              <span className="font-medium" style={{ lineHeight: '1.4' }}>{personal.location}</span>
            </p>
          )}
          {personal.github && (
            <p className={`flex items-center gap-1.5 ${theme === 'modern' ? 'justify-end' : ''}`} style={{ margin: '2px 0' }}>
              <GithubIcon size={13} style={{ stroke: styles.accent }} className="shrink-0" />
              <a 
                href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-700 font-medium"
                style={{ lineHeight: '1.4' }}
                title={personal.github}
              >
                {formatDisplayUrl(personal.github)}
              </a>
            </p>
          )}
          {personal.linkedin && (
            <p className={`flex items-center gap-1.5 ${theme === 'modern' ? 'justify-end' : ''}`} style={{ margin: '2px 0' }}>
              <LinkedinIcon size={13} style={{ stroke: styles.accent }} className="shrink-0" />
              <a 
                href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-700 font-medium"
                style={{ lineHeight: '1.4' }}
                title={personal.linkedin}
              >
                {formatDisplayUrl(personal.linkedin)}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {safeData.summary && (
        <div className="mb-4 break-inside-avoid">
          <h3 className={styles.sectionHeader} style={theme === 'modern' ? { borderColor: styles.accent } : {}}>
            Professional Summary
          </h3>
          <p className="text-xs text-gray-700 whitespace-pre-wrap" style={{ lineHeight: '1.6', margin: '4px 0' }}>{safeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h3 className={styles.sectionHeader} style={theme === 'modern' ? { borderColor: styles.accent } : {}}>
            Experience
          </h3>
          <div className="space-y-3.5 mt-2">
            {experience.map((exp, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-0.5" style={{ lineHeight: '1.4' }}>
                  <h4 className="font-bold text-gray-900 text-xs">{exp.position}</h4>
                  <span className="text-[11px] text-gray-500 font-semibold">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                </div>
                <div className="flex justify-between items-baseline mb-1.5" style={{ lineHeight: '1.4' }}>
                  <span className="text-xs font-semibold" style={{ color: styles.accent }}>{exp.company}</span>
                  <span className="text-[11px] text-gray-500">{exp.location}</span>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap" style={{ lineHeight: '1.6', margin: '2px 0' }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h3 className={styles.sectionHeader} style={theme === 'modern' ? { borderColor: styles.accent } : {}}>
            Education
          </h3>
          <div className="space-y-2.5 mt-2">
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start break-inside-avoid" style={{ lineHeight: '1.4' }}>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{edu.degree}</h4>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: styles.accent }}>{edu.school}</div>
                  {edu.description && <p className="text-xs text-gray-700 mt-1" style={{ lineHeight: '1.5' }}>{edu.description}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 font-semibold block">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">{edu.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills */}
      {skills && (
        <div className="mb-3 break-inside-avoid">
          <h3 className={styles.sectionHeader} style={theme === 'modern' ? { borderColor: styles.accent } : {}}>
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.split(/[,\n]/).map((skill, i) => skill.trim() && (
              <span 
                key={i} 
                className={`text-[11px] font-semibold ${
                  theme === 'classic' || theme === 'minimal' 
                    ? 'px-0 after:content-[","] last:after:content-[""] mr-1 text-gray-800' 
                    : 'px-2.5 py-1 rounded bg-gray-100 text-gray-800'
                }`}
                style={{ lineHeight: '1.4', display: 'inline-block' }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
