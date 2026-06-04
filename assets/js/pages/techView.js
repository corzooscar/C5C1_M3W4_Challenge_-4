/**
 * Tech View
 * Technician panel: see own tickets, create (auto-assigned), change status.
 */
import { loadHTML, today } from '../utils/helpers.js';
import { getSession } from '../utils/session.js';
import { guardRoute } from '../middleware/authMiddleware.js';
import { ticketCard } from '../components/ticketCard.js';
import { getTicketsByUser, createTicket, updateTicket } from '../services/jsonserver.js';
import * as bootstrap from 'bootstrap';

let myTickets   = [];
let techModal   = null;
let editingId   = null;

// ============================
// RENDER
// ============================
export async function renderTech() {
    const status = guardRoute('tecnico');
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
                <p>No tienes permisos para acceder al panel de técnico.</p>
            </div>`;
        return;
    }

    const session = getSession();
    content.innerHTML = await loadHTML('./assets/js/views/tech.html');

    myTickets = await getTicketsByUser(session.id, 'tecnico');

    renderTechStats();
    renderMyTickets();

    techModal = new bootstrap.Modal(document.getElementById('techTicketModal'));

    initTechEvents(session);
}

// ============================
// STATS
// ============================
function renderTechStats() {
    const counts = {
        total:       myTickets.length,
        enproceso:   myTickets.filter(t => t.estado === 'en proceso').length,
        asignado:    myTickets.filter(t => t.estado === 'asignado').length,
        solucionado: myTickets.filter(t => t.estado === 'solucionado').length
    };

    document.getElementById('techStats').innerHTML = `
        ${statCard('Mis Tickets', counts.total, 'bi-ticket-detailed', 'primary')}
        ${statCard('En Proceso',  counts.enproceso, 'bi-arrow-repeat', 'warning')}
        ${statCard('Asignados',   counts.asignado, 'bi-person-check', 'info')}
        ${statCard('Solucionados',counts.solucionado, 'bi-check-circle', 'success')}
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
    const container = document.getElementById('techTicketsList');

    if (myTickets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                <p>No tienes tickets asignados aún.</p>
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
function initTechEvents(session) {
    document.getElementById('btnNuevoTicket').addEventListener('click', () => openModal(null));

    document.getElementById('btnGuardarTechTicket').addEventListener('click', () => saveTicket(session));

    document.getElementById('techTicketsList').addEventListener('click', event => {
        const btn = event.target.closest('[data-action]');
        if (!btn) return;

        const id     = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        const ticket = myTickets.find(t => t.id === id);

        if (action === 'edit' && ticket) {
            openModal(ticket);
        }
    });
}

// ============================
// MODAL
// ============================
function openModal(ticket) {
    editingId = ticket ? ticket.id : null;

    document.getElementById('techModalTitle').innerHTML =
        `<i class="bi bi-ticket me-2"></i>${ticket ? 'Editar Ticket' : 'Nuevo Ticket'}`;
    document.getElementById('techTicketId').value          = ticket?.id || '';
    document.getElementById('techTicketNombre').value      = ticket?.nombre || '';
    document.getElementById('techTicketTipo').value        = ticket?.tipo || '';
    document.getElementById('techTicketDescripcion').value = ticket?.descripcion || '';
    document.getElementById('techTicketEstado').value      = ticket?.estado || 'en proceso';
    document.getElementById('techModalAlert').classList.add('d-none');

    techModal.show();
}

// ============================
// SAVE
// ============================
async function saveTicket(session) {
    const nombre      = document.getElementById('techTicketNombre').value.trim();
    const tipo        = document.getElementById('techTicketTipo').value;
    const descripcion = document.getElementById('techTicketDescripcion').value.trim();
    const estado      = document.getElementById('techTicketEstado').value;
    const alertEl     = document.getElementById('techModalAlert');

    if (!nombre || !tipo || !descripcion) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Todos los campos son obligatorios.';
        alertEl.classList.remove('d-none');
        return;
    }

    const ticketData = {
        nombre, tipo, descripcion, estado,
        // Technician auto-assigned to themselves
        tecnicoId:     session.id,
        tecnicoNombre: session.name,
        clienteId:     session.id,
        clienteNombre: session.name
    };

    try {
        if (editingId) {
            const updated = await updateTicket(editingId, { nombre, tipo, descripcion, estado });
            myTickets = myTickets.map(t => t.id === editingId ? { ...t, ...updated } : t);
        } else {
            ticketData.fechaCreacion = today();
            const created = await createTicket(ticketData);
            myTickets.push(created);
        }

        techModal.hide();
        renderTechStats();
        renderMyTickets();

    } catch (error) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Error al guardar el ticket.';
        alertEl.classList.remove('d-none');
        console.error('[techView:saveTicket]', error);
    }
}
