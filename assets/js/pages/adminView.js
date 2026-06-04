/**
 * Admin View
 * Full CRUD for tickets, technician cards panel, stats, and filters.
 */
import { loadHTML, today } from '../utils/helpers.js';
import { getSession } from '../utils/session.js';
import { guardRoute } from '../middleware/authMiddleware.js';
import { ticketCard } from '../components/ticketCard.js';
import { getTickets, createTicket, updateTicket, deleteTicket, getTechnicians } from '../services/jsonserver.js';
import * as bootstrap from 'bootstrap';

let allTickets  = [];
let technicians = [];
let ticketModal = null;
let editingId   = null;

// ============================
// RENDER
// ============================
export async function renderAdmin() {
    const status  = guardRoute('admin');
    const content = document.getElementById('content');

    if (status === 'unauthenticated') {
        content.innerHTML = '<div class="alert alert-warning">Sesión expirada. Por favor inicia sesión.</div>';
        return;
    }
    if (status === 'unauthorized') {
        content.innerHTML = `
            <div class="alert alert-danger text-center py-5">
                <i class="bi bi-shield-x fs-1 d-block mb-3"></i>
                <h4>Acceso Denegado</h4>
                <p>No tienes permisos para acceder al panel de administrador.</p>
            </div>`;
        return;
    }

    content.innerHTML = await loadHTML('./assets/js/views/admin.html');

    [allTickets, technicians] = await Promise.all([getTickets(), getTechnicians()]);

    renderStats();
    renderTechCards();
    renderTickets(allTickets);
    populateTechSelect();

    ticketModal = new bootstrap.Modal(document.getElementById('ticketModal'));

    initAdminEvents();
}

// ============================
// STATS
// ============================
function renderStats() {
    const c = {
        total:       allTickets.length,
        pendiente:   allTickets.filter(t => t.estado === 'pendiente').length,
        enproceso:   allTickets.filter(t => t.estado === 'en proceso').length,
        asignado:    allTickets.filter(t => t.estado === 'asignado').length,
        solucionado: allTickets.filter(t => t.estado === 'solucionado').length
    };

    document.getElementById('adminStats').innerHTML = `
        ${stat('Tickets',     c.total,       '#343a40')}
        ${stat('Asignados',   c.asignado,    '#0aa8c7')}
        ${stat('Pendientes',  c.pendiente,   '#6c757d')}
        ${stat('En Proceso',  c.enproceso,   '#e6a817')}
        ${stat('Solucionados',c.solucionado, '#198754')}
    `;
}

function stat(label, value, color) {
    return `
        <div class="col-6 col-sm-4">
            <div class="stat-pill" style="border-left-color:${color}">
                <span class="stat-pill-value" style="color:${color}">${value}</span>
                <span class="stat-pill-label">${label}</span>
            </div>
        </div>`;
}

// ============================
// TECH CARDS (new section)
// ============================
function renderTechCards() {
    const grid = document.getElementById('techCardsGrid');
    if (!grid) return;

    if (technicians.length === 0) {
        grid.innerHTML = '<p class="text-muted small text-center py-2">No hay técnicos registrados.</p>';
        return;
    }

    grid.innerHTML = technicians.map(tech => {
        const assigned = allTickets.filter(t => t.tecnicoId === tech.id).length;
        const initials = tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return `
            <div class="tech-card">
                <div class="tech-avatar">${initials}</div>
                <div class="tech-name">${tech.name}</div>
                <div class="tech-meta">${assigned} ticket${assigned !== 1 ? 's' : ''}</div>
            </div>`;
    }).join('');
}

// ============================
// RENDER TICKETS GRID
// ============================
function renderTickets(tickets) {
    const container = document.getElementById('adminTicketsList');
    const countEl   = document.getElementById('ticketsCount');
    if (countEl) countEl.textContent = `(${tickets.length})`;

    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                <p>No hay tickets para mostrar.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            ${tickets.map(t => ticketCard(t)).join('')}
        </div>`;
}

// ============================
// POPULATE TECH SELECT IN MODAL
// ============================
function populateTechSelect() {
    const select = document.getElementById('ticketTecnico');
    if (!select) return;
    select.innerHTML = '<option value="">Sin asignar</option>' +
        technicians.map(t =>
            `<option value="${t.id}" data-name="${t.name}">${t.name}</option>`
        ).join('');
}

// ============================
// EVENTS
// ============================
function initAdminEvents() {
    const session = getSession();

    document.getElementById('btnNuevoTicket').addEventListener('click', () => openModal(null, session));
    document.getElementById('btnGuardarTicket').addEventListener('click', () => saveTicket(session));

    document.getElementById('ticketTecnico').addEventListener('change', syncEstadoOptions);
    document.getElementById('ticketEstado').addEventListener('change', syncEstadoOptions);

    // Delegated click: edit / delete
    document.getElementById('adminTicketsList').addEventListener('click', async event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;

        const id     = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        const ticket = allTickets.find(t => t.id === id);

        if (action === 'edit') {
            openModal(ticket, session);
        }
        if (action === 'delete') {
            if (!confirm(`¿Eliminar el ticket "${ticket?.nombre}"?`)) return;
            try {
                await deleteTicket(id);
                allTickets = allTickets.filter(t => t.id !== id);
                renderStats();
                renderTechCards(); // update ticket counts on tech cards
                renderTickets(applyFilters());
            } catch {
                alert('Error al eliminar el ticket.');
            }
        }
    });

    // Filters
    document.getElementById('searchInput').addEventListener('input',  () => renderTickets(applyFilters()));
    document.getElementById('filterEstado').addEventListener('change', () => renderTickets(applyFilters()));
    document.getElementById('filterTipo').addEventListener('change',   () => renderTickets(applyFilters()));
    document.getElementById('btnLimpiarFiltros').addEventListener('click', () => {
        document.getElementById('searchInput').value  = '';
        document.getElementById('filterEstado').value = '';
        document.getElementById('filterTipo').value   = '';
        renderTickets(allTickets);
    });
}

// ============================
// FILTERS
// ============================
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    const tipo   = document.getElementById('filterTipo').value;

    return allTickets.filter(t => {
        const matchSearch = !search ||
            t.nombre?.toLowerCase().includes(search) ||
            t.descripcion?.toLowerCase().includes(search);
        const matchEstado = !estado || t.estado === estado;
        const matchTipo   = !tipo   || t.tipo   === tipo;
        return matchSearch && matchEstado && matchTipo;
    });
}

// ============================
// MODAL OPEN
// ============================
function openModal(ticket, session) {
    editingId = ticket ? ticket.id : null;

    document.getElementById('modalTitle').innerHTML =
        `<i class="bi bi-ticket me-2"></i>${ticket ? 'Editar Ticket' : 'Nuevo Ticket'}`;
    document.getElementById('ticketId').value          = ticket?.id           || '';
    document.getElementById('ticketNombre').value      = ticket?.nombre       || '';
    document.getElementById('ticketTipo').value        = ticket?.tipo         || '';
    document.getElementById('ticketDescripcion').value = ticket?.descripcion  || '';
    document.getElementById('ticketTecnico').value     = ticket?.tecnicoId    || '';
    document.getElementById('ticketEstado').value      = ticket?.estado       || 'pendiente';
    document.getElementById('modalAlert').classList.add('d-none');

    syncEstadoOptions();
    ticketModal.show();
}

// ============================
// SYNC ESTADO ↔ TÉCNICO
// ============================
function syncEstadoOptions() {
    const tecnicoEl = document.getElementById('ticketTecnico');
    const estadoEl  = document.getElementById('ticketEstado');
    const warning   = document.getElementById('estadoWarning');
    const hasTech   = !!tecnicoEl.value;

    Array.from(estadoEl.options).forEach(opt => {
        if (opt.value === 'asignado') opt.disabled = !hasTech;
    });
    if (!hasTech && estadoEl.value === 'asignado') estadoEl.value = 'pendiente';
    warning.style.display = hasTech ? 'none' : 'block';
}

// ============================
// SAVE TICKET
// ============================
async function saveTicket(session) {
    const nombre      = document.getElementById('ticketNombre').value.trim();
    const tipo        = document.getElementById('ticketTipo').value;
    const descripcion = document.getElementById('ticketDescripcion').value.trim();
    const tecnicoEl   = document.getElementById('ticketTecnico');
    const tecnicoId   = tecnicoEl.value ? parseInt(tecnicoEl.value) : null;
    const tecnicoNombre = tecnicoId ? tecnicoEl.options[tecnicoEl.selectedIndex].dataset.name : null;
    const estado      = document.getElementById('ticketEstado').value;
    const alertEl     = document.getElementById('modalAlert');

    if (!nombre || !tipo || !descripcion) {
        showModalAlert(alertEl, 'Nombre, tipo y descripción son obligatorios.', 'danger');
        return;
    }
    if (estado === 'asignado' && !tecnicoId) {
        showModalAlert(alertEl, 'Selecciona un técnico para el estado "Asignado".', 'warning');
        return;
    }

    try {
        if (editingId) {
            // BUG FIX: never overwrite clienteId/clienteNombre on edit
            const changes = { nombre, tipo, descripcion, tecnicoId, tecnicoNombre, estado };
            const updated = await updateTicket(editingId, changes);
            allTickets = allTickets.map(t => t.id === editingId ? { ...t, ...updated } : t);
        } else {
            const newTicket = {
                nombre, tipo, descripcion,
                tecnicoId, tecnicoNombre, estado,
                clienteId:     session.id,
                clienteNombre: session.name,
                fechaCreacion: today()
            };
            const created = await createTicket(newTicket);
            allTickets.push(created);
        }

        ticketModal.hide();
        renderStats();
        renderTechCards();
        renderTickets(applyFilters());

    } catch (error) {
        showModalAlert(alertEl, 'Error al guardar. Intenta de nuevo.', 'danger');
        console.error('[adminView:saveTicket]', error);
    }
}

function showModalAlert(el, msg, type) {
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.classList.remove('d-none');
}
