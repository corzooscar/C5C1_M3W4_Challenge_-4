/**
 * Client View
 * Client panel: see own tickets, create new, edit if no tech assigned.
 */
import { loadHTML, today } from '../utils/helpers.js';
import { getSession } from '../utils/session.js';
import { guardRoute } from '../middleware/authMiddleware.js';
import { ticketCard } from '../components/ticketCard.js';
import { getTicketsByUser, createTicket, updateTicket } from '../services/jsonserver.js';
import * as bootstrap from 'bootstrap';

let myTickets     = [];
let clientModal   = null;
let editingId     = null;

// ============================
// RENDER
// ============================
export async function renderClient() {
    const status = guardRoute('cliente');
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
                <p>No tienes permisos para acceder al panel de cliente.</p>
            </div>`;
        return;
    }

    const session = getSession();
    content.innerHTML = await loadHTML('./assets/js/views/client.html');

    myTickets = await getTicketsByUser(session.id, 'cliente');

    renderClientStats();
    renderMyTickets();

    clientModal = new bootstrap.Modal(document.getElementById('clientTicketModal'));

    initClientEvents(session);
}

// ============================
// STATS
// ============================
function renderClientStats() {
    const counts = {
        total:       myTickets.length,
        pendiente:   myTickets.filter(t => t.estado === 'pendiente').length,
        enproceso:    myTickets.filter(t => t.estado === 'en proceso').length,
        solucionado: myTickets.filter(t => t.estado === 'solucionado').length
    };

    document.getElementById('clientStats').innerHTML = `
        ${statCard('Mis Tickets',  counts.total,       'bi-ticket-detailed', 'success')}
        ${statCard('Pendientes',   counts.pendiente,   'bi-hourglass-split', 'secondary')}
        ${statCard('En Proceso',    counts.enproceso,    'bi-arrow-repeat',    'warning')}
        ${statCard('Solucionados', counts.solucionado, 'bi-check-circle',    'success')}
    `;
}

function statCard(label, value, icon, color) {
    return `
        <div class="col-6 col-md-3">
            <div class="card stat-card text-center p-3">
                <i class="bi ${icon} fs-2 text-${color}"></i>
                <div class="fw-bold fs-4 mt-1">${value}</div>
                <div class="text-muted small">${label}</div>
            </div>
        </div>`;
}

// ============================
// RENDER TICKET LIST
// ============================
function renderMyTickets() {
    const container = document.getElementById('clientTicketsList');

    if (myTickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                <p>Aún no has creado ningún ticket.</p>
                <p class="small">Haz clic en "Nueva Solicitud" para empezar.</p>
            </div>`;
        return;
    }

    container.innerHTML = `<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
    ${myTickets.map(t => ticketCard(t)).join('')}
    </div>`
}

// ============================
// EVENTS
// ============================
function initClientEvents(session) {
    document.getElementById('btnNuevoTicket').addEventListener('click', () => openModal(null));

    document.getElementById('btnGuardarClientTicket').addEventListener('click', () => saveTicket(session));

    document.getElementById('clientTicketsList').addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;

        const id     = parseInt(btn.dataset.id);
        const ticket = myTickets.find(t => t.id === id);

        if (btn.dataset.action === 'edit' && ticket) {
            openModal(ticket);
        }
    });
}

// ============================
// MODAL
// ============================
function openModal(ticket) {
    editingId = ticket ? ticket.id : null;

    document.getElementById('clientModalTitle').innerHTML =
        `<i class="bi bi-ticket me-2"></i>${ticket ? 'Editar Ticket' : 'Nueva Solicitud'}`;
    document.getElementById('clientTicketId').value          = ticket?.id || '';
    document.getElementById('clientTicketNombre').value      = ticket?.nombre || '';
    document.getElementById('clientTicketTipo').value        = ticket?.tipo || '';
    document.getElementById('clientTicketDescripcion').value = ticket?.descripcion || '';
    document.getElementById('clientModalAlert').classList.add('d-none');

    clientModal.show();
}

// ============================
// SAVE
// ============================
async function saveTicket(session) {
    const nombre      = document.getElementById('clientTicketNombre').value.trim();
    const tipo        = document.getElementById('clientTicketTipo').value;
    const descripcion = document.getElementById('clientTicketDescripcion').value.trim();
    const alertEl     = document.getElementById('clientModalAlert');

    if (!nombre || !tipo || !descripcion) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Todos los campos son obligatorios.';
        alertEl.classList.remove('d-none');
        return;
    }

    try {
        if (editingId) {
            // Client can only edit name, type, description — not tech or status
            const updated = await updateTicket(editingId, { nombre, tipo, descripcion });
            myTickets = myTickets.map(t => t.id === editingId ? { ...t, ...updated } : t);

        } else {
            const ticketData = {
                nombre, tipo, descripcion,
                tecnicoId:     null,
                tecnicoNombre: null,
                clienteId:     session.id,
                clienteNombre: session.name,
                estado:        'pendiente',
                fechaCreacion: today()
            };
            const created = await createTicket(ticketData);
            myTickets.push(created);
        }

        clientModal.hide();
        renderClientStats();
        renderMyTickets();

    } catch (error) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Error al guardar el ticket.';
        alertEl.classList.remove('d-none');
        console.error('[clientView:saveTicket]', error);
    }
}
