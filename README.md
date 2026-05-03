# 🚀 Collaborative Team Hub

A full-stack real-time collaborative workspace application built with a Turborepo monorepo. Teams can manage shared goals, post announcements, track action items on a Kanban board, and collaborate in real time.

---

## 🏗️ Advanced Features Implemented

| #     | Feature           | Description                                                                                                                                                                                                                                                                                                             |
| ----- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2** | **Optimistic UI** | Every mutation (create goal, update action item status, react to announcement) reflects in the UI instantly before the server responds. On error, the previous state is restored via a Zustand snapshot rollback. Implemented in `goalStore.js`, `actionItemStore.js`, and the announcement store in `stores/index.js`. |
| **5** | **Audit Log**     | Immutable log of all workspace changes (goals created/updated, members invited, announcements pinned, action item status changes). Features a filterable timeline UI with actor, action type, entity, timestamp, and CSV export. See `apps/backend/src/modules/audit/` and `apps/frontend/src/app/dashboard/audit/`.    |

---

## 📁 Project Structure

```
collaborative-team-hub/
├── turbo.json                    # Turborepo pipeline
├── package.json                  # Root workspace
│
├── packages/
│   └── shared/                   # Shared constants & validators
│       └── src/
│           ├── constants.js      # WORKSPACE_ROLES, GOAL_STATUS, SOCKET_EVENTS, etc.
│           └── validators.js     # Email/password/mention regex helpers
│
└── apps/
    ├── backend/                  # Express.js REST API
    │   ├── prisma/
    │   │   ├── schema.prisma     # PostgreSQL schema
    │   │   └── seed.js           # Demo data seeder
    │   ├── server.js             # Entry point
    │   └── src/
    │       ├── config/           # db, cloudinary, socket.io
    │       ├── middleware/       # auth, rbac, upload, errorHandler
    │       ├── modules/          # auth, users, workspaces, goals, milestones,
    │       │                     # announcements, action-items, comments,
    │       │                     # notifications, analytics, audit
    │       └── utils/            # jwt, cookie, asyncHandler, csvExport, mentions
    │
    └── frontend/                 # Next.js 14 App Router
        └── src/
            ├── app/
            │   ├── auth/         # login, register
            │   └── dashboard/    # dashboard, goals, action-items,
            │                     # announcements, notifications, audit, profile
            ├── components/       # ui, layout, goals, announcements, etc.
            ├── hooks/            # useSocket, useDebounce
            ├── stores/           # Zustand: auth, workspace, goal, actionItem,
            │                     # announcement, notification, ui
            └── lib/              # api (axios), socket.io-client, utils
```

---

## ⚙️ Tech Stack

| Area         | Technology                                        |
| ------------ | ------------------------------------------------- |
| Monorepo     | Turborepo                                         |
| Frontend     | Next.js 14 (App Router, JavaScript)               |
| Styling      | Tailwind CSS                                      |
| State        | Zustand                                           |
| Backend      | Node.js + Express.js                              |
| Database     | PostgreSQL + Prisma ORM                           |
| Auth         | JWT (access + refresh tokens in httpOnly cookies) |
| Real-time    | Socket.io                                         |
| File storage | Cloudinary                                        |
| Charts       | Recharts                                          |
| Deployment   | Railway                                           |

---

## 🖥️ Local Setup (Step by Step)

### Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL (local installation or Docker)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/collaborative-team-hub.git
cd collaborative-team-hub
```

### 2. Install dependencies

```bash
npm install
```

This installs all dependencies for all packages and apps via npm workspaces.

### 3. Set up PostgreSQL locally

**Option A — Local PostgreSQL:**

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu
sudo apt install postgresql
sudo systemctl start postgresql

# Windows: download from postgresql.org
```

Create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE team_hub;
CREATE USER team_hub_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE team_hub TO team_hub_user;
\q
```

**Option B — Docker:**

```bash
docker run -d \
  --name team-hub-db \
  -e POSTGRES_DB=team_hub \
  -e POSTGRES_USER=team_hub_user \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  postgres:16
```

### 4. Configure environment variables

**Backend:**

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
DATABASE_URL="postgresql://team_hub_user:yourpassword@localhost:5432/team_hub"
JWT_ACCESS_SECRET="your-random-64-char-string"
JWT_REFRESH_SECRET="another-random-64-char-string"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLIENT_URL="http://localhost:3000"
NODE_ENV=development
PORT=5000
```

> **Generate JWT secrets:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

> **Cloudinary:** Sign up free at [cloudinary.com](https://cloudinary.com), go to your Console dashboard to get the credentials.

**Frontend:**

```bash
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

The defaults work for local development:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

### 5. Prisma: run migrations

```bash
cd apps/backend
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev --name init   # Create tables in your DB
cd ../..
```

### 6. Seed the database

```bash
cd apps/backend
node prisma/seed.js
cd ../..
```

This creates:

- **4 demo users** (2 admins, 2 members)
- **2 workspaces** (Product Team + Marketing Hub)
- **6 goals** with milestones and activity updates
- **4 announcements** with reactions and comments
- **10 action items** across Kanban statuses
- **6 audit log entries**

### 7. Start the development servers

```bash
# From the root — starts both frontend and backend concurrently
npm run dev
```

| Service       | URL                                    |
| ------------- | -------------------------------------- |
| Frontend      | http://localhost:3000                  |
| Backend API   | http://localhost:5000/api/v1           |
| Health check  | http://localhost:5000/health           |
| Prisma Studio | `cd apps/backend && npx prisma studio` |

---

## 🔑 Demo Credentials

| Email             | Password    | Role                  |
| ----------------- | ----------- | --------------------- |
| `ishrat@demo.com` | `Password1` | Admin (Product Team)  |
| `sam@demo.com`    | `Password1` | Admin (Product Team)  |
| `jordan@demo.com` | `Password1` | Member                |
| `morgan@demo.com` | `Password1` | Admin (Marketing Hub) |

---

## 🌍 Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable                 | Description                                          | Required |
| ------------------------ | ---------------------------------------------------- | -------- |
| `DATABASE_URL`           | PostgreSQL connection string                         | ✅       |
| `JWT_ACCESS_SECRET`      | Secret for signing access tokens (min 32 chars)      | ✅       |
| `JWT_REFRESH_SECRET`     | Secret for signing refresh tokens (min 32 chars)     | ✅       |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiry (default: `15m`)                 | ❌       |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: `7d`)                 | ❌       |
| `CLOUDINARY_CLOUD_NAME`  | Your Cloudinary cloud name                           | ✅       |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                                   | ✅       |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                                | ✅       |
| `CLIENT_URL`             | Frontend URL for CORS (e.g. `http://localhost:3000`) | ✅       |
| `PORT`                   | Server port (default: `5000`)                        | ❌       |
| `NODE_ENV`               | `development` or `production`                        | ❌       |

### Frontend (`apps/frontend/.env.local`)

| Variable                 | Description                        |
| ------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Backend API base URL               |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL (same as API) |

---

## 🗄️ Prisma Workflow Reference

```bash
# Initial setup
npx prisma init                            # Creates prisma/schema.prisma
npx prisma generate                        # Generate Prisma Client
npx prisma migrate dev --name <name>       # Create & apply migration
npx prisma migrate deploy                  # Apply migrations in production
npx prisma db seed                         # Run seeder (or: node prisma/seed.js)
npx prisma migrate reset --force           # Drop DB, re-migrate, re-seed
npx prisma studio                          # Open DB browser GUI
```

---

## 🚂 Railway Deployment

### 1. Create a Railway project

Go to [railway.app](https://railway.app) → **New Project**

### 2. Add PostgreSQL

Click **Add a Service → Database → PostgreSQL**
Railway automatically injects `DATABASE_URL` into your services.

### 3. Deploy the backend

- Add a service → Deploy from GitHub repo
- Set the **Root Directory** to `apps/backend`
- Set **Start Command**: `npx prisma migrate deploy && node server.js`
- Add environment variables in the Railway Variables panel

### 4. Deploy the frontend

- Add another service → Deploy from GitHub repo
- Set **Root Directory** to `apps/frontend`
- Set environment variables pointing to the backend Railway URL

---

## ✅ Submission Checklist (Fill Before Submission)

- **Live Web URL (Railway):** `https://your-web.up.railway.app`
- **Live API URL (Railway):** `https://your-api.up.railway.app`
- **Seeded demo account email:** `ishrat@demo.com`
- **Seeded demo account password:** `Password1`
- **Public GitHub repo URL:** `https://github.com/your-username/collaborative-team-hub`
- **Video walkthrough URL (3-5 min):** `<add link>`

> Keep this section updated with real links before final handoff.

---

## ✨ Features

### Core

- **Authentication** — Register, login, logout, JWT refresh token rotation, protected routes
- **User Profiles** — Avatar upload via Cloudinary, bio editing
- **Workspaces** — Create, switch, invite by email, role management (Admin/Member), accent color
- **Goals & Milestones** — Status, progress %, activity feed, milestone progress sliders
- **Announcements** — Rich text, emoji reactions, comments with @mentions, pinning
- **Action Items** — Kanban board + list view, link to goals, priority, assignee, due date
- **Real-time** — Socket.io presence (online users), live goal/announcement/action item updates
- **@Mentions** — Parse @name in comments, create in-app notifications, push via Socket.io
- **Analytics Dashboard** — Stats cards, goal completion trend chart (Recharts), action item breakdown, CSV export

### Advanced

- **Optimistic UI** (Feature #2) — Instant state updates with graceful rollback on server error
- **Audit Log** (Feature #5) — Immutable filterable timeline of all workspace changes, CSV export

### Bonus

- **Dark/Light theme** — System preference detection + manual toggle
- **Responsive design** — Works on mobile and desktop

---

## ⚠️ Known Limitations

1. **No email sending** — Invitation and @mention email notifications are not implemented (Nodemailer is listed as a dependency but not wired up). In-app notifications work fully via Socket.io.
2. **No drag-and-drop Kanban** — Status changes on the Kanban board use a select dropdown. Native HTML5 drag-and-drop or a library like `@dnd-kit/core` would enhance the UX.
3. **No real-time collaborative editing** — Goal descriptions are not synced in real time (Feature #1 was not chosen).
4. **File attachments on announcements** — Cloudinary attachment upload middleware is configured but not surfaced in the announcement creation UI.
5. **No pagination on Goals/Action Items** — The current implementation fetches all items for a workspace. For large datasets, cursor-based pagination should be added.

---

## 📄 License

MIT
