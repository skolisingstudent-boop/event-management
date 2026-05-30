# Vercel Deployment - Complete Setup Guide

Your Event Management app is ready for Vercel deployment! Here's the complete step-by-step process.

## Architecture Overview

```
Your App (Vercel)
├── Frontend (React/Vite)
│   ├── Built at: frontend/dist
│   └── Runs at: https://your-app.vercel.app/
│
├── API Serverless Functions
│   ├── /api/events
│   ├── /api/events/[id]
│   ├── /api/upcoming
│   ├── /api/auth/login
│   ├── /api/auth/register
│   └── /api/health
│
└── PostgreSQL Database (Supabase)
    ├── Connection: vercel ← DATABASE_URL env var
    └── Data: All persisted in cloud
```

## Prerequisites

- GitHub account (already done ✓)
- Vercel account (free)
- Supabase account (free PostgreSQL)

---

## STEP 1: Set Up PostgreSQL on Supabase

### 1a. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login with GitHub
3. Click "New project"
   - **Name**: event-management
   - **Password**: Create a strong password and save it
   - **Region**: Choose closest to you
4. Wait for project to initialize (1-2 minutes)

### 1b. Get Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Under "Connection Info" find "Connection String"
3. Copy the string that looks like: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require`
4. Keep this safe - you'll need it for Vercel!

### 1c. Create Database Schema

1. In Supabase, go to **SQL Editor** → "New query"
2. Copy and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for fast queries
CREATE INDEX idx_event_date ON events(event_date);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

3. Click "Run" and verify success message

---

## STEP 2: Prepare Your Repository

1. Open terminal and navigate to your project:
```bash
cd c:\Users\lisin\OneDrive\Documents\inventory-management\event-management
```

2. Commit all changes:
```bash
git add .
git commit -m "Add Vercel serverless functions and deployment configuration"
git push origin main
```

3. Verify on GitHub that files are uploaded (check your repo)

---

## STEP 3: Deploy to Vercel

### 3a. Import Project

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub (click "Continue with GitHub")
3. Click "New Project"
4. Find and select your `event-management` repository
5. Click "Import"

### 3b. Configure Build Settings

On the "Configure Project" page:

**Under "Project Settings":**
- **Framework Preset**: Select "Other" (or "Vite" if available)
- **Root Directory**: Leave empty or select root folder
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

**Do NOT check:**
- ✗ "Include source maps in production builds"

### 3c. Add Environment Variables

Click "Add Environment Variable" and add:

**Variable Name**: `DATABASE_URL`
**Value**: Paste your Supabase connection string from Step 1b

Example:
```
postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:6543/postgres?sslmode=require
```

⚠️ Make sure:
- It starts with `postgresql://`
- It ends with `?sslmode=require`
- Password is URL-encoded (if it has special characters)

### 3d. Deploy

1. Click "Deploy" button
2. Wait for deployment to complete (usually 1-3 minutes)
3. You'll see a success message with your URL: `https://your-project.vercel.app`

---

## STEP 4: Test Your Deployment

1. Open your deployment URL
2. Try these tests:

**Test 1: Check API Health**
```
https://your-project.vercel.app/api/health
```
Should return: `{"status":"OK","database":"PostgreSQL"}`

**Test 2: Create an Event**
- Go to your app
- Log in or register
- Try creating an event
- Check browser DevTools (F12) Console for any errors

**Test 3: Search Events**
- Create a few events
- Use the search feature
- Verify results appear

---

## STEP 5: Troubleshooting

### ❌ Deployment Failed

**Check:**
1. Go to Vercel dashboard → "Deployments"
2. Click the failed deployment
3. Click "Build Logs" and look for error messages
4. Common issues:
   - Missing database schema (run SQL again)
   - Wrong environment variable (copy-paste carefully)
   - Node version mismatch (Vercel uses Node 18+ by default)

### ❌ API Endpoints Not Working

1. Check Vercel Logs: Dashboard → Deployments → Runtime Logs
2. Verify `/api` functions exist and are structured correctly
3. Check DATABASE_URL is set in Environment Variables

### ❌ "Cannot GET /" or Blank Page

1. Verify build command ran successfully
2. Check that `frontend/dist` folder exists in deployment
3. Clear browser cache (Ctrl+Shift+Delete) and reload

### ❌ Database Connection Errors

1. Verify connection string in Vercel environment variables
2. Check Supabase allows connections (usually automatic)
3. Try connecting locally first to verify the string works:
```bash
psql "your-connection-string"
```

### ❌ CORS Errors

Already handled in serverless functions! The `/api/lib/cors.js` sets correct headers.

---

## STEP 6: Custom Domain (Optional)

To use your own domain instead of vercel.app:

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your domain
3. Follow the DNS setup instructions
4. Wait for DNS to propagate (5-30 minutes)

---

## STEP 7: Auto-Deployments

✅ Already configured! 

Your app will automatically redeploy when you:
1. Push to `main` branch on GitHub
2. Vercel detects the change
3. Rebuilds and deploys within 1-2 minutes

---

## Key Files for Deployment

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel configuration |
| `api/` | Serverless functions |
| `api/package.json` | API dependencies |
| `frontend/package.json` | Frontend build config |
| `frontend/vite.config.js` | Vite build settings |
| `DEPLOYMENT_CHECKLIST.md` | Quick reference |

---

## API Endpoints

After deployment, all endpoints are at: `https://your-project.vercel.app/api/*`

### Public Endpoints
- `GET /api/health` - Check if API is running
- `GET /api/events` - Get all events
- `GET /api/events?search=keyword` - Search events
- `GET /api/upcoming` - Get upcoming events
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Authenticated Endpoints
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (requires login)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

---

## Important Production Notes

1. **Cold Starts**: First request after deploy takes 5-10 seconds (normal)
2. **No SQLite**: Database is PostgreSQL (cloud-based, persistent)
3. **Scaling**: Vercel automatically handles traffic spikes
4. **Backups**: Supabase provides automatic daily backups
5. **Cost**: Free tier supports ~500 requests/day + database limits

---

## Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Set up custom domain (optional)
3. ✅ Add more users and test permissions
4. ✅ Monitor performance in Vercel Analytics
5. ✅ Set up GitHub Actions for testing (optional)

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **React Docs**: https://react.dev

---

**Your app is ready to go live! 🚀**

Questions? Check the troubleshooting section above or review the deployment logs in Vercel dashboard.
