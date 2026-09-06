/**
 * MySQL & XAMPP PHP REST API Service
 * Connects frontend to XAMPP MySQL backend with graceful local cache fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/resumeai-api';

/**
 * Helper to make API requests with timeout
 */
async function apiFetch(endpoint, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Normalize resume object
 */
export function normalizeResumeRecord(r) {
  if (!r) return null;
  let parsedData = r.data || {};
  if (typeof parsedData === 'string') {
    try {
      parsedData = JSON.parse(parsedData);
    } catch {
      parsedData = {};
    }
  }

  return {
    id: r.id || `resume_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: r.userId || r.user_id || 'guest',
    user_id: r.user_id || r.userId || 'guest',
    title: r.title || (parsedData?.personal?.fullName ? `${parsedData?.personal?.fullName} Resume` : 'Untitled Resume'),
    theme: r.theme || 'modern',
    themeColor: r.themeColor || r.theme_color || '#4f46e5',
    theme_color: r.theme_color || r.themeColor || '#4f46e5',
    data: parsedData,
    updatedAt: r.updatedAt || r.updated_at || new Date().toISOString(),
    createdAt: r.createdAt || r.created_at || new Date().toISOString()
  };
}

/**
 * Register user in MySQL via PHP Backend
 */
export async function registerUserWithMysql(formData) {
  const user = {
    uid: formData.uid || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: formData.name.trim(),
    email: formData.email.toLowerCase().trim(),
    password: formData.password || '',
    photoURL: formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.email.toLowerCase().trim())}`
  };

  // Try MySQL Backend API first
  try {
    const result = await apiFetch('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    if (result?.user) {
      syncUserLocally({ ...result.user, password: user.password });
      return result.user;
    }
  } catch (apiErr) {
    if (
      apiErr.message?.includes('already exists') ||
      apiErr.message?.includes('required') ||
      apiErr.message?.includes('characters')
    ) {
      throw apiErr;
    }
    console.warn('[MySQL API] Backend offline, registering in local storage:', apiErr.message);
  }

  // Fallback to local storage
  const rawUsers = localStorage.getItem('local_registered_users') || '[]';
  const users = JSON.parse(rawUsers);
  const existing = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in.');
  }
  users.push(user);
  localStorage.setItem('local_registered_users', JSON.stringify(users));
  return user;
}

/**
 * Login user via MySQL PHP API
 */
export async function loginUserWithMysql(credentials) {
  const email = credentials.email.toLowerCase().trim();
  const password = credentials.password;

  // Try MySQL Backend API first
  try {
    const result = await apiFetch('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (result?.user) {
      syncUserLocally({ ...result.user, password });
      return result.user;
    }
  } catch (apiErr) {
    if (
      apiErr.message?.includes('Incorrect password') ||
      apiErr.message?.includes('No account found') ||
      apiErr.message?.includes('required')
    ) {
      throw apiErr;
    }
    console.warn('[MySQL API] Backend offline, authenticating via local storage:', apiErr.message);
  }

  // Fallback to local storage
  const rawUsers = localStorage.getItem('local_registered_users') || '[]';
  const users = JSON.parse(rawUsers);
  const found = users.find(u => u.email.toLowerCase() === email);

  if (!found) {
    throw new Error('No account found with this email. Please create an account first.');
  }

  if (found.password && found.password !== password) {
    throw new Error('Incorrect password. Please check and try again.');
  }

  return found;
}

/**
 * Helper to cache user locally
 */
function syncUserLocally(profileData) {
  try {
    const rawUsers = localStorage.getItem('local_registered_users') || '[]';
    const users = JSON.parse(rawUsers);
    const idx = users.findIndex(u => u.uid === profileData.uid || u.email === profileData.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...profileData };
    } else {
      users.push(profileData);
    }
    localStorage.setItem('local_registered_users', JSON.stringify(users));
  } catch (e) {}
}

/**
 * Sync user profile to MySQL
 */
export async function syncUserWithMysql(profileData) {
  if (!profileData?.uid) return;
  syncUserLocally(profileData);

  try {
    await apiFetch('/auth.php?action=sync', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  } catch (e) {
    // silently catch offline
  }
}

/**
 * Save resume to MySQL and local cache
 */
export async function saveResumeToMysql(userId, resumeRecord) {
  const normalized = normalizeResumeRecord({
    ...resumeRecord,
    userId: userId || 'guest',
    updatedAt: new Date().toISOString()
  });

  const storageUserId = userId || 'guest';
  
  // Cache in localStorage first for instant UI response
  try {
    const rawLib = localStorage.getItem(`saved_resumes_library_${storageUserId}`);
    let list = rawLib ? JSON.parse(rawLib) : [];
    const idx = list.findIndex(r => r.id === normalized.id);
    if (idx >= 0) {
      list[idx] = normalized;
    } else {
      list = [normalized, ...list];
    }
    localStorage.setItem(`saved_resumes_library_${storageUserId}`, JSON.stringify(list));
    localStorage.setItem(`resumeData_${storageUserId}`, JSON.stringify(normalized.data));
  } catch (e) {}

  // Send to MySQL PHP API
  try {
    const res = await apiFetch('/resumes.php', {
      method: 'POST',
      body: JSON.stringify(normalized)
    });
    return { status: 'success', storage: 'mysql', resumeId: normalized.id, ...res };
  } catch (err) {
    console.warn('[MySQL API] Saved to local storage (MySQL unreachable):', err.message);
    return { status: 'success', storage: 'local', resumeId: normalized.id };
  }
}

/**
 * Fetch all resumes for user from MySQL & local cache
 */
export async function getResumesFromMysql(userId) {
  const storageUserId = userId || 'guest';
  let localList = [];
  try {
    const raw = localStorage.getItem(`saved_resumes_library_${storageUserId}`);
    if (raw) {
      localList = JSON.parse(raw).map(normalizeResumeRecord).filter(Boolean);
    }
  } catch (e) {}

  // Fetch from MySQL API
  try {
    const serverList = await apiFetch(`/resumes.php?userId=${encodeURIComponent(storageUserId)}`);
    if (Array.isArray(serverList)) {
      const normalizedServer = serverList.map(normalizeResumeRecord).filter(Boolean);
      // Merge with local storage
      const combinedMap = new Map();
      [...normalizedServer, ...localList].forEach(item => {
        if (!combinedMap.has(item.id)) {
          combinedMap.set(item.id, item);
        }
      });
      const merged = Array.from(combinedMap.values());
      localStorage.setItem(`saved_resumes_library_${storageUserId}`, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('[MySQL API] Loaded from local cache (MySQL unreachable):', err.message);
  }

  return localList;
}

/**
 * Delete resume from MySQL & local storage
 */
export async function deleteResumeFromMysql(userId, resumeId) {
  const storageUserId = userId || 'guest';
  try {
    const raw = localStorage.getItem(`saved_resumes_library_${storageUserId}`);
    if (raw) {
      const list = JSON.parse(raw).filter(r => r.id !== resumeId);
      localStorage.setItem(`saved_resumes_library_${storageUserId}`, JSON.stringify(list));
    }
  } catch (e) {}

  try {
    await apiFetch(`/resumes.php?id=${encodeURIComponent(resumeId)}&userId=${encodeURIComponent(storageUserId)}`, {
      method: 'DELETE'
    });
  } catch (e) {}

  return { status: 'success' };
}

/**
 * Submit job application to MySQL
 */
export async function submitApplicationToMysql(applicationData) {
  const record = {
    ...applicationData,
    submittedAt: applicationData.submittedAt || new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem('submitted_job_applications') || '[]';
    const list = JSON.parse(raw);
    const updated = [record, ...list.filter(a => a.id !== record.id)];
    localStorage.setItem('submitted_job_applications', JSON.stringify(updated));
  } catch (e) {}

  try {
    const res = await apiFetch('/applications.php', {
      method: 'POST',
      body: JSON.stringify(record)
    });
    return { status: 'success', storage: 'mysql', ...res };
  } catch (err) {
    console.warn('[MySQL API] Application cached locally:', err.message);
    return { status: 'success', storage: 'local' };
  }
}

/**
 * Fetch all job applications
 */
export async function getApplicationsFromMysql(userId) {
  let localList = [];
  try {
    const raw = localStorage.getItem('submitted_job_applications') || '[]';
    localList = JSON.parse(raw);
  } catch (e) {}

  try {
    const url = userId ? `/applications.php?userId=${encodeURIComponent(userId)}` : '/applications.php';
    const serverList = await apiFetch(url);
    if (Array.isArray(serverList)) {
      return serverList;
    }
  } catch (e) {}

  if (userId) {
    return localList.filter(a => !a.userId || a.userId === userId);
  }
  return localList;
}

/**
 * Initialize / Check MySQL Connection
 */
export async function initializeMysqlDb() {
  try {
    const res = await apiFetch('/setup.php');
    return { status: 'active', storage: 'mysql', ...res };
  } catch (e) {
    return { status: 'active', storage: 'local', message: 'Local storage active (MySQL offline)' };
  }
}
