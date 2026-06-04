/**
 * SPA Router
 * Maps URL paths to render functions with role-based access control.
 */
import { renderLogin }  from './pages/loginView.js';
import { renderAdmin }  from './pages/adminView.js';
import { renderTech }   from './pages/techView.js';
import { renderClient } from './pages/clientView.js';
import { getSession }   from './utils/session.js';

const ROLE_ROUTES = {
    admin:   '/admin',
    tecnico: '/tecnico',
    cliente: '/cliente'
};

const routes = {
    '/':        renderLogin,
    '/login':   renderLogin,
    '/admin':   renderAdmin,
    '/tecnico': renderTech,
    '/cliente': renderClient
};

/**
 * Navigates to a URL without page reload.
 * @param {string} url
 */
export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

/**
 * Main router: evaluates the current path, checks auth/role, and renders.
 */
export async function router() {
    const path    = window.location.pathname;
    const session = getSession();
    const content = document.getElementById('content');

    // Public routes (login & register)
    if (path === '/' || path === '/login') {
        if (session) {
            // Already authenticated → redirect to their dashboard
            history.replaceState(null, null, ROLE_ROUTES[session.rol] || '/login');
            await router();
        } else {
            await renderLogin();
        }
        return;
    }

    // Protected routes: must be logged in
    if (!session) {
        history.replaceState(null, null, '/login');
        await renderLogin();
        return;
    }

    // Route exists?
    const renderFn = routes[path];
    if (!renderFn) {
        content.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-question-circle fs-1 text-muted d-block mb-3"></i>
                <h3>404 – Página no encontrada</h3>
                <a href="${ROLE_ROUTES[session.rol]}" data-link class="btn btn-outline-secondary mt-3">
                    Volver al panel
                </a>
            </div>`;
        return;
    }

    // Role-based access check
    const pathRole = Object.keys(ROLE_ROUTES).find(r => ROLE_ROUTES[r] === path);
    if (pathRole && session.rol !== pathRole) {
        content.innerHTML = `
            <div class="alert alert-danger text-center py-5 mt-4">
                <i class="bi bi-shield-x fs-1 d-block mb-3"></i>
                <h4>Acceso Denegado</h4>
                <p>No tienes permisos para acceder a esta sección.</p>
                <a href="${ROLE_ROUTES[session.rol]}" data-link class="btn btn-primary mt-2">
                    Ir a mi panel
                </a>
            </div>`;
        return;
    }

    await renderFn();
}
