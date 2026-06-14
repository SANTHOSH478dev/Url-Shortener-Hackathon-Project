# 🔗 SnapLink — URL Shortener with Analytics

A full-stack URL shortener built with **React**, **Node.js/Express**, and **MongoDB**. Users can sign up, shorten long URLs, generate QR codes, set custom aliases & expiry dates, bulk-shorten via CSV, and track detailed click analytics (device, browser, daily trends, recent visits).

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [AI Planning Document](#-ai-planning-document)
- [Architecture Diagram](#-architecture-diagram)
- [Assumptions Made](#-assumptions-made)
- [Demo Video](#-demo-video)

---

## ✨ Features

### Core
- JWT-based authentication (signup/login), passwords hashed with bcrypt
- Protected dashboard — each user only sees/manages their own links
- Create short URLs with frontend + backend URL validation
- Unique short code generation (nanoid)
- Server-side redirect (`GET /:shortCode`) with click logging
- Dashboard: list, copy, delete short URLs; shows original URL, short URL, created date, total clicks

### Analytics
- Total click count & last visited timestamp per link
- Recent visit history (timestamp, device, browser, OS, referrer)
- Daily click trend chart (last 7 days)
- Device & browser breakdown pie charts

### Bonus features implemented
- ✅ Custom alias for short URLs
- ✅ QR code generation (downloadable PNG)
- ✅ Link expiry dates
- ✅ Device/browser analytics (via user-agent parsing)
- ✅ Charts for daily click trends (Recharts)
- ✅ Public stats page (`/stats/:shortCode`) — no login required
- ✅ Edit destination URL, expiry, and active status
- ✅ Bulk URL shortening via CSV upload

### UI
- Fully responsive (mobile cards / desktop table views)
- Loading, success, and error states throughout
- Inline form validation messages
- Toast notifications for actions

---

## 🛠 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, React Router v6, Recharts, Axios, react-toastify |
| Backend  | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth     | JWT + bcryptjs |
| Extras   | qrcode, ua-parser-js, multer + csv-parser (bulk upload), nanoid, express-validator |

---

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT route protection
│   │   └── errorMiddleware.js   # Centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Url.js
│   │   └── Click.js
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── urlRoutes.js         # /api/urls/*
│   │   └── redirectRoutes.js    # /:shortCode + /api/stats/*
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── generateShortCode.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── PrivateRoute.js
        │   ├── CreateUrlForm.js
        │   ├── BulkUpload.js
        │   ├── UrlTable.js
        │   ├── QRCodeModal.js
        │   └── EditUrlModal.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Landing.js
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── Dashboard.js
        │   ├── Analytics.js
        │   ├── PublicStats.js
        │   └── NotFound.js
        ├── utils/
        │   └── api.js            # Axios instance + interceptors
        ├── styles/
        │   └── global.css        # Design tokens & base styles
        ├── App.js
        └── index.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local instance or MongoDB Atlas connection string)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd url-shortener
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET, BASE_URL, CLIENT_URL
npm run dev      # starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a different host/port
npm start        # starts on http://localhost:3000
```

### 4. Usage
1. Open `http://localhost:3000`
2. Sign up for an account
3. Paste a long URL on the Dashboard and click **Shorten**
4. Copy the short link, generate a QR code, or view analytics
5. Visit the short link (e.g. `http://localhost:5000/abc1234`) — it redirects to the original URL and logs a click
6. View live analytics on the Analytics page for that link

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/url_shortener` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_long_random_secret` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `BASE_URL` | Base URL used to build short links | `http://localhost:5000` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_BASE_URL` | Backend base URL (for short links) | `http://localhost:5000` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login & receive JWT |
| GET | `/api/auth/profile` | Private | Get logged-in user's profile |

### URLs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/urls` | Private | Create a short URL (supports `customAlias`, `expiresAt`) |
| GET | `/api/urls` | Private | List all URLs for logged-in user |
| PUT | `/api/urls/:id` | Private | Edit destination URL, expiry, active status |
| DELETE | `/api/urls/:id` | Private | Delete a short URL |
| GET | `/api/urls/:id/analytics` | Private | Get full analytics for a URL |
| GET | `/api/urls/:id/qrcode` | Private | Generate QR code (base64 PNG) |
| POST | `/api/urls/bulk` | Private | Bulk create short URLs from CSV (`file` field, `url` column) |

### Redirect & Public Stats
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:shortCode` | Public | Redirects to original URL; logs click analytics |
| GET | `/api/stats/:shortCode` | Public | Public stats (total clicks, last visited, status) |

---

## 🧠 AI Planning Document

### Step 1 — Requirement Analysis
Parsed the problem statement into three functional pillars: **Authentication**, **URL Shortening + Redirection**, and **Analytics Dashboard**, plus a UI layer covering all states (loading/success/error/validation).

### Step 2 — Data Modeling
Designed three collections:
- **User** — name, email (unique), hashed password
- **Url** — owner reference, original URL, unique short code, custom alias flag, click count, expiry, active flag, last visited
- **Click** — reference to URL, timestamp, IP, device/browser/OS (parsed from user-agent), referrer

Separating `Click` from `Url` allows storing unlimited visit history without bloating the URL document, and enables aggregation queries for daily trend charts and device/browser breakdowns.

### Step 3 — API Design
Built REST APIs grouped by resource (`/api/auth`, `/api/urls`, `/api/stats`) with a separate top-level redirect route (`/:shortCode`) so short links stay clean (no `/api` prefix). All mutating routes use `express-validator` for backend validation, and JWT middleware (`protect`) guards private routes.

### Step 4 — Frontend Architecture
- `AuthContext` manages global auth state (JWT + user in `localStorage`)
- `PrivateRoute` wraps protected pages
- `axios` instance auto-attaches the JWT and handles 401 auto-logout
- Dashboard composed of small, focused components: `CreateUrlForm`, `BulkUpload`, `UrlTable`, `QRCodeModal`, `EditUrlModal`
- `Analytics` page uses Recharts for line/pie charts
- Fully responsive: table view on desktop, card view on mobile

### Step 5 — Bonus Features
Prioritized bonus features that demonstrate full-stack depth: custom aliases, QR codes, expiry, device/browser analytics, daily trend charts, public stats page, edit URL, and bulk CSV upload — all implemented with their own validation and error states.

### Step 6 — Validation & Security
- Passwords hashed with bcrypt (cost factor 10)
- JWT-based stateless auth with 7-day expiry
- Backend validation on all inputs via `express-validator`
- URL format validated on both frontend and backend (must be `http://` or `https://`)
- User-scoped queries everywhere (`{ user: req.user._id }`) to prevent cross-user data access

---

## 🏗 Architecture Diagram

```
┌──────────────────────────┐        HTTPS/JSON         ┌───────────────────────────┐
│        React SPA          │ ───────────────────────▶ │      Express REST API       │
│  (Dashboard, Auth, Charts) │ ◀─────────────────────── │ (Auth, URL CRUD, Analytics) │
└──────────────────────────┘                            └──────────────┬────────────┘
        │  localStorage (JWT)                                            │
        │                                                                 │ Mongoose
        │  GET /:shortCode (browser navigation)                          ▼
        │ ───────────────────────────────────────────▶  ┌───────────────────────────┐
        │                                                 │         MongoDB             │
        │ ◀── 302 redirect to originalUrl ────────────── │  Users | Urls | Clicks      │
        ▼                                                 └───────────────────────────┘
  Original Website
```

**Flow for shortening:** User submits long URL → frontend validates → POST `/api/urls` → backend validates, generates unique `shortCode` (nanoid) → saved in `Url` collection → short URL returned & displayed.

**Flow for redirect + analytics:** Visitor hits `BASE_URL/:shortCode` → backend looks up `Url`, checks `isActive`/`expiresAt` → logs a `Click` document (timestamp, device, browser, OS, referrer via UA parsing) → increments `clicks` & `lastVisited` on `Url` → issues `302` redirect to `originalUrl`.

**Flow for analytics page:** Frontend requests `/api/urls/:id/analytics` → backend aggregates `Click` documents (daily trends, device/browser breakdown) + returns recent visits → Recharts renders line/pie charts.

---

## 📌 Assumptions Made

- A user must be authenticated to create, view, edit, or delete short URLs; the redirect endpoint and public stats page are intentionally public.
- "Recent visit history" is limited to the latest 20 visits per link to keep the analytics payload small; total click count is tracked separately and is unbounded.
- Daily click trend chart covers the last 7 days; this can be extended with a date-range picker as a future enhancement.
- Custom aliases are restricted to 3–20 alphanumeric characters, hyphens, and underscores, and must be globally unique across all users.
- Bulk CSV upload expects a column named `url` (case-insensitive fallback to `URL`/`originalUrl`); invalid rows are skipped and reported individually rather than failing the whole batch.
- Expired or deactivated links return a `410 Gone` response instead of redirecting.
- MongoDB is used as the primary database (PostgreSQL was an allowed alternative per the problem statement, but MongoDB's flexible schema suited the analytics-heavy `Click` collection well).

---

## 🎥 Demo Video


`[VIDEO LINK HERE]`
https://www.image2url.com/r2/default/videos/1781456003502-7a056131-a148-4166-b54c-9900973555f0.mp4
---

This project is a part of a hackathon run by https://katomaran.com
