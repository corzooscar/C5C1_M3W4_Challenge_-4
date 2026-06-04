/**
 * Session Management
 * Handles localStorage persistence, logout, and inactivity timeout.
 */

const SESSION_KEY = 'tms_session';
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in ms
let inactivityTimer = null;

/**
 * Saves user data to localStorage.
 * @param {Object} user
 */
export function setSession(user) {
    const sessionData = {
        id:       user.id,
        username: user.username,
        name:     user.name,
        rol:      user.rol,
        roleId:   user.roleId,
        loginTime: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Returns the current session object or null if not logged in.
 * @returns {Object|null}
 */
export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

/**
 * Clears session data from localStorage.
 */
export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    clearTimeout(inactivityTimer);
}

/**
 * Resets the inactivity timer on every user action.
 * Called from app.js on mouse/keyboard events.
 */
export function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    const session = getSession();
    if (!session) return;

    inactivityTimer = setTimeout(() => {
        clearSession();
        alert('Tu sesión se cerró por inactividad (5 minutos).');
        window.location.href = '/login';
    }, INACTIVITY_LIMIT);
}
