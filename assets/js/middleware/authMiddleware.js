/**
 * Auth Middleware
 * Simulates route guards: checks session and role before rendering a page.
 */
import { getSession } from '../utils/session.js';

/**
 * Full route guard: verifies auth + role.
 * Returns 'ok', 'unauthenticated', or 'unauthorized'.
 * @param {string} requiredRole
 * @returns {'ok'|'unauthenticated'|'unauthorized'}
 */
export function guardRoute(requiredRole) {
    const session = getSession();
    if (!session) return 'unauthenticated';
    if (requiredRole && session.rol !== requiredRole) return 'unauthorized';
    return 'ok';
}
