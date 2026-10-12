# Aurelia — Realty OS

Production-ready real estate CRM (MERN) for Pakistan brokerages and overseas desks. JWT sessions, admin/agent roles, tenant scoping, leads, listings, deals, diary, follow-ups, automatic commissions, and analytics.

## Stack

- React 18, Vite, Tailwind CSS, Framer Motion, Recharts
- Node.js, Express, MongoDB, JWT (httpOnly cookie + Bearer)

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── api/                 # HTTP client and API configuration
│   │   ├── components/          # Shared UI and authentication shell
│   │   ├── context/             # Shared React providers
│   │   ├── features/            # Route screens grouped by product domain
│   │   │   ├── agents/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── commissions/
│   │   │   ├── dashboard/
│   │   │   ├── deals/
│   │   │   ├── follow-ups/
│   │   │   ├── leads/
│   │   │   ├── marketing/
│   │   │   ├── properties/
│   │   │   ├── search/
│   │   │   └── settings/
│   │   ├── layouts/             # Authenticated application layout
│   │   ├── lib/                 # Shared formatting and utilities
│   │   ├── App.jsx              # Route configuration and guards
│   │   ├── index.css            # Global styles and design tokens
│   │   └── main.jsx             # React application entry point
│   ├── index.html
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   └── src/
│       ├── config/              # Database and application configuration
│       ├── controllers/         # HTTP request handlers
│       ├── middleware/          # Authentication, validation and errors
│       ├── models/               # MongoDB models
│       ├── routes/               # API route definitions
│       ├── utils/                # Shared server helpers
│       ├── index.js              # API entry point
│       └── seed.js               # Local demo data seeding
├── docker-compose.yml
├── package.json                 # Workspace-level commands
└── README.md
```

Client feature screens import shared modules through the `@/` alias, configured in `client/vite.config.js`. Keep new route screens with their product feature; keep reusable UI, providers, API setup, and utilities in the shared directories. The server follows a layered structure: routes delegate HTTP handling to controllers, with persistence in models and cross-cutting behavior in middleware and utilities.

## Run with Docker

```bash
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Replace JWT_SECRET in .env with a fresh random value of at least 32 characters.
docker compose up --build
```

- Web: http://localhost:8080
- Local verification inbox: http://localhost:8025
- API health: http://localhost:5001/api/health (host-local only; the browser uses the same-origin `/api` proxy)

Compose starts MongoDB, the API, the built React app, and (with the local profile) an SMTP inbox (Mailpit). MongoDB data persists in the `aurelia_mongo` volume; the web server proxies `/api` requests to Express, so browser API calls and cookie authentication remain same-origin. Create a brokerage workspace from the registration screen. Verification messages appear in the Mailpit inbox. Demo data is not seeded automatically.

Browser sessions use an httpOnly JWT cookie. Registration creates an isolated brokerage workspace and its first Admin. The Admin can add Agent accounts; public registration cannot select a role or join another workspace.
When adding an Agent, the Admin sets their initial password and shares it securely with them.

Email verification codes expire after 10 minutes, are stored as hashes, and have attempt and resend limits. To run the API outside Docker without SMTP configured, development logs codes to the API console only; production requires SMTP configuration and never returns verification codes in API responses.

Stop the services with `docker compose down`; remove the database volume as well only when you intentionally want to erase local data: `docker compose down --volumes`.

Before production deployment, set a unique, random `JWT_SECRET` of at least 32 characters, `SEED_DEMO_DATA=false`, `COOKIE_SECURE=true`, a public `CLIENT_ORIGIN`, a protected production MongoDB URI, and a trusted SMTP relay (`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, plus authentication settings if required). Disable the `local` Compose profile and use a production Compose configuration that excludes Mailpit and the local MongoDB service.

Optional development sample data can be loaded with `npm run seed`; this resets the Aurelia demo tenant and is not needed for registration.

To run the API and Vite separately for development:

```bash
npm install
npm run install:all
npm run dev
```

Vite: http://localhost:5173 · API: http://localhost:5000/api/health

The root npm workspace includes `client`, so installing from the repository root installs Vite and its build dependencies. Vercel can use the repository root as its project root and run `npm run build`.

In development, if MongoDB is not running at `mongodb://127.0.0.1:27017/aurelia`, the API starts an in-memory database. Set `SEED_DEMO_DATA=true` to load the optional sample data. Production requires a reachable `MONGO_URI`; the API exits on connection failure instead of starting with volatile storage.

## Environment

For the local non-Docker API, copy `server/.env.example` to `server/.env`; set a unique random `JWT_SECRET` of at least 32 characters. Configure SMTP to deliver real verification email, or leave it unset during development to print codes in the API console only.
