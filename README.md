# Canvas AI - Full Stack Image Editor

A powerful, browser-based image editor application built with a modern full-stack architecture. It features a robust canvas for graphic creation, AI-powered tools, and a complete authentication system with persistent project storage.

![Canvas AI Banner](https://via.placeholder.com/1200x400.png?text=Canvas+AI+Image+Editor)

## 🚀 Features

### Core Editing

* **Advanced Canvas:** Zoom, pan, and layer management using Fabric.js.
* **Object Manipulation:** Resize, rotate, flip, and move objects (images, shapes, text).
* **Drawing Mode:** Freehand drawing with customizable brush size and color.
* **Text Editor:** Rich text editing with fonts, alignment, spacing, and styling (bold, italic).
* **Shapes:** Rapidly add rectangles, circles, and triangles.

### AI & Enhancements

* **Background Removal:** Integration with Remove.bg API for one-click background removal.
* **AI Auto-Enhance:** Smart filters to instantly improve image quality.
* **Filters:** A suite of presets (Vintage, Polaroid, Sepia, etc.) and manual adjustments (Brightness, Contrast, Blur, etc.).

### Project Management

* **Authentication:** Secure User Sign Up and Login system (JWT-based).
* **Persistence:** Save, Load, Update, and Delete projects using a PostgreSQL database.
* **Templates:** Library of pre-sized templates for social media (Instagram, LinkedIn, YouTube, etc.).
* **Export:** Download high-quality PNG or JPG files with custom quality settings.

### User Experience

* **Theme Support:** Fully responsive Dark and Light modes.
* **History:** Complete Undo/Redo functionality with keyboard shortcuts.
* **Keyboard Shortcuts:** Productivity boosters for common actions (Ctrl+Z, Delete, etc.).

---

## 🛠 Tech Stack

### Frontend

* **Framework:** React 19 (Vite)
* **Styling:** Tailwind CSS 4
* **Canvas Library:** Fabric.js 6+
* **Routing:** React Router DOM
* **Icons:** Heroicons / Lucide

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v18 or higher)
* **PostgreSQL** (running on port `5432`)
* **Git**

---

## ⚙️ Installation & Setup

### 1. Database Setup

Ensure your PostgreSQL server is running. Create a new database named `image_editor` (or match the name in your `.env` file).

### 2. Automated Setup (Windows)

We have provided a convenience script to set up everything for you.

1. Double-click `start.bat` in the root directory.
    * This will install dependencies for both frontend and backend.
    * It will run database migrations.
    * It will start both servers.

### 3. Manual Setup

**Backend:**

```bash
cd backend
npm install
# Create a .env file if it doesn't exist and configure DATABASE_URL
npx prisma migrate dev --name init
npm start
```

*The backend runs on `http://localhost:5000`*

**Frontend:**

```bash
# Open a new terminal in the root directory
npm install
npm run dev
```

*The frontend runs on `http://localhost:5173`*

---

## 🔑 Environment Variables

**Backend (`backend/.env`):**

```env
DATABASE_URL="postgresql://userid:password@localhost:5432/image_editor"
JWT_SECRET="your_super_secret_key"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"
OPENAI_API_KEY="your_openai_api_key"
```

**Frontend:**
The frontend communicates with the backend via a proxy set in `vite.config.ts`. No specific `.env` is required for basic local development unless you customize API endpoints.

## 🚢 Production Readiness Additions

* **Secure Auth Cookies:** Authentication now uses `httpOnly` cookies instead of storing JWTs in `localStorage`.
* **Security Middleware:** Backend includes `helmet`, `compression`, and stricter CORS allowlists.
* **CI Pipeline:** GitHub Actions workflow at `.github/workflows/ci.yml` validates frontend and backend checks.
* **Containers:** Added `Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`, and `nginx.conf` for containerized deployments.
* **Schema Drift Fix:** Added Prisma migration for `ProjectVersion`, `ProjectShare`, and `Template` tables.
* **AI Proxy Endpoint:** `POST /api/ai/generate-image` now proxies image generation server-side.
* **Account Recovery:** Added `forgot-password`, `reset-password`, and email verification endpoints + pages.
* **Metrics Endpoint:** Added Prometheus-compatible `GET /api/metrics` endpoint.
* **E2E Scaffold:** Added Playwright configuration and baseline test under `tests/e2e`.

---

## 📖 Usage Guide

1. **Sign Up/Login:** Create an account to access the dashboard.
2. **Dashboard:** View your saved projects or start a new one.
3. **Editor Toolbar:**
    * **Assets:** Upload images from your computer.
    * **Shapes:** Add geometric shapes.
    * **Text:** Add and customize text layers.
    * **AI:** Use background removal and auto-enhance tools.
    * **Edit:** Transform objects (rotate, flip, lock) and manage layers.
    * **Library:** Choose from a variety of canvas templates.
4. **Export:** Click "Export Creation" in the top right to save your work.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete Selected Object |
| `Ctrl + D` | Duplicate Object |
| `[` / `]` | Send Backward / Bring Forward |
| `Shift + [` / `Shift + ]` | Send to Back / Bring to Front |

---

## 📂 Project Structure

```text
c:/image editor/
├── src/                  # Frontend Source Code
│   ├── components/       # UI Components (Canvas, Toolbar, etc.)
│   ├── context/          # React Context (Auth, Theme)
│   ├── pages/            # Application Pages (Editor, Dashboard, Login)
│   ├── utils/            # Helper functions (Image processing, History)
├── backend/              # Backend Source Code
│   ├── prisma/           # Database Schema
│   ├── schemas/          # Input Validation Schemas
│   └── server.js         # Entry Point
├── public/               # Static Assets
└── README.md             # Project Documentation
```

---

## 🐛 Troubleshooting

* **Database Connection Error:** Verify your PostgreSQL credentials in `backend/.env`. Ensure the PostgreSQL service is running.
* **"Remove.bg API Key missing":** You need to get a free API key from [remove.bg](https://www.remove.bg/) and enter it in the AI Settings panel within the editor.
* **Canvas not loading:** Refresh the page. If the issue persists, ensure the backend is running and the auth token is valid (try logging out and back in).

---

Made with ❤️ by Canvas AI Team
