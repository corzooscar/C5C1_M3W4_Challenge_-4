/**
 * Login & Register View
 * Handles rendering of both login and register forms,
 * credential validation, and routing after success.
 */
import { loadHTML } from '../utils/helpers.js';
import { setSession } from '../utils/session.js';
import { login, registerClient } from '../services/jsonserver.js';
import { loadNavbar } from '../components/navbar.js';
import { navigateTo } from '../router.js';

const ROLE_ROUTES = {
    admin:   '/admin',
    tecnico: '/tecnico',
    cliente: '/cliente'
};

// ============================
// RENDER LOGIN
// ============================
export async function renderLogin() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./assets/js/views/login.html');

    // Link to register
    document.getElementById('goToRegister').addEventListener('click', e => {
        e.preventDefault();
        renderRegister();
    });

    // Submit login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const alertEl  = document.getElementById('loginAlert');
    const spinner  = document.getElementById('loginSpinner');
    const btn      = document.getElementById('loginBtn');

    if (!username || !password) {
        showAlert(alertEl, 'Por favor completa todos los campos.', 'danger');
        return;
    }

    // Loading state
    spinner.classList.remove('d-none');
    btn.disabled = true;
    alertEl.classList.add('d-none');

    try {
        const user = await login(username, password);

        if (!user) {
            showAlert(alertEl, 'Usuario o contraseña incorrectos.', 'danger');
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
            return;
        }

        // Save session and redirect
        setSession(user);
        loadNavbar();
        navigateTo(ROLE_ROUTES[user.rol] || '/login');

    } catch (error) {
        console.error('[loginView]', error);
        showAlert(alertEl, 'Error de conexión. Verifica que json-server esté corriendo en el puerto 3001.', 'danger');
    } finally {
        spinner.classList.add('d-none');
        btn.disabled = false;
    }
}

// ============================
// RENDER REGISTER
// ============================
export async function renderRegister() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('./assets/js/views/register.html');

    document.getElementById('goToLogin').addEventListener('click', e => {
        e.preventDefault();
        renderLogin();
    });

    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

async function handleRegister(event) {
    event.preventDefault();

    const name     = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const alertEl  = document.getElementById('registerAlert');
    const spinner  = document.getElementById('registerSpinner');
    const btn      = document.getElementById('registerBtn');

    if (!name || !username || !password) {
        showAlert(alertEl, 'Por favor completa todos los campos.', 'danger');
        return;
    }
    if (password.length < 4) {
        showAlert(alertEl, 'La contraseña debe tener mínimo 4 caracteres.', 'danger');
        return;
    }

    spinner.classList.remove('d-none');
    btn.disabled = true;

    try {
        await registerClient(username, password, name);
        showAlert(alertEl, '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
        setTimeout(() => renderLogin(), 2000);

    } catch (error) {
        showAlert(alertEl, error.message || 'Error al registrar. Intenta de nuevo.', 'danger');
    } finally {
        spinner.classList.add('d-none');
        btn.disabled = false;
    }
}

// ============================
// HELPERS
// ============================
function showAlert(el, message, type) {
    el.className = `alert alert-${type}`;
    el.textContent = message;
    el.classList.remove('d-none');
}
