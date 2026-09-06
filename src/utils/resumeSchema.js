/**
 * Canonical JSON Resume Schema definition and helpers.
 */

export const DEFAULT_RESUME_SCHEMA = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    countryCode: '+1',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    photo: '',
    photoBgColor: '#e5e7eb'
  },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
  certifications: []
};

/**
 * Extracts normalized skill list array from comma-separated string or array.
 */
export function parseSkillsList(skillsInput) {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) {
    return skillsInput.map(s => (typeof s === 'string' ? s.trim() : s.name?.trim())).filter(Boolean);
  }
  return skillsInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Validates and normalizes candidate resume data object
 */
export function normalizeResumeData(raw) {
  if (!raw) return DEFAULT_RESUME_SCHEMA;
  return {
    personal: { ...DEFAULT_RESUME_SCHEMA.personal, ...(raw.personal || {}) },
    summary: raw.summary || '',
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    skills: raw.skills || '',
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : []
  };
}
