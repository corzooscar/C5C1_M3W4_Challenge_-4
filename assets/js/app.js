/**
 * app.js — Main SPA Entry Point
 * Initializes the app: loads styles, sets up navbar, router, and global events.
 */
import '../scss/styles.scss';
import * as bootstrap from 'bootstrap';

import { loadNavbar }         from './components/navbar.js';
import { router, navigateTo } from './router.js';
import { resetInactivityTimer } from './utils/session.js';

// Make navigateTo available globally for inline HTML links
window.navigateTo = navigateTo;

// ============================
// MAIN INITIALIZATION
// ============================
window.addEventListener('DOMContentLoaded', async () => {

    // Render navbar based on current session
    loadNavbar();

    // Render the correct page for the current URL
    await router();

    // Intercept [data-link] clicks for SPA navigation (no page reload)
    document.body.addEventListener('click', event => {
        const link = event.target.closest('[data-link]');
        if (!link) return;
        event.preventDefault();
        const href = link.getAttribute('href') || link.dataset.href;
        if (href) navigateTo(href);
    });

    // Reset inactivity timer on any user action
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    // Start the initial inactivity timer
    resetInactivityTimer();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', router);
