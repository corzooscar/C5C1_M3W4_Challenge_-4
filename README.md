# Ticket Management System (TMS)

A Single Page Application (SPA) built with Vanilla JavaScript for managing technical support tickets.

## Description

TMS is an internal tool for a tech support company that allows technicians to log incidents and requests, administrators to manage and assign tickets, and clients to track their support requests — all without page reloads.

## Technologies Used

- **JavaScript (ES Modules)** — SPA logic, routing, and DOM manipulation
- **Vite** — Dev server and build tool
- **Bootstrap 5** — UI components and responsive layout
- **Bootstrap Icons** — Icon library
- **Axios** — HTTP client for API calls
- **JSON Server** — Simulated REST API (two instances)
- **Sass (SCSS)** — Custom styles on top of Bootstrap

## Team Members

- (Add your names here)

## Installation

```bash
npm install
```

## How to Run

You need **three terminal windows**:

### 1. Authentication Server (port 3001)
```bash
npx json-server --watch auth-db.json --port 3001
```

### 2. Data Server (port 3002)
```bash
npx json-server --watch data-db.json --port 3002
```

### 3. Vite Dev Server (port 8080)
```bash
npm start
```

Then open: **http://localhost:8080**

### Default Credentials

| Username | Password | Role          |
|----------|----------|---------------|
| admin1   | admin123 | Administrator |
| tec1     | tec123   | Technician    |
| tec2     | tec456   | Technician    |

New clients can self-register via the "Register" link on the login page.

## Project Structure

```
├── index.html               # SPA entry point
├── auth-db.json             # Auth JSON Server (users, roles)
├── data-db.json             # Data JSON Server (tickets)
├── package.json
├── vite.config.js
└── assets/
    ├── scss/
    │   └── styles.scss      # Bootstrap + custom styles
    └── js/
        ├── app.js           # Main entry: init, events, SPA navigation
        ├── router.js        # Route table + auth/role guards + navigateTo
        ├── components/
        │   ├── navbar.js    # Session-aware navbar component
        │   └── ticketCard.js# Reusable ticket card with role-based buttons
        ├── middleware/
        │   └── authMiddleware.js  # guardRoute, isAuthenticated, hasRole
        ├── pages/
        │   ├── loginView.js     # Login + Register forms and logic
        │   ├── adminView.js     # Admin: full ticket CRUD, stats, filters
        │   ├── techView.js      # Tech: own tickets, create, status change
        │   └── clientView.js    # Client: own tickets, create, limited edit
        ├── services/
        │   ├── httpClient.js    # Two Axios instances (authClient, dataClient)
        │   └── jsonserver.js    # All API calls (auth + tickets)
        ├── utils/
        │   ├── session.js       # localStorage session + inactivity timeout
        │   └── helpers.js       # loadHTML, formatDate, badges, etc.
        └── views/
            ├── login.html       # Login form HTML partial
            ├── register.html    # Register form HTML partial
            ├── admin.html       # Admin dashboard HTML + modal
            ├── tech.html        # Tech dashboard HTML + modal
            └── client.html      # Client dashboard HTML + modal
```

## Role Behavior

### Administrator (`admin`)
- Views **all** tickets in the system
- Can **create, edit, and delete** any ticket
- Can **assign any technician** to a ticket
- Can set any status (`pendiente`, `en proceso`, `asignado`, `solucionado`)
- "Asignado" status only available when a technician is selected

### Technician (`tecnico`)
- Sees only **their own tickets** (where they are the assigned technician)
- Can **create tickets** (automatically assigned to themselves)
- Can **edit** their own tickets and change the status
- Cannot assign other technicians

### Client (`cliente`)
- Sees only **their own tickets**
- Can **create tickets** (no technician selection — admin assigns one later)
- Can **edit** tickets only while **no technician is assigned** (or if status is `solucionado`)
- Cannot assign technicians or change status

## Technical Decisions

- **Two JSON Server instances**: auth logic (port 3001) and business data (port 3002) are separated to mirror a real microservice architecture.
- **ES Modules**: all files use `import/export` for clear dependency management and modularity.
- **Simulated middleware**: `authMiddleware.js` provides `guardRoute()` which every page calls at render time — mimicking backend route protection.
- **Inactivity timeout**: implemented in `session.js` using `setTimeout`; resets on mouse, keyboard, scroll and touch events. After 5 minutes of inactivity the session is cleared automatically.
- **Delegated event listeners**: ticket list containers use a single `addEventListener('click')` with `closest('[data-action]')` to avoid re-binding on every re-render.
- **`loadHTML()`**: fetches HTML partials from the server at runtime, keeping markup separate from JavaScript logic (following the idealChallenge pattern).
