/**
 * Standalone User Authentication and Session Manager
 * (No Firebase dependencies)
 */

/**
 * Get the currently logged-in user from the session
 */
export function getActiveUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

/**
 * Check if a user is currently authenticated
 */
export function isUserLoggedIn() {
  return localStorage.getItem('isAuthenticated') === 'true';
}

/**
 * Persist active user session locally
 */
export function setActiveUser(userProfile) {
  if (!userProfile) return null;
  const sanitized = {
    uid: userProfile.uid || `usr_${Date.now()}`,
    name: userProfile.name || userProfile.displayName || userProfile.email?.split('@')[0] || 'User',
    email: userProfile.email || '',
    photoURL: userProfile.photoURL || userProfile.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email || 'user'}`,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('currentUser', JSON.stringify(sanitized));
  localStorage.setItem('userEmail', sanitized.email);
  localStorage.setItem('userName', sanitized.name);
  return sanitized;
}

/**
 * Clear user session on logout
 */
export function clearActiveUser() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
}
