# 🚀 GigFlow Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] `.env` file is NOT committed (check `.gitignore`)
- [ ] All features tested locally
- [ ] Backend runs without errors: `npm run dev`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Database connection works locally

## MongoDB Atlas Setup

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0 allowed)
- [ ] Connection string obtained and saved
- [ ] Database name added to connection string

## Backend Deployment (Render)

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Web service created
- [ ] Build command set: `npm install`
- [ ] Start command set: `npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (from MongoDB Atlas)
  - [ ] `JWT_SECRET` (generated/random string)
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `COOKIE_MAX_AGE=604800000`
  - [ ] `CORS_ORIGIN` (will update after frontend deployment)
- [ ] Service deployed successfully
- [ ] Backend URL saved: `_______________________`
- [ ] Health check works: `https://your-backend.onrender.com/health`

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project created/imported
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable configured:
  - [ ] `VITE_API_URL` (backend URL from Render)
- [ ] Deployment successful
- [ ] Frontend URL saved: `_______________________`
- [ ] Frontend loads without errors

## Post-Deployment Configuration

- [ ] Updated `CORS_ORIGIN` in Render with frontend URL
- [ ] Render service redeployed with new CORS setting
- [ ] Tested CORS by making API call from frontend

## Testing

- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Create gig works
- [ ] View gigs works
- [ ] Search gigs works
- [ ] Place bid works
- [ ] View bids works (as gig owner)
- [ ] Hire freelancer works
- [ ] Real-time notification works (hire event)
- [ ] User session persists after refresh
- [ ] Cookie authentication works across domains

## Documentation

- [ ] README.md updated with live URLs
- [ ] DEPLOYMENT.md reviewed
- [ ] Environment variables documented
- [ ] Known issues documented (if any)

## Monitoring

- [ ] Render logs reviewed for errors
- [ ] Vercel deployment logs reviewed
- [ ] MongoDB Atlas metrics checked
- [ ] First few users tested the app

## Optional (Production)

- [ ] Custom domain added to Vercel
- [ ] Custom domain added to Render
- [ ] SSL certificates verified (auto with Vercel/Render)
- [ ] Error tracking setup (Sentry, LogRocket)
- [ ] Analytics setup (Google Analytics, Mixpanel)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

## Troubleshooting Reference

### Common Issues:

1. **CORS Error:** Check `CORS_ORIGIN` matches frontend URL exactly
2. **Cookie Not Set:** Verify `sameSite: 'none'` and `secure: true` in production
3. **API Not Found:** Check `VITE_API_URL` in Vercel env vars
4. **MongoDB Connection Failed:** Verify connection string and network access
5. **Build Failed:** Check Node version compatibility, review build logs
6. **Service Offline:** Free tier Render spins down after inactivity (30-60s cold start)

---

**URLs:**

- Frontend: https://________________________________
- Backend: https://________________________________
- MongoDB Atlas: https://cloud.mongodb.com

**Deployed on:** _______________
**Deployed by:** _______________

✅ **Deployment Complete!**
