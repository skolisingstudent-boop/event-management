# Vercel Deployment Setup Guide

## Step 1: Set Up PostgreSQL Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up (free tier available)
2. Create a new project
3. Go to **Settings > Database** and copy the **Connection String** (POSTGRES_URL)
4. In your Supabase SQL editor, run this schema:

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

-- Create index for faster queries
CREATE INDEX idx_event_date ON events(event_date);
```

## Step 2: Prepare Your Repository

1. Make sure all files are committed and pushed to GitHub:
```bash
git add .
git commit -m "Set up Vercel deployment with serverless functions"
git push origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your `event-management` repository
4. Click "Import"
5. In **Project Settings**:
   - **Root Directory**: Leave empty (root project)
   - **Framework Preset**: "Other"
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`

6. Add **Environment Variables**:
   - Name: `DATABASE_URL`
   - Value: `postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require`
   - (Get this from Supabase Settings > Database)

7. Click "Deploy"

## Step 4: Update Frontend API Endpoint

After deployment, update your frontend to use the Vercel URL:

1. In `frontend/vite.config.js`, update the proxy:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-project.vercel.app',
      changeOrigin: true,
    }
  }
}
```

Or update your API calls to use the full URL in production.

## Step 5: Test Your Deployment

1. Go to your Vercel project URL
2. Test the /api/health endpoint: `https://your-project.vercel.app/api/health`
3. Test creating an event via the UI

## Troubleshooting

### Database Connection Issues
- Verify the `DATABASE_URL` in Vercel environment variables
- Check that Supabase project allows connections from Vercel IPs (usually automatic)
- Test connection: `psql <DATABASE_URL>`

### API Routes Not Working
- Check that `/api` directory structure matches Vercel's expected format
- View logs in Vercel dashboard: Project > Deployments > Details

### Frontend Not Loading
- Verify `output` directory is `frontend/dist`
- Check that `frontend/package.json` has build script
- Check build logs in Vercel dashboard

## Local Development

To test locally with PostgreSQL:

1. Update `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/event_management
NODE_ENV=development
```

2. Run both servers:
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend (if still using locally)
node api/lib/dev-server.js
```

## Production URLs

Your application will be available at:
- Frontend: `https://your-project.vercel.app`
- API Endpoints: `https://your-project.vercel.app/api/*`

## Next Steps

1. Set up a custom domain (optional)
2. Configure Vercel Analytics
3. Set up automated deployments on push
4. Add CI/CD testing
