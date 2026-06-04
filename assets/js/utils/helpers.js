/**
 * General-purpose helper functions.
 */

/**
 * Fetches and returns the HTML content of a partial file.
 * @param {string} path - Path relative to the server root.
 * @returns {Promise<string>}
 */
export async function loadHTML(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Error loading HTML: ${path}`);
        return await response.text();
    } catch (error) {
        console.error('[loadHTML]', error);
        return '<div class="alert alert-danger">Error al cargar el contenido.</div>';
    }
}

/**
 * Returns a Bootstrap badge color class based on ticket status.
 * @param {string} status
 * @returns {string}
 */
export function getStatusBadge(status) {
    const map = {
        'pendiente':   'secondary',
        'en proceso':  'warning',
        'asignado':    'info',
        'solucionado': 'success'
    };
    return map[status] || 'secondary';
}

/**
 * Returns a human-readable label for the ticket type.
 * @param {string} tipo
 * @returns {string}
 */
export function getTipoLabel(tipo) {
    const map = {
        'incidente':      'Incidente',
        'requerimiento':  'Requerimiento',
        'soporte':        'Soporte'
    };
    return map[tipo] || tipo;
}

/**
 * Formats a date string to Spanish locale.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

/**
 * Returns today's date as YYYY-MM-DD.
 * @returns {string}
 */
export function today() {
    return new Date().toISOString().split('T')[0];
}
