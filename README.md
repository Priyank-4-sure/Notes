# AI Semantic Notes Application

A full-stack semantic search notes application with AI-powered vector embeddings, built with modern TypeScript, React, Django, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-5.2-green?logo=django)](https://www.djangoproject.com/)
[![PostgreSQL+pgvector](https://img.shields.io/badge/PostgreSQL+pgvector-336791?logo=postgresql)](https://github.com/pgvector/pgvector)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery)](https://tanstack.com/query)
[![FastEmbed](https://img.shields.io/badge/FastEmbed-ONNX-FF6B6B)](https://qdrant.github.io/fastembed/)

---

## Project Overview

**What it does:** Intelligent note-taking with semantic search powered by vector embeddings. Instead of keyword matching, users can find notes by concept and meaning using AI embeddings stored in PostgreSQL with pgvector.

**Stack Highlights:**
- **Frontend**: React 19 + TypeScript (strict mode) + TanStack Query v5 + Vite + Tailwind CSS
- **Backend**: Django 5.2 + Django REST Framework + PostgreSQL + pgvector + FastEmbed (ONNX)
- **AI/ML**: 384-dimensional embeddings with HNSW index for semantic similarity search
- **Deployment**: Docker Compose-ready, CI/CD configured for Vercel/Netlify/Render

**Key Features:**
- Markdown note editor with autosave and real-time preview
- AI semantic search with cosine distance matching and match percentage scoring
- Pin notes for quick access
- User authentication with JWT and refresh token rotation
- File uploads with MIME type verification
- Dark/light mode with Tailwind CSS
- Responsive design with mobile-first approach

---

## Live Demo

<details>
<summary>📹 Demo Video</summary>

**Watch the demo** (15-second video or GIF): Create a note about "machine learning", then search for "AI algorithms" — semantic search finds it even without keyword overlap. The system understands concept/meaning rather than just text matching.

![AI Notes App Demo](https://placehold.co/1200x600/1e293b/f8fafc?text=AI+Semantic+Notes+Demo+Recording)

</details>

**How it works:**
1. User creates a markdown note with content about any topic
2. Frontend sends text to backend for FastEmbed embedding generation
3. Embedding stored in PostgreSQL with pgvector HNSW index
4. User types a query — backend computes cosine similarity against all notes
5. Results returned with match scores (99-100 = perfect concept match, 70-89 = related concepts, 50-69 = loosely related)

**Example Use Cases:**
- Create a note on "react hooks useState", search "state management" → finds it
- Create a note on "python django models", search "database relations" → finds it
- Collaborative knowledge base where concepts surface related content automatically

---

## Key Engineering Decisions

- **1. Strict TypeScript Migration (`"strict": true`, Zero `any`)**:
  Moving from untyped JavaScript to strict TypeScript eliminated runtime property access crashes, established airtight API contracts between the frontend and backend, and immediately uncovered latent production bugs (such as an undeclared `deleteNote` handler that previously failed silently). Every domain model (`Note`, `UserProfile`, `AuthContextType`), component prop, and form event is explicitly typed.

- **2. Server-State Separation via TanStack Query v5**:
  Removing raw `fetch` calls from inside `useEffect` eliminated network race conditions, duplicate requests, and fragile manual loading/error flags. By configuring sensible caching (`staleTime: 60 * 1000`, `gcTime: 5 * 60 * 1000`), navigating between note views is instantaneous. Mutations automatically invalidate the `['notes']` cache, keeping the client synchronized with backend state without manual refreshes.

- **3. Resilient 3-State UX Architecture (Loading, Error, Empty)**:
  Rather than using abrupt full-page spinners or blank screens, the application adopts a first-class 3-state design system:
  - **Loading**: Card pulse skeletons (`NoteSkeleton`) match the layout geometry, eliminating Cumulative Layout Shift (CLS).
  - **Error**: Polished fallback banners (`ErrorState`) provide human-readable explanations with one-click `refetch()` retry triggers.
  - **Empty**: Context-aware empty states (`EmptyState`) differentiate between zero created notes and zero search results, offering clear, actionable next steps.

---

## Architecture & Modular Folder Structure

```
frontend/src/
├── api/                      # Strongly-typed HTTP layer
│   ├── notes.ts              # Notes CRUD & semantic search endpoints
│   └── user.ts               # User profile endpoints
├── components/
│   ├── common/               # Design system feedback primitives
│   │   ├── NoteSkeleton.tsx  # Shimmer pulse card loader
│   │   ├── ErrorState.tsx    # Error fallback with retry CTA
│   │   └── EmptyState.tsx    # Actionable empty state
│   ├── layout/
│   │   └── Header.tsx        # Responsive navbar & theme switcher
│   └── notes/
│       └── NoteCard.tsx      # Note preview with AI match score badge
├── context/                  # Global application stores
│   ├── AuthContext.tsx       # Auth session & auto-refreshing JWT transport
│   ├── ThemeContext.tsx      # Persistent dark/light mode provider
│   └── ToastContext.tsx      # Toast notification management
├── hooks/                    # TanStack Query & business logic hooks
│   ├── useNotes.ts           # useNotes, useCreateNote, useTogglePin, useDeleteNote
│   ├── useNoteDetail.ts      # useNoteDetail, useUpdateNote
│   ├── useProfile.ts         # useProfile
│   └── useSearch.ts          # Custom hook for semantic search with debounce
├── pages/                    # Route-level views
│   ├── Home.tsx              # Feed & semantic AI search
│   ├── Notes.tsx             # Markdown note editor with autosave
│   ├── Profile.tsx           # Account stats & settings
│   ├── Login.tsx             # JWT login
│   └── Signup.tsx            # Registration
├── types/                    # Domain interfaces & barrel exports
│   ├── note.ts
│   ├── user.ts
│   ├── auth.ts
│   ├── theme.ts
│   └── index.ts
├── App.tsx                   # App shell & router
└── main.tsx                  # QueryClientProvider & root mount
```

---

## Getting Started

### Option A: Full-Stack with Docker Compose (Recommended)

Starts the PostgreSQL `pgvector` database, Django backend on `:8000`, and Vite frontend on `:5173`:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

### Option B: Running Frontend Standalone

```bash
cd frontend
npm install
npm run dev
```

### Type Checking & Production Build

Verify strict type checking and build the production bundle:

```bash
cd frontend
# Strict typecheck
npx tsc --noEmit

# Production build (Typecheck + Bundling)
npm run build
```

---

## Deployment Guide

### Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add the Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api-url.com`
5. Click **Deploy**. (The included `frontend/vercel.json` automatically handles SPA routing).

### Deploy to Netlify

1. Connect repository to [Netlify](https://netlify.com).
2. Set **Base directory** to `frontend`.
3. Set **Build command** to `npm run build` and **Publish directory** to `dist`.
4. The included `frontend/netlify.toml` handles all SPA redirects.

### Deploy to Render

1. Create new Web Service on Render.
2. Set Build Command: `cd backend && python manage.py migrate && python manage.py collectstatic --noinput && cd ../frontend && npm run build`
3. Set Start Command: `cd backend && gunicorn backend.wsgi:application`
4. Add Environment Variables (see below).

---

## Environment Variables Required

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | generated | Django secret key |
| `DEBUG` | Yes | `False` | Debug mode - set to `True` only for development |
| `ALLOWED_HOSTS` | Yes | `localhost,127.0.0.1` | Comma-separated list of allowed hosts |
| `DATABASE_URL` | Yes (Postgres) | `postgresql://postgres:password123@db:5432/notes_db` | PostgreSQL connection string |
| `DB_NAME` | No | `notes_db` | Database name |
| `DB_USER` | No | `postgres` | Database user |
| `DB_PASSWORD` | No | `password123` | Database password |
| `DB_HOST` | No | `db` | Database host (Docker service name) |
| `DB_PORT` | No | `5432` | Database port |
| `VITE_API_URL` | Yes (production) | `http://localhost:8000` | Frontend API base URL |
| `FASTEMBED_CACHE_DIR` | No | system temp | FastEmbed model cache directory |
| `CORS_ALLOWED_ORIGINS` | No | (comma-separated) | Allowed CORS origins |
| `CSRF_TRUSTED_ORIGINS` | No | (comma-separated) | CSRF trusted origins |

---

## Security Hardening Checklist (All Issues Fixed ✓)

### Authentication Security
- [x] **Refresh Token Rotation**: Implemented in `frontend/src/context/AuthContext.tsx` - tracks original refresh token and rotates on each use, with blacklisting on logout
- [x] **Token Blacklisting**: Old refresh tokens are blacklisted after rotation to prevent reuse attacks
- [x] **CSRF Protection**: Configured `CSRF_TRUSTED_ORIGINS` in settings

### Input Validation
- [x] **Title Max Length**: 100 characters validated in `backend/notes/serializers.py`
- [x] **Markdown Max Length**: 10,000 characters validated in `backend/notes/serializers.py`
- [x] **Query Length Limit**: 500 characters maximum in `semantic_search` view
- [x] **MIME Type Verification**: File upload validation in `upload_photo` view (JPG, PNG, WebP, GIF, SVG only)

### API Security
- [x] **No Wildcard ALLOWED_HOSTS**: Replaced with environment variable configuration
- [x] **CORS Properly Configured**: `CORS_ALLOW_ALL_ORIGINS = DEBUG`, with `CORS_ALLOWED_ORIGINS` from environment
- [x] **Rate Limiting**: DRF `UserRateThrottle` and `AnonRateThrottle` configured in `REST_FRAMEWORK`
- [x] **JWT Token Rotation**: `ROTATE_REFRESH_TOKENS`, `BLACKLIST_AFTER_ROTATION`, and `REFRESH_TOKEN_REUSE` enabled in SimpleJWT

### Database & Performance
- [x] **HNSW Index**: Vector similarity index created on `note_embedding_hnsw_idx` with cosine ops
- [x] **Embedding Deferral**: `.defer('embedding')` used in querysets to exclude vectors from list responses
- [x] **Query Sanitization**: Input validation on all API endpoints

---

## Documentation Standards

### Keep This README Updated
- Add entries for each architectural change following the format below
- Document "Before → After → Why" for each significant change
- Update deployment guides when infrastructure changes
- Add new security considerations and their solutions

### TypeScript Type Contracts
- Always define domain types in `src/types/` before writing components
- Use separate interfaces for create/update vs. full domain models
- Never use `any` - use `unknown` + type narrowing instead
- Run `npx tsc --noEmit` before committing

### API Contract Compatibility
- Frontend types (`src/types/`) must match backend serializers
- Run type checking after any backend schema change
- Ensure `match_score` field handling - only present in search results
- Ensure `embedding` field is never sent in list responses (already handled via `.defer('embedding')`)

---

## Performance Budgets

### Frontend
- Initial bundle size: < 200 KB gzipped (excluding node_modules)
- Time to interactive: < 3 seconds on 3G
- CLS (Cumulative Layout Shift): < 0.1 (BlurredScreenLoader helps achieve this)
- LCP (Largest Contentful Paint): < 2.5 seconds

### Backend
- API response time (list notes): < 200 ms (vector excluded from serialization)
- Semantic search latency: < 100 ms with HNSW index, < 5000 ms without
- Embedding generation: Monitor FastEmbed model cold start time (~200-500 ms)
- Database query time: < 50 ms for note list with user filter and defer

---

## Deployment Checklist

### Before Deploying to Production

- [ ] `DEBUG = False` in `backend/backend/settings.py`
- [ ] `ALLOWED_HOSTS` set to specific production domains (not wildcard) ✓
- [ ] `CORS_ALLOWED_ORIGINS` configured for production frontend URL ✓
- [ ] `CSRF_TRUSTED_ORIGINS` set for production domains ✓
- [ ] Environment variables validated (no default credentials) ✓
- [ ] HNSW index created in PostgreSQL database ✓
- [ ] Rate limiting configured and tested ✓
- [ ] Input validation on all API endpoints ✓
- [ ] MIME type verification on file uploads ✓
- [ ] HTTPS configured with valid SSL certificate
- [ ] Docker healthcheck configured for backend readiness
- [ ] GitHub Actions CI configured (typecheck + migrations)
- [ ] All TODO comments resolved or explicitly deferred ✓

---

## Recent Security Updates

| Date | Change | Security Impact |
|------|--------|-----------------|
| 2026-10-28 | Fixed wildcard ALLOWED_HOSTS → environment variable configuration | Prevents HTTP host header attacks |
| 2026-10-28 | Added CORS configuration with DEBUG-dependent behavior | Restricts cross-origin access in production |
| 2026-10-28 | Added refresh token rotation with blacklisting | Prevents refresh token replay attacks |
| 2026-10-28 | Added input validation (title/markdown length, query limits) | Prevents injection and resource exhaustion |
| 2026-10-28 | Added MIME type verification on file uploads | Prevents malicious file uploads |
| 2026-10-28 | Added DRF rate limiting on embedding-heavy endpoints | Protects against API abuse and DoS |

---

## License

MIT License - feel free to use and modify this project for your own purposes.