/**
 * Ticket Card Component
 * Renders a single ticket as an HTML card matching the wireframe design.
 * Buttons shown depend on the viewer's role and business rules.
 */
import { getStatusBadge, formatDate } from '../utils/helpers.js';
import { getSession } from '../utils/session.js';

// Status label map
const STATUS_LABELS = {
    'pendiente':  'Pendiente',
    'en proceso': 'En Proceso',
    'asignado':   'Asignado',
    'solucionado':'Solucionado'
};

const TIPO_LABELS = {
    'incidente':     'Incidente',
    'requerimiento': 'Requerimiento',
    'soporte':       'Soporte'
};

const STATUS_COLORS = {
    'pendiente':  '#6c757d',
    'en proceso': '#e6a817',
    'asignado':   '#0aa8c7',
    'solucionado':'#198754'
};

/**
 * @param {Object} ticket
 * @returns {string} HTML string for one grid column
 */
export function ticketCard(ticket) {
    const session   = getSession();
    const badgeColor = STATUS_COLORS[ticket.estado] || '#6c757d';
    const statusLabel = STATUS_LABELS[ticket.estado] || ticket.estado;
    const tipoLabel   = TIPO_LABELS[ticket.tipo]    || ticket.tipo;
    const fecha       = formatDate(ticket.fechaCreacion);
    const techName    = ticket.tecnicoNombre || 'Sin asignar';
    const hasTech     = !!ticket.tecnicoId;

    const canEdit   = canEditTicket(ticket, session);
    const canDelete = session?.rol === 'admin';

    return `
        <div class="col">
            <div class="ticket-card card h-100">
                <div class="card-body d-flex flex-column gap-0">

                    <!-- Row 1: Creator tag + Type tag -->
                    <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                        <span class="tag tag-creator">
                            <i class="bi bi-person-fill me-1"></i>${ticket.clienteNombre || 'N/A'}
                        </span>
                        <span class="tag tag-tipo">${tipoLabel}</span>
                    </div>

                    <!-- Row 2: Subject + Status badge -->
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div class="ticket-asunto">
                            <span class="ticket-asunto-label">ASUNTO:</span>
                            <span class="ticket-asunto-text">${ticket.nombre}</span>
                        </div>
                        <span class="estado-badge flex-shrink-0" style="background-color:${badgeColor}">
                            ${statusLabel}
                        </span>
                    </div>

                    <!-- Row 3: Description -->
                    <p class="ticket-descripcion text-muted mb-3">${ticket.descripcion}</p>

                    <!-- Row 4: Tech + Date (pushed to bottom) -->
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top small">
                        <span class="tag ${hasTech ? 'tag-tech' : 'tag-notech'}">
                            <i class="bi bi-person-gear me-1"></i>${hasTech ? techName : 'Sin asignar'}
                        </span>
                        <span class="text-muted">
                            <i class="bi bi-calendar3 me-1"></i>${fecha}
                        </span>
                    </div>

                    <!-- Row 5: Action buttons -->
                    ${canEdit || canDelete ? `
                    <div class="d-flex gap-2 mt-2 pt-2">
                        ${canEdit ? `
                            <button class="btn btn-ticket-edit btn-sm flex-fill" data-action="edit" data-id="${ticket.id}">
                                <i class="bi bi-pencil me-1"></i>Editar
                            </button>
                        ` : ''}
                        ${canDelete ? `
                            <button class="btn btn-ticket-delete btn-sm flex-fill" data-action="delete" data-id="${ticket.id}">
                                <i class="bi bi-trash me-1"></i>Eliminar
                            </button>
                        ` : ''}
                    </div>
                    ` : ''}

                </div>
            </div>
        </div>
    `;
}

/**
 * Determines if the current user can edit a given ticket.
 */
function canEditTicket(ticket, session) {
    if (!session) return false;
    if (session.rol === 'admin') return true;
    if (session.rol === 'tecnico') return ticket.tecnicoId === session.id;
    if (session.rol === 'cliente') {
        const isOwner  = ticket.clienteId === session.id;
        const noTech   = !ticket.tecnicoId;
        const notClosed = ticket.estado !== 'solucionado';
        return isOwner && noTech && notClosed;
    }
    return false;
}
