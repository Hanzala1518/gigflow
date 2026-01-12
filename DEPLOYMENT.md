# GigFlow Deployment Guide

Complete guide to deploy the GigFlow application with frontend on Vercel and backend on Render.

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [ ] GitHub account (for code repository)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Render account (sign up at https://render.com)
- [ ] MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)
- [ ] Git installed locally
- [ ] All code committed to a GitHub repository

---

## 🗄️ Part 1: MongoDB Atlas Setup

MongoDB Atlas provides a free hosted MongoDB with replica sets enabled by default (required for transactions).

### Step 1.1: Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose a cloud provider and region (pick one close to your Render region)
6. Name your cluster (e.g., `gigflow-cluster`)
7. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 1.2: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `gigflow-admin` (or your choice)
5. Password: Generate a strong password (save it securely!)
6. Database User Privileges: Select **"Read and write to any database"**
7. Click **"Add User"**

### Step 1.3: Whitelist IP Addresses

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
   - This is necessary for Render to connect
   - Atlas still requires authentication, so it's secure
4. Click **"Confirm"**

### Step 1.4: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://gigflow-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password
7. Add your database name before the `?`: 
   ```
   mongodb+srv://gigflow-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gigflow?retryWrites=true&w=majority
   ```

✅ Save this connection string - you'll need it for Render!

---

## 🚀 Part 2: Backend Deployment on Render

### Step 2.1: Prepare Backend for Deployment

The backend code is already organized in the `backend/` folder.

#### Update package.json (Already Done!)

Your `backend/package.json` already has the correct scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Verify index.js

Ensure your entry point (`backend/index.js`) uses `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 5000;
```

### Step 2.2: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/gigflow.git
git branch -M main
git push -u origin main
```

### Step 2.3: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select your **GigFlow repository**
5. Configure the service:

   **Basic Settings:**
   - **Name:** `gigflow-backend`
   - **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT**
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Instance Type:**
   - Select **"Free"** (for testing) or **"Starter"** (for production)

6. Click **"Advanced"** and add environment variables:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `MONGODB_URI` | Your MongoDB Atlas connection string | From Part 1.4 |
   | `JWT_SECRET` | Click "Generate" or use a 32+ char random string | Keep this secret! |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration |
   | `COOKIE_MAX_AGE` | `604800000` | 7 days in milliseconds |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` | Update after deploying frontend |

7. Click **"Create Web Service"**

### Step 2.4: Wait for Deployment

- Render will build and deploy your backend
- Monitor the logs in the Render dashboard
- Once deployed, you'll see: **"Your service is live 🎉"**
- Copy your backend URL: `https://gigflow-backend.onrender.com`

### Step 2.5: Test Backend

Test your deployed backend:

```bash
# Health check
curl https://gigflow-backend.onrender.com/health

# Should return:
# {"success":true,"message":"Server is healthy"}
```

⚠️ **Important:** Free tier Render services spin down after 15 minutes of inactivity. First request after idle will take 30-60 seconds to wake up.

---

## 🌐 Part 3: Frontend Deployment on Vercel

### Step 3.1: Prepare Frontend

#### Update API Base URL

Create/update `frontend/.env.production`:

```env
VITE_API_URL=https://gigflow-backend.onrender.com
```

#### Update frontend/src/services/api.js

Ensure the API service uses the environment variable:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

#### Create vercel.json

Create `frontend/vercel.json` for SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 3.2: Commit Frontend Changes

```bash
git add .
git commit -m "Configure frontend for production"
git push origin main
```

### Step 3.3: Deploy on Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - What's your project's name? gigflow-frontend
# - In which directory is your code located? ./
# - Want to override the settings? N

# After deployment, you'll get a preview URL
# Deploy to production:
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:

   **Framework Preset:** `Vite`
   
   **Root Directory:** `frontend`
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `dist`
   
   **Install Command:** `npm install`

5. Add **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://gigflow-backend.onrender.com` |

6. Click **"Deploy"**

### Step 3.4: Wait for Deployment

- Vercel will build and deploy your frontend
- Usually takes 1-2 minutes
- Once done, you'll see: **"🎉 Congratulations!"**
- Copy your frontend URL: `https://gigflow-frontend.vercel.app`

---

## 🔧 Part 4: Update CORS Settings

Now that you have your frontend URL, update the backend CORS settings.

### Step 4.1: Update Backend Environment Variable

1. Go to your Render dashboard
2. Select your `gigflow-backend` service
3. Go to **"Environment"** tab
4. Find `CORS_ORIGIN` variable
5. Update value to: `https://gigflow-frontend.vercel.app`
6. Click **"Save Changes"**
7. Render will automatically redeploy

---

## ✅ Part 5: Testing & Verification

### Step 5.1: Test Complete Flow

1. **Visit your frontend:** `https://gigflow-frontend.vercel.app`

2. **Register a new user:**
   - Fill out registration form
   - Submit
   - Should redirect to dashboard

3. **Create a gig:**
   - Navigate to create gig
   - Fill out form
   - Submit
   - Should see new gig in feed

4. **Test bidding (use incognito/another browser):**
   - Register a second user (freelancer)
   - Place a bid on the gig
   - Should see success message

5. **Test hiring:**
   - Log back in as first user (gig owner)
   - View gig details
   - See bids
   - Click "Hire"
   - Should update status

6. **Test real-time notifications:**
   - Keep freelancer session open
   - Hire them from owner session
   - Should see toast notification instantly

### Step 5.2: Check Logs

**Backend logs (Render):**
- Go to Render dashboard
- Select your service
- Click **"Logs"** tab
- Check for errors

**Frontend errors (Vercel):**
- Go to Vercel dashboard
- Select your project
- Click **"Deployments"** → Select latest → **"Functions"**
- Check for build/runtime errors

---

## 🔒 Part 6: Security Checklist

- [ ] **MongoDB:** Connection string is secure (not exposed in frontend)
- [ ] **JWT_SECRET:** Is a strong, random string (32+ characters)
- [ ] **CORS:** Only allows your frontend domain
- [ ] **Environment Variables:** All sensitive data in env vars, not hardcoded
- [ ] **HTTPS:** Both frontend and backend use HTTPS (automatic on Vercel/Render)
- [ ] **Cookies:** Secure flag is enabled in production (check `src/utils/jwt.js`)

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Symptom:** Frontend can't connect to backend, sees CORS error in console

**Solution:**
1. Verify `CORS_ORIGIN` in Render matches exact frontend URL (including https://)
2. No trailing slash in URL
3. Ensure `withCredentials: true` in frontend API config
4. Check backend logs for CORS rejection messages

### Issue: "Network Error" or "Failed to Fetch"

**Symptom:** API calls fail immediately

**Solution:**
1. Check if backend is actually running (visit `/health` endpoint)
2. Verify `VITE_API_URL` in Vercel environment variables
3. Check if free tier Render service is spinning up (first request takes time)
4. Verify MONGODB_URI is correct

### Issue: "jwt malformed" or Authentication Errors

**Symptom:** Login/register works but subsequent requests fail

**Solution:**
1. Check `JWT_SECRET` is set in Render
2. Verify cookies are being sent (Network tab → Request Headers → Cookie)
3. Ensure `sameSite: 'none'` and `secure: true` for cross-domain cookies in production
4. Check if browser is blocking third-party cookies

### Issue: Transactions Fail

**Symptom:** Hiring returns 500 error about transactions

**Solution:**
1. Verify MongoDB Atlas connection string is correct
2. Atlas clusters have replica sets enabled by default
3. Check if using standalone MongoDB (won't work - need Atlas or replica set)

### Issue: Render Service Keeps Restarting

**Symptom:** Backend crashes and restarts repeatedly

**Solution:**
1. Check logs in Render dashboard for error messages
2. Verify `MONGODB_URI` is correct and database is accessible
3. Check Node.js version compatibility
4. Ensure all required environment variables are set

### Issue: Vercel Build Fails

**Symptom:** Deployment fails during build

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `npm run build` works locally
3. Check for missing dependencies
4. Ensure `Root Directory` is set to `frontend`
5. Verify Node.js version compatibility

---

## 📊 Monitoring & Maintenance

### Render (Backend)

- **Free tier limitations:**
  - 750 hours/month free compute
  - Service spins down after 15 min inactivity
  - 30-60 second cold start time
  
- **Monitoring:**
  - Check logs regularly
  - Set up health checks
  - Monitor response times

### Vercel (Frontend)

- **Free tier limitations:**
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  
- **Monitoring:**
  - Check analytics in dashboard
  - Monitor Core Web Vitals
  - Review error logs

### MongoDB Atlas

- **Free tier limitations:**
  - 512 MB storage
  - Shared RAM
  - Monitor usage in Atlas dashboard
  
- **Maintenance:**
  - Regular backups (manual on free tier)
  - Monitor storage usage
  - Review slow queries

---

## 🚀 Scaling to Production

When ready to move beyond free tiers:

### Backend (Render)

1. Upgrade to **Starter plan** ($7/month):
   - No cold starts
   - 512 MB RAM
   - Always-on service

2. Add environment-specific configs
3. Set up custom domain
4. Enable auto-scaling

### Frontend (Vercel)

1. Add custom domain
2. Upgrade to **Pro plan** if needed ($20/month):
   - More bandwidth
   - Advanced analytics
   - Password protection

### Database (MongoDB Atlas)

1. Upgrade to **M10 cluster** (~$57/month):
   - 2 GB RAM
   - 10 GB storage
   - Automatic backups
   - Better performance

---

## 📝 Environment Variables Summary

### Backend (Render)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gigflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-min-32-chars
JWT_EXPIRES_IN=7d
COOKIE_MAX_AGE=604800000
CORS_ORIGIN=https://gigflow-frontend.vercel.app
```

### Frontend (Vercel)

```env
VITE_API_URL=https://gigflow-backend.onrender.com
```

---

## 🎯 Post-Deployment Steps

1. **Update README.md** with live URLs
2. **Test all features** in production
3. **Set up monitoring** (optional: Sentry, LogRocket)
4. **Share with users** 🎉
5. **Monitor logs** for first few days
6. **Gather feedback** and iterate

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Express in Production](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs carefully
3. Test API endpoints directly with curl/Postman
4. Verify all environment variables are set correctly
5. Check if services are running (visit health endpoints)

---

**Congratulations!** 🎉 Your GigFlow application is now live and accessible to the world!

**Frontend:** `https://gigflow-frontend.vercel.app`
**Backend:** `https://gigflow-backend.onrender.com`
