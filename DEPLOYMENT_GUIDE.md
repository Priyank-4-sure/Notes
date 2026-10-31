# Complete Deployment Guide: Render + Supabase

## Overview
This guide walks you through deploying your Notes backend to Render with a Supabase PostgreSQL database.

---

## Phase 1: Supabase Setup (5 minutes)

### Step 1: Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: `notes` (or your project name)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (or us-east-1 for US)
4. Click **Create new project**
5. Wait 2-3 minutes for provisioning

### Step 2: Get Your Connection String
1. In Supabase dashboard, click **Settings** (bottom left)
2. Click **Database** in the left menu
3. Scroll to **Connection string**
4. Select **Connection pooler** (recommended for web apps)
5. Copy the URI - it looks like:
   ```
   postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with the password you created in Step 1**
7. Save this string - you'll need it next

---

## Phase 2: Render Backend Setup (10 minutes)

### Step 3: Update Render Environment Variables
1. Go to your Render dashboard → Your backend service
2. Click **Environment** (left sidebar)
3. Click **Add Environment Variable**

**Add these variables:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | Your Render domain (e.g., `notes-backend.onrender.com`) |
| `CORS_ALLOWED_ORIGINS` | Your frontend URL (e.g., `https://notes-frontend.netlify.app`) |
| `SECRET_KEY` | Generate a new one: `openssl rand -hex 32` (run locally) |

**Steps to add:**
- Click **Add Environment Variable**
- Paste the key, paste the value
- Click **Add** after each one
- When done, click **Save**

### Step 4: Verify Procfile is Correct
The `backend/Procfile` should contain:
```
web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn backend.wsgi --bind 0.0.0.0:$PORT --log-file -
```

This automatically runs migrations on every deploy.

### Step 5: Deploy
1. In Render dashboard, click **Manual Deploy** or **Trigger Deploy**
2. Watch the logs - you should see:
   ```
   Running migrations...
   Operations to perform:
   ...
   Running migrations on 'default' database
   ```
3. If successful, you'll see `Deployed successfully`

---

## Phase 3: Verify Database & Create Index (5 minutes)

### Step 6: Check Migrations Ran
1. Go to Supabase dashboard → **SQL Editor**
2. Run this query to check tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
3. You should see tables like:
   - `notes_note`
   - `auth_user`
   - `django_migrations`

### Step 7: Create pgvector HNSW Index
This speeds up semantic search. In Supabase **SQL Editor**, run:
```sql
-- First enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS notes_note_embedding_idx 
ON notes_note 
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=64);
```

---

## Phase 4: Test Backend (5 minutes)

### Step 8: Test API Endpoints
Replace `YOUR_DOMAIN` with your Render domain (e.g., `notes-backend.onrender.com`)

**Test health check:**
```bash
curl https://YOUR_DOMAIN/api/
```

**Create a user (signup):**
```bash
curl -X POST https://YOUR_DOMAIN/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPassword123!"}'
```

**Login:**
```bash
curl -X POST https://YOUR_DOMAIN/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPassword123!"}'
```

This returns `access` and `refresh` tokens. Save the access token.

**Create a note:**
```bash
curl -X POST https://YOUR_DOMAIN/api/notes/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","markdown":"# Hello World"}'
```

If you get a 201 response, everything works!

---

## Phase 5: Frontend Setup (5 minutes)

### Step 9: Update Frontend API URL
1. Open `frontend/.env`
2. Set:
   ```
   VITE_API_URL=https://YOUR_DOMAIN
   ```
3. Deploy frontend (Netlify will auto-deploy on git push)

### Step 10: Test Full Stack
1. Go to your frontend URL
2. Sign up with a test account
3. Create a note
4. Check it appears in Supabase SQL Editor:
   ```sql
   SELECT id, title, markdown, created_at FROM notes_note LIMIT 5;
   ```

---

## Troubleshooting

### "could not translate host name" Error
- **Cause**: `DATABASE_URL` not set or incorrect
- **Fix**: Check Render Environment Variables → `DATABASE_URL` is the full Supabase URI with password

### "psycopg2.OperationalError: FATAL: password authentication failed"
- **Cause**: Wrong password in connection string
- **Fix**: Go to Supabase Settings → Database → copy password again, update `DATABASE_URL`

### "No such table: notes_note"
- **Cause**: Migrations didn't run
- **Fix**: 
  1. Check Render logs for migration errors
  2. Manually run in Render Shell:
     ```bash
     cd backend && python manage.py migrate --verbosity=2
     ```

### CORS Errors on Frontend
- **Cause**: `CORS_ALLOWED_ORIGINS` not set to frontend URL
- **Fix**: Add your frontend domain to Render environment variables, redeploy

### 401 Unauthorized on API Calls
- **Cause**: Auth token expired or invalid
- **Fix**: Login again via `/api/token/` to get fresh token

---

## Success Checklist

- [ ] Supabase project created with password saved
- [ ] Connection string copied (with password filled in)
- [ ] `DATABASE_URL` set in Render
- [ ] `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `SECRET_KEY` set
- [ ] Backend deployed successfully
- [ ] Migrations ran (check Supabase tables exist)
- [ ] HNSW index created in Supabase
- [ ] API endpoints tested with curl
- [ ] Frontend `.env` updated with API URL
- [ ] Frontend deployed
- [ ] Full-stack test completed (signup → create note)

---

## Quick Reference: Environment Variables

```bash
# Render Backend Environment Variables
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
DEBUG=False
ALLOWED_HOSTS=notes-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://notes-frontend.netlify.app
CSRF_TRUSTED_ORIGINS=https://notes-frontend.netlify.app
SECRET_KEY=<generated-random-key>
```

```bash
# Frontend .env
VITE_API_URL=https://notes-backend.onrender.com
```

---

## Next Steps After Deployment

1. **Monitor logs** regularly: Render Dashboard → Logs
2. **Set up alerts** in Render for failed deploys
3. **Test periodically**: Login, create/edit/delete notes
4. **Backup Supabase** regularly (Settings → Backups)
5. **Review security checklist** in CLAUDE.md before going to production

