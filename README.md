<div align="center">

<img src="https://img.shields.io/badge/TMS-Ticket%20Management%20System-DC2626?style=for-the-badge&logo=ticket&logoColor=white" alt="TMS Banner"/>

# 🎫 Ticket Management System

**A role-based technical support ticket manager built as a Single Page Application.**  
No page reloads. No frameworks. Just clean, modular Vanilla JavaScript.

<br/>

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white)](https://axios-http.com/)
[![JSON Server](https://img.shields.io/badge/JSON%20Server-0.17-2ECC71?style=flat-square&logo=json&logoColor=white)](https://github.com/typicode/json-server)
[![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?style=flat-square&logo=sass&logoColor=white)](https://sass-lang.com/)

<br/>

[Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Roles](#-roles--permissions) · [Architecture](#-architecture) · [API Reference](#-api-reference)

</div>

---

## 📋 Overview

TMS is an internal web application for a technical support company. It allows teams to manage incidents, requests, and support cases through a structured ticketing workflow — with strict role-based access control enforced on both the UI and the routing layer.

| Role | Can do |
|------|--------|
| 🔴 **Admin** | Full CRUD on all tickets, assign technicians, manage statuses |
| 🔵 **Technician** | Create & manage their own assigned tickets |
| 🟢 **Client** | Submit requests, track their own tickets |

---

## ✨ Features

- **SPA Navigation** — zero page reloads using the History API
- **Role-based dashboards** — each role sees a completely different interface
- **Simulated middleware** — route guards that protect pages before rendering
- **Session persistence** — survives browser refresh via `localStorage`
- **Auto-logout** — session expires after **5 minutes of inactivity**
- **Parallel data fetching** — `Promise.all()` to load resources simultaneously
- **Delegated events** — single listener per list, no re-binding on re-render
- **Two independent APIs** — auth server and data server on separate ports

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone or unzip the project
cd C5C1_M3_W4_lastChallenge

# Install dependencies
npm install
```

### Running the Application

You need **3 terminal windows** running simultaneously:

```bash
# Terminal 1 — Authentication API (port 3001)
npm run auth-server
```

```bash
# Terminal 2 — Tickets & Data API (port 3002)
npm run data-server
```

```bash
# Terminal 3 — Frontend Dev Server (port 8080)
npm start
```

Then open your browser at → **[http://localhost:8080](http://localhost:8080)**

> ⚠️ **Both JSON Server instances must be running before you open the app**, otherwise login and data fetching will fail.

---

## 🔑 Default Credentials

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin1` | `admin123` | Administrator | Full system access |
| `tec1` | `tec123` | Technician | Own tickets only |
| `tec2` | `tec456` | Technician | Own tickets only |

> 🆕 New **client** accounts can be created through the **Register** link on the login screen.

---

## 📁 Project Structure

```
C5C1_M3_W4_lastChallenge/
│
├── 📄 index.html               → Single HTML shell of the entire SPA
├── 📄 package.json             → Scripts and dependencies
├── 📄 vite.config.js           → Dev server config (port 8080)
├── 🗄️  auth-db.json             → JSON Server: users & roles  (port 3001)
├── 🗄️  data-db.json             → JSON Server: tickets        (port 3002)
│
└── 📂 assets/
    ├── 📂 scss/
    │   └── styles.scss         → Bootstrap + custom component styles
    │
    └── 📂 js/
        ├── app.js              → Entry point: init, global events, SPA nav
        ├── router.js           → Route table, auth guards, navigateTo()
        │
        ├── 📂 components/      → Reusable UI building blocks
        │   ├── navbar.js       → Session-aware top navigation bar
        │   └── ticketCard.js   → Ticket card with role-conditional buttons
        │
        ├── 📂 middleware/      → Simulated route protection layer
        │   └── authMiddleware.js → guardRoute(), isAuthenticated(), hasRole()
        │
        ├── 📂 services/        → All HTTP communication lives here
        │   ├── httpClient.js   → Two configured Axios instances
        │   └── jsonserver.js   → All API call functions (auth + tickets)
        │
        ├── 📂 utils/           → Pure helper functions
        │   ├── session.js      → localStorage session + inactivity timer
        │   └── helpers.js      → loadHTML(), formatDate(), today(), badges
        │
        ├── 📂 pages/           → View controllers (one per role)
        │   ├── loginView.js    → Login + self-registration flow
        │   ├── adminView.js    → Admin: CRUD, tech cards, stats, filters
        │   ├── techView.js     → Technician: own tickets + status control
        │   └── clientView.js   → Client: submit & track own requests
        │
        └── 📂 views/           → HTML partials loaded dynamically
            ├── login.html
            ├── register.html
            ├── admin.html      → Includes Bootstrap modal
            ├── tech.html       → Includes Bootstrap modal
            └── client.html     → Includes Bootstrap modal
```

---

## 👥 Roles & Permissions

### 🔴 Administrator
- View, create, edit and **delete** any ticket in the system
- Assign any registered technician to a ticket
- Change ticket status freely (`pendiente` → `en proceso` → `asignado` → `solucionado`)
- The `asignado` status is only selectable when a technician has been assigned
- See the **Available Technicians** panel with live ticket count per technician

### 🔵 Technician
- Create tickets — **automatically assigned to themselves**
- View and edit only their own assigned tickets
- Change the status of their own tickets
- Cannot assign other technicians or view tickets they don't own

### 🟢 Client
- Submit new support requests (no technician selection — admin handles that)
- Track status of their own tickets
- Edit a ticket **only if no technician has been assigned yet**, or if status is `solucionado`
- Cannot change ticket status or assign technicians

---

## 🏗️ Architecture

```
Browser
  └── index.html (shell)
        └── app.js (entry point)
              ├── router.js          ← decides what to render based on URL + session
              │     └── pages/*      ← controllers that load HTML and fetch data
              │           ├── middleware/authMiddleware.js  ← guards every page
              │           ├── services/jsonserver.js        ← all API calls
              │           │     └── services/httpClient.js  ← axios instances
              │           ├── components/ticketCard.js      ← reusable UI
              │           └── utils/helpers.js + session.js ← shared utilities
              └── components/navbar.js  ← always in sync with session state
```

### Key Design Decisions

**Two separate JSON Server instances**  
Auth logic (port 3001) and business data (port 3002) are intentionally separated — mirroring a real microservice architecture where authentication and domain data are decoupled.

**ES Modules throughout**  
Every file uses `import`/`export`. Dependencies are explicit and traceable, avoiding global scope pollution.

**Simulated backend middleware**  
`authMiddleware.js` exports `guardRoute(role)` which every page calls *before* rendering anything. This mirrors how Express.js or similar backends protect routes, making the pattern transferable.

**Inactivity auto-logout**  
Implemented with a `setTimeout` that resets on `click`, `keydown`, `mousemove`, `scroll`, and `touchstart` events. After 5 minutes of no activity, the session is cleared and the user is redirected to login.

**Delegated event listeners**  
The ticket list containers use a *single* `addEventListener('click')` with `event.target.closest('[data-action]')` — instead of attaching a listener to every button. This avoids memory leaks and stale handlers when the list re-renders.

**`Promise.all()` for parallel fetching**  
The admin dashboard loads tickets and technicians simultaneously:
```javascript
[allTickets, technicians] = await Promise.all([getTickets(), getTechnicians()]);
```
This halves the wait time compared to sequential `await` calls.

---

## 🌐 API Reference

### Auth Server — `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users?username=x&password=y` | Validate login credentials |
| `GET` | `/users?rol=tecnico` | Get all technicians |
| `GET` | `/users` | Get all users |
| `POST` | `/users` | Register new client |
| `GET` | `/roles` | Get all roles |

### Data Server — `http://localhost:3002`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tickets` | Get all tickets (admin) |
| `GET` | `/tickets?clienteId=x` | Get tickets by client |
| `GET` | `/tickets?tecnicoId=x` | Get tickets by technician |
| `POST` | `/tickets` | Create a new ticket |
| `PATCH` | `/tickets/:id` | Partially update a ticket |
| `DELETE` | `/tickets/:id` | Delete a ticket (admin only) |

### Ticket Object Schema

```json
{
  "id": 1,
  "nombre": "Server down on main cluster",
  "tipo": "incidente",
  "descripcion": "The main production server is unreachable since 09:00.",
  "estado": "asignado",
  "tecnicoId": 2,
  "tecnicoNombre": "Juan Técnico",
  "clienteId": 1,
  "clienteNombre": "Administrador Principal",
  "fechaCreacion": "2025-06-03"
}
```
---
## 🦎 Flowchart

<img width="8192" height="8055" alt="User_Role-Based_Session_Flow-2026-06-04-010105" src="https://github.com/user-attachments/assets/03f6ad9d-9a56-4430-bf92-facabbc4cbac" />

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| *Habith* | Developer |
| *Oczo* | Developer |
| *Ronny* | Developer |
| *Silvio* | Developer |

---

<div align="center">

Built for **RIWI** · Module 3 · Week 4 Final Challenge

</div>
