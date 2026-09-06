/**
 * Intelligent client-side Resume Text Parser utility
 * Extracts contact details, summary, work experience, education, and skills from uploaded text/PDF files.
 */
export async function parseResumeText(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let fullName = '';
  let email = '';
  let phone = '';
  let location = '';
  let title = '';
  let summary = '';
  let skills = '';
  const experience = [];
  const education = [];

  // Extract Email via RegEx
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // Extract Phone Number via RegEx
  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Extract First non-contact line as candidate name
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.match(/\d{5,}/) && line.length < 40 && !fullName) {
      fullName = line;
      break;
    }
  }

  // Extract Title from top section
  for (const line of lines.slice(1, 8)) {
    if (line !== fullName && !line.includes('@') && line.length < 50 && !title) {
      if (/engineer|developer|manager|nurse|lawyer|attorney|analyst|designer|consultant|specialist|officer|director|lead/i.test(line)) {
        title = line;
        break;
      }
    }
  }

  if (!title) title = 'Professional';

  // Section Segmentation
  let currentSection = 'summary';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/summary|about|profile|objective/i.test(line) && line.length < 30) {
      currentSection = 'summary';
      continue;
    } else if (/experience|employment|work history|career/i.test(line) && line.length < 30) {
      currentSection = 'experience';
      continue;
    } else if (/education|academic|qualification|university|college/i.test(line) && line.length < 30) {
      currentSection = 'education';
      continue;
    } else if (/skills|technologies|competencies|tools|expertise/i.test(line) && line.length < 30) {
      currentSection = 'skills';
      continue;
    }

    if (currentSection === 'summary' && line !== fullName && line !== title && !line.includes(email) && !line.includes(phone)) {
      summary += (summary ? ' ' : '') + line;
    } else if (currentSection === 'skills') {
      skills += (skills ? ', ' : '') + line.replace(/[•\-\*]/g, '');
    } else if (currentSection === 'experience') {
      if (line.length > 5) {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          if (experience.length > 0) {
            experience[experience.length - 1].description += '\n' + line;
          } else {
            experience.push({ position: title, company: 'Company', startDate: '', endDate: 'Present', description: line });
          }
        } else if (/20\d\d|19\d\d|Present|Current/i.test(line)) {
          experience.push({ position: line, company: 'Organization', startDate: '', endDate: 'Present', description: '' });
        }
      }
    } else if (currentSection === 'education') {
      if (/degree|bachelor|master|phd|b\.s|m\.s|diploma|university|college/i.test(line)) {
        education.push({ degree: line, school: 'Institution', startDate: '', endDate: '' });
      }
    }
  }

  // Ensure default structures
  if (experience.length === 0) {
    experience.push({
      position: title || 'Professional Role',
      company: 'Enterprise Inc.',
      startDate: '2021-01',
      endDate: 'Present',
      description: '• Spearheaded project execution and cross-functional team collaboration.'
    });
  }

  if (education.length === 0) {
    education.push({
      degree: 'Bachelor of Science',
      school: 'University',
      startDate: '2016-09',
      endDate: '2020-05'
    });
  }

  return {
    personal: {
      fullName: fullName || 'Candidate Name',
      email: email || 'candidate@example.com',
      countryCode: '+91',
      phone: phone || '9876543210',
      location: location || 'City, Country',
      title: title || 'Professional',
      linkedin: '',
      github: '',
      photo: ''
    },
    summary: summary.slice(0, 400) || `Results-driven ${title} with proven expertise in delivering operational excellence and high-impact deliverables.`,
    experience,
    education,
    skills: skills || 'Project Management, Team Leadership, Problem Solving, Communication'
  };
}
