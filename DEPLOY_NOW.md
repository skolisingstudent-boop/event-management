# Deploy to Vercel - Step by Step Guide

## ✅ What's Done So Far
- Your code is committed and pushed to GitHub ✓
- You have your Supabase connection string ✓
- Database schema is created ✓

## Now: Deploy to Vercel (5 minutes)

---

## **STEP 1: Go to Vercel Website**

1. Open your browser
2. Go to: **https://vercel.com**
3. You should see the Vercel homepage

---

## **STEP 2: Sign In with GitHub**

1. Click the **"Sign Up"** or **"Log In"** button (top right)
2. Click **"Continue with GitHub"**
3. GitHub will ask to authorize Vercel - click **"Authorize Vercel"**
4. You're now logged in to Vercel!

---

## **STEP 3: Create New Project**

1. Click **"Add New..."** button (top right area)
2. Select **"Project"** from dropdown
3. A list of your GitHub repos will appear
4. Find **"event-management"** and click **"Import"**

---

## **STEP 4: Configure Project Settings**

After clicking Import, you'll see "Configure Project" page. Fill in:

### Build & Development Settings:
- **Framework Preset**: Select **"Other"** (or skip this)
- **Root Directory**: Leave **empty**
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install` (should be default)

### Environment Variables:
1. Click **"Add Environment Variable"**
2. Enter:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Supabase connection string (the one you copied)

Example of what it should look like:
```
postgresql://postgres.abcdefghij:your_password@db.supabaseproject.supabase.co:5432/postgres?sslmode=require
```

---

## **STEP 5: Deploy!**

1. Click the **"Deploy"** button (large blue button at bottom)
2. Wait 1-3 minutes for deployment to finish
3. You'll see ✅ "Congratulations! Your project has been successfully deployed"
4. Click **"Visit"** to see your live app!

---

## **STEP 6: Test Your App**

Your app should now be live at: **https://your-project.vercel.app**

### Quick Tests:

**Test 1: Does it load?**
- Open the URL
- Should see the Event Management app

**Test 2: Is the API working?**
- Open: `https://your-project.vercel.app/api/health`
- Should see: `{"status":"OK","database":"PostgreSQL"}`

**Test 3: Can you create an event?**
- Register a new user
- Create an event
- Check browser DevTools (F12) → Console for any errors

---

## ✅ You're Done!

Your app is now live on Vercel! 🎉

**Your live URL:** `https://your-project.vercel.app`

---

## If Something Goes Wrong

### Deployment Failed?
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Find the failed deployment
4. Click "Build Logs" to see what went wrong
5. Common issues:
   - DATABASE_URL not set correctly
   - Wrong database password
   - Build command syntax error

### App loads but API doesn't work?
1. Check DATABASE_URL is correct in Vercel Settings
2. Make sure database schema was created (run SQL in Supabase)
3. Check "Runtime Logs" in Vercel for error messages

### Need to update the app?
1. Make changes locally
2. `git commit` and `git push origin main`
3. Vercel automatically redeploys!

---

## Important Notes

- **First request takes 5-10 seconds** (Vercel cold start - normal!)
- **Auto-deploys on every push** to GitHub
- **All data persists** in Supabase database
- **Free tier** works great for hobby projects

---

**Questions? Check the full guide at `VERCEL_COMPLETE_GUIDE.md`**

You're all set! Your event management app is live! 🚀
