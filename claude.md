# Claude Code Configuration for Notes Project

This `claude.md` file provides instructions and configuration for Claude Code when working with the Notes full-stack application.

## Project Context

- **Primary working directory**: `D:\Projects\Notes`
- **Git branch**: `main`
- **Stack**: TypeScript + React (Frontend) / Python/Django with pgvector (Backend)
- **AI/ML**: FastEmbed embeddings + pgvector HNSW semantic search
- **Last audited**: 2026-10-28

## Critical Directories & Files

### Frontend
- `frontend/src/` - React source code (TypeScript, JSX)
- `frontend/src/types/` - Domain interfaces (Note, UserProfile, AuthContextType, etc.)
- `frontend/src/context/` - React context providers (Auth, Theme, Toast)
- `frontend/src/hooks/` - TanStack Query hooks (useNotes, useCreateNote, useTogglePin, useDeleteNote, useNoteDetail, useProfile)
- `frontend/src/api/` - API fetch functions (notes.ts, user.ts, config.ts)
- `frontend/src/pages/` - Route-level views (Home, Notes, Profile, Login, Signup)
- `frontend/src/components/` - Reusable UI components (NoteCard, MarkdownPreview, ErrorState, EmptyState, BlurredScreenLoader, Header, NoteSkeleton)
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/tsconfig.json` - TypeScript strict configuration
- `frontend/package.json` - Dependencies and scripts

### Backend
- `backend/backend/settings.py` - Django settings (SECURITY: wildcard ALLOWED_HOSTS, DEBUG default True)
- `backend/backend/urls.py` - Project-level URL routing
- `backend/notes/models.py` - Note model with pgvector VectorField + HNSW index
- `backend/notes/serializers.py` - DRF serializers (NoteSerializer, UserRegistrationSerializer)
- `backend/notes/views.py` - DRF views (semantic_search, upload_photo, NoteListCreate, NoteDetail, UserDetailView)
- `backend/notes/urls.py` - App-level URL routing
- `backend/notes/utils.py` - FastEmbedWrapper for embedding generation
- `backend/notes/management/commands/` - Custom Django management commands (generate_fake_notes, recompute_embeddings, benchmark_search)
- `backend/requirements.txt` - Python dependencies

### Configuration Files
- `backend/.env` - Environment variables (DB credentials, debug flag)
- `frontend/.env` - Vite API URL configuration
- `frontend/vite.config.js` - Vite React plugin + `@` path alias
- `frontend/eslint.config.js` - ESLint with React Hooks plugin
- `frontend/postcss.config.js` - PostCSS with Tailwind plugins
- `docker-compose.yml` - Docker Compose for full-stack development
- `LEARNING_GUIDE.md` - Comprehensive project documentation and changelog

## Security Hardening Checklist (Priority 1)

### Must Fix Before Production Deployment

1. **Replace wildcard ALLOWED_HOSTS**
   - Edit `backend/backend/settings.py`
   - Replace `ALLOWED_HOSTS = ['*']` with specific domains from environment
   - Set `DEBUG = False` in production

2. **Configure CORS properly**
   - Edit `backend/backend/settings.py`
   - Change `CORS_ALLOW_ALL_ORIGINS = True` to `CORS_ALLOW_ALL_ORIGINS = DEBUG`
   - Add `CORS_ALLOWED_ORIGINS` from environment variable for production

3. **Add refresh token rotation**
   - Update `frontend/src/context/AuthContext.tsx`
   - Track original refresh token and rotate on each use
   - Implement token blacklisting on logout

4. **Add input validation**
   - Edit `backend/notes/serializers.py` - Add `max_length` to NoteSerializer fields
   - Edit `backend/notes/views.py` - Add query length limit/sanitization in `semantic_search`
   - Add MIME type verification in `upload_photo` view

5. **Add rate limiting**
   - Add DRF `SimpleRateThrottle` to embedding-heavy endpoints (`create_note`, `upload_photo`, `perform_update`)
   - Configure throttle rates in `REST_FRAMEWORK` dict in settings

## Quick Implementation Commands

### 1. Fix CORS & ALLOWED_HOSTS
```bash
# In backend/backend/settings.py, replace:
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True  # Only when DEBUG
# With:
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
CORS_ALLOW_ALL_ORIGINS = os.environ.get('DEBUG', 'False') == 'True'
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
```

### 2. Add Input Validation to Serializer
```python
# In backend/notes/serializers.py, NoteSerializer:
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'markdown', 'pinned', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_title(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Title must be at most 100 characters.")
        return value
    
    def validate_markdown(self, value):
        if len(value) > 10000:
            raise serializers.ValidationError("Markdown must be at most 10,000 characters.")
        return value
```

### 3. Add MIME Type Verification to Upload
```python
# In backend/notes/views.py, upload_photo function:
allowed_mime_types = {'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'}
ext = os.path.splitext(photo.name)[1].lower()
if ext not in allowed_extensions:
    # ... existing extension check
# Add after extension check:
if photo.content_type not in allowed_mime_types:
    return Response(
        {'error': 'Unsupported file format. Supported: JPG, PNG, WebP, GIF, SVG'},
        status=status.HTTP_400_BAD_REQUEST
    )
```

### 4. Add Rate Limiting to Views
```python
# In backend/settings.py, REST_FRAMEWORK:
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'user': '100/hour',
        'anon': '10/hour',
    },
}
# Then on embedding-heavy views:
from rest_framework.throttling import UserRateThrottle
class NoteListCreate(generics.ListCreateAPIView):
    throttle_classes = [UserRateThrottle]  # or custom throttle
```

### 5. Verify TypeScript Type Checking
```bash
cd D:\Projects\Notes\frontend
npx tsc --noEmit
# Fix any errors that appear
npm run build  # Verify production build
```

## Design System Configuration

### Tailwind Design Tokens
Edit `frontend/tailwind.config.js` to add design tokens:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'indigo-600',
          dark: 'indigo-500',
          light: 'indigo-400',
        },
        sidebar: {
          dark: 'slate-900',
          light: 'slate-50',
        },
      },
      spacing: {
        headerHeight: '80px',
        sectionPadding: '4rem',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Source Sans Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Common Component Patterns
- Extract frequently used Button, Input, and Card components with consistent Tailwind classes
- Use `prose` class for markdown preview with customizations
- Maintain consistent color palette across all components

## Documentation Standards

### Keep LEARNING_GUIDE.md Updated
- Add entries for each architectural change following the existing format
- Document "Before → After → Why" for each significant change
- Update performance benchmarks when optimizations are implemented
- Add new traps/pitfalls encountered and their solutions

### TypeScript Type Contracts
- Always define domain types in `src/types/` before writing components
- Use separate interfaces for create/update vs. full domain models
- Never use `any` - use `unknown` + type narrowing instead
- Run `npx tsc --noEmit` before committing

### API Contract Compatibility
- Frontend types (`src/types/`) must match backend serializers
- Run type checking after any backend schema change
- Update `match_score` field handling - only present in search results
- Ensure `embedding` field is never sent in list responses (already handled via `.defer('embedding')`)

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

## Deployment Checklist

### Before Deploying to Production

- [ ] `DEBUG = False` in `backend/backend/settings.py`
- [ ] `ALLOWED_HOSTS` set to specific production domains (not wildcard)
- [ ] `CORS_ALLOWED_ORIGINS` configured for production frontend URL
- [ ] `CSRF_TRUSTED_ORIGINS` set for production domains
- [ ] Environment variables validated (no default credentials)
- [ ] HNSW index created in PostgreSQL database
- [ ] Background embedding model pre-warmed (via `apps.py` or startup script)
- [ ] Rate limiting configured and tested
- [ ] Input validation on all API endpoints
- [ ] MIME type verification on file uploads
- [ ] HTTPS configured with valid SSL certificate
- [ ] Docker healthcheck configured for backend readiness
- [ ] GitHub Actions CI configured (typecheck + migrations)
- [ ] All TODO comments resolved or explicitly deferred

### Environment Variables Required

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | generated | Django secret key |
| `DEBUG` | Yes | `True` | Debug mode |
| `ALLOWED_HOSTS` | Yes | `localhost,127.0.0.1` | Comma-separated list |
| `DATABASE_URL` | Yes (Postgres) | `postgresql://postgres:password123@db:5432/notes_db` | PostgreSQL connection |
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

## Claude Code Best Practices for This Project

### 1. Always Check Type Safety First
Before modifying any API contract, run `npx tsc --noEmit` in the frontend directory to ensure types remain consistent across frontend and backend changes.

### 2. Preserve the 3-State UX Pattern
When adding new loading/error/empty states, maintain the existing pattern:
- Loading: `BlurredScreenLoader` with layout-matching skeletons
- Error: `ErrorState` with human-readable messages + retry CTA
- Empty: `EmptyState` context-aware with actionable next steps

### 3. Keep Vectors Out of Serialization
Never include the `embedding` field in note list responses. Always use `.defer('embedding')` on querysets and ensure the serializer's `read_only_fields` doesn't include it.

### 4. Maintain Refresh Token Security
When implementing refresh token rotation:
- Never use the same refresh token twice
- Invalidate old tokens on logout
- Store minimal data in the token; use server-side blacklisting for revocation

### 5. Document Everything in LEARNING_GUIDE.md
Following the existing format:
```
| Feature / Area | Before | After | Why This Was Necessary |
| :--- | :--- | :--- | :--- |
```
This is how the team learns from each change and maintains architectural integrity as the project grows.

### 6. Test Performance Benchmarks Before/After
When making optimization changes (especially to the embedding pipeline or search index), run `python manage.py benchmark_search` to quantify the impact. Document results in the LEARNING_GUIDE.md.

### 7. Never Commit with Failing Types
`npm run build` must succeed before any commit that changes frontend types or components. The CI pipeline should enforce this.

### 8. Keep Authentication Flows Consistent
The auth flow follows this pattern:
1. Login → `POST /api/token/` → store `access` + `refresh` in localStorage
2. API calls → use `authFetch` with automatic 401 refresh retry
3. Refresh → `POST /api/token/refresh/` → rotate access token
4. Logout → invalidate both tokens, clear localStorage, redirect to `/login`

Any deviation from this pattern should be documented and reviewed.

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-10-28 | Initial audit and claude.md creation | Claude Code |

---

**This file should be reviewed and updated whenever:**
- New security issues are discovered or patched
- Major architectural changes are made
- Performance benchmarks are updated
- Dependencies are upgraded (React, Django, Tailwind, etc.)
- New team members join the project