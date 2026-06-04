/**
 * Navbar Component
 * Renders a role-aware navbar. Shows nothing when not logged in.
 */
import { getSession, clearSession } from '../utils/session.js';

const ROLE_LABELS = {
    admin:    'Administrador',
    tecnico:  'Técnico',
    cliente:  'Cliente'
};

const ROLE_COLORS = {
    admin:    'danger',
    tecnico:  'primary',
    cliente:  'success'
};

/**
 * Renders or clears the navbar based on session state.
 */
export function loadNavbar() {
    const navbar = document.getElementById('navbar');
    const session = getSession();

    if (!session) {
        navbar.innerHTML = '';
        return;
    }

    const label = ROLE_LABELS[session.rol] || session.rol;
    const color = ROLE_COLORS[session.rol] || 'secondary';

    navbar.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
            <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="/${session.rol}" data-link>
                <i class="bi bi-ticket-detailed-fill text-danger"></i>
                <span>TMS</span>
            </a>
            <div class="ms-auto d-flex align-items-center gap-3">
                <div class="d-flex align-items-center gap-2 text-light">
                    <i class="bi bi-person-circle fs-5"></i>
                    <span class="d-none d-sm-inline">${session.name}</span>
                    <span class="badge bg-${color}">${label}</span>
                </div>
                <button id="logoutBtn" class="btn btn-outline-light btn-sm">
                    <i class="bi bi-box-arrow-right"></i>
                    <span class="d-none d-md-inline ms-1">Cerrar Sesión</span>
                </button>
            </div>
        </nav>
    `;

    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function handleLogout() {
    if (!confirm('¿Deseas cerrar sesión?')) return;
    clearSession();
    loadNavbar(); // clear navbar
    // Navigate to login
    history.pushState(null, null, '/login');
    import('../pages/loginView.js').then(m => m.renderLogin());
}
