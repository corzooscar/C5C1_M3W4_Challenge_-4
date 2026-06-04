/**
 * API Service Layer
 * All calls to both json-server instances go through here.
 */
import { authClient, dataClient } from './httpClient.js';

// =============================================
// AUTH SERVICE (port 3001)
// =============================================

/**
 * Validates credentials and returns the user object, or null.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object|null>}
 */
export async function login(username, password) {
    const res = await authClient.get('/users', {
        params: { username, password }
    });
    return res.data[0] || null;
}

/**
 * Registers a new client user (roleId: 3, rol: 'cliente').
 * @param {string} username
 * @param {string} password
 * @param {string} name
 * @returns {Promise<Object>}
 */
export async function registerClient(username, password, name) {
    // Check username is not taken
    const existing = await authClient.get('/users', { params: { username } });
    if (existing.data.length > 0) {
        throw new Error('El nombre de usuario ya está en uso.');
    }
    const res = await authClient.post('/users', {
        username,
        password,
        name,
        roleId: 3,
        rol: 'cliente'
    });
    return res.data;
}

/**
 * Returns all users with rol=tecnico.
 * @returns {Promise<Array>}
 */
export async function getTechnicians() {
    const res = await authClient.get('/users', { params: { rol: 'tecnico' } });
    return res.data;
}

/**
 * Returns all users.
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
    const res = await authClient.get('/users');
    return res.data;
}

// =============================================
// TICKETS SERVICE (port 3002)
// =============================================

/**
 * Returns all tickets.
 * @returns {Promise<Array>}
 */
export async function getTickets() {
    const res = await dataClient.get('/tickets');
    return res.data;
}

/**
 * Returns tickets belonging to a specific user (by clienteId or tecnicoId).
 * @param {number} userId
 * @param {string} rol - 'tecnico' | 'cliente'
 * @returns {Promise<Array>}
 */
export async function getTicketsByUser(userId, rol) {
    const field = rol === 'tecnico' ? 'tecnicoId' : 'clienteId';
    const res = await dataClient.get('/tickets', { params: { [field]: userId } });
    return res.data;
}

/**
 * Creates a new ticket.
 * @param {Object} ticketData
 * @returns {Promise<Object>}
 */
export async function createTicket(ticketData) {
    const res = await dataClient.post('/tickets', ticketData);
    return res.data;
}

/**
 * Partially updates a ticket (PATCH).
 * @param {number} id
 * @param {Object} changes
 * @returns {Promise<Object>}
 */
export async function updateTicket(id, changes) {
    const res = await dataClient.patch(`/tickets/${id}`, changes);
    return res.data;
}

/**
 * Deletes a ticket (admin only).
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTicket(id) {
    await dataClient.delete(`/tickets/${id}`);
}
