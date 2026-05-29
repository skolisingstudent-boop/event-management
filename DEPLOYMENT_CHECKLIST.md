# Vercel Deployment - Quick Start Checklist

## Pre-Deployment Tasks

### 1. Database Setup (Supabase)
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project in Supabase
- [ ] Copy Connection String (POSTGRES_URL) from Settings > Database
- [ ] Run SQL schema in Supabase SQL editor (see VERCEL_DEPLOYMENT.md)
- [ ] Test connection is working

### 2. GitHub Repository
- [ ] All files committed and pushed to GitHub
- [ ] Repository is public or Vercel has access
- [ ] Commit message: "Set up Vercel deployment with serverless functions"

### 3. Vercel Setup
- [ ] Visit https://vercel.com and sign up (connect with GitHub)
- [ ] Import your `event-management` repository
- [ ] Configure build settings:
  - [ ] Root Directory: (leave empty)
  - [ ] Build Command: `cd frontend && npm run build`
  - [ ] Output Directory: `frontend/dist`
- [ ] Add Environment Variables:
  - [ ] `DATABASE_URL` = (your Supabase connection string)

### 4. After Deployment
- [ ] Test health endpoint: `/api/health`
- [ ] Test creating an event
- [ ] Check browser console for any API errors
- [ ] View logs in Vercel dashboard if issues occur

### 5. Frontend Configuration (Optional)
If needed, update API base URL in frontend components:
- [ ] Update axios baseURL to `https://your-project.vercel.app/api`
- [ ] Or use relative paths `/api/...` (already configured)

## API Endpoints After Deployment

- GET `/api/health` - Health check
- GET `/api/events` - Get all events
- GET `/api/events?search=term` - Search events
- GET `/api/upcoming` - Get upcoming events
- GET `/api/events/[id]` - Get single event
- POST `/api/events` - Create event
- PUT `/api/events/[id]` - Update event
- DELETE `/api/events/[id]` - Delete event
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

## Important Notes

1. **First time queries will be slow** - Vercel cold starts can take 5-10 seconds
2. **Database persistence** - Supabase handles all data persistence
3. **Environment variables** - Never commit `.env` files with secrets
4. **Logs** - Check Vercel dashboard Logs tab for debugging

## Rollback

If something goes wrong:
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on the previous successful deployment
5. Click the three dots menu and select "Promote to Production"

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Connection Issues: https://supabase.com/docs/guides/database/connecting-to-postgres
