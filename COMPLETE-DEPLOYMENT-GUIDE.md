# 🚀 Complete Deployment Guide - Final Steps

## Status: Backend Deployed to Vercel ✅

**Vercel Project**: `advitiya-x-jpd-hub-hackathon-26`  
**URL**: https://advitiya-x-jpd-hub-hackathon-26.vercel.app

---

## ✅ What's Already Done

1. ✅ **Vercel Project Created** - Backend is configured and ready
2. ✅ **GitHub Repository Connected** - Auto-deployment enabled
3. ✅ **Serverless Functions Configured** - API routes under `/api/*`
4. ✅ **Frontend Deployed on GitHub Pages** - Static site live

---

## 🔴 Incomplete Tasks - Action Required

### Task 1: Set Up Free PostgreSQL Database (5 minutes)

**Option A: Neon.tech (Recommended)**

1. Visit https://neon.tech
2. Click "Sign up" and use GitHub to sign in
3. Create a new project:
   - Name: `smart-link-hub`
   - Region: Select closest to you
   - Postgres version: 15 (default)
4. Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb
   ```

**Option B: Supabase**

1. Visit https://supabase.com
2. Create account and new project
3. Go to Settings → Database
4. Copy connection string from "Connection string" section

**Option C: Vercel Postgres (Easiest)**

1. Go to your Vercel project: https://vercel.com/ethicallancings-projects/advitiya-x-jpd-hub-hackathon-26
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Follow wizard (uses Neon under the hood)
5. Connection string auto-added to environment variables

---

### Task 2: Add Environment Variables to Vercel (3 minutes)

1. Go to: https://vercel.com/ethicallancings-projects/advitiya-x-jpd-hub-hackathon-26/settings/environment-variables

2. Add these variables:

   **DATABASE_URL**
   ```
   postgresql://username:password@host/database
   ```
   (Use the connection string from Task 1)

   **JWT_SECRET**
   ```
   your-super-secret-jwt-key-change-this-123456789
   ```
   (Generate a random string)

   **NODE_ENV**
   ```
   production
   ```

   **CORS_ORIGIN**
   ```
   https://ayushjhaa1187-spec.github.io
   ```

3. Click "Save" for each variable

---

### Task 3: Initialize Database Schema (2 minutes)

Once Vercel deploys, run the database initialization:

**Option A: Use API endpoint (easiest)**
1. Wait for Vercel deployment to complete
2. Visit: `https://advitiya-x-jpd-hub-hackathon-26.vercel.app/api/init-db`
3. This will create all required tables

**Option B: Manual SQL**
1. Connect to your database using provided SQL editor
2. Run the schema from `backend/schema.sql`

---

### Task 4: Update Frontend API Configuration (2 minutes)

1. Edit `frontend/js/config.js` (or wherever API_BASE_URL is defined)

2. Change from:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

3. To:
   ```javascript
   const API_BASE_URL = 'https://advitiya-x-jpd-hub-hackathon-26.vercel.app/api';
   ```

4. Commit and push changes:
   ```bash
   git add .
   git commit -m "fix: Update API_BASE_URL to Vercel production endpoint"
   git push
   ```

---

### Task 5: Trigger Vercel Deployment (1 minute)

1. Go to: https://vercel.com/ethicallancings-projects/advitiya-x-jpd-hub-hackathon-26
2. Click "Deployments" tab
3. Click the three dots on latest deployment → "Redeploy"
4. Wait 2-3 minutes for deployment to complete

---

### Task 6: Test the Complete System (5 minutes)

**Test Backend API:**

1. Health check:
   ```
   https://advitiya-x-jpd-hub-hackathon-26.vercel.app/api/health
   ```
   Should return: `{"status":"ok"}`

2. User registration:
   ```bash
   curl -X POST https://advitiya-x-jpd-hub-hackathon-26.vercel.app/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   ```

3. Create short link:
   ```bash
   curl -X POST https://advitiya-x-jpd-hub-hackathon-26.vercel.app/api/links \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"originalUrl":"https://example.com","customAlias":"test"}'
   ```

**Test Frontend:**

1. Visit: https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/landing.html
2. Try to create a short link
3. Check if it connects to backend
4. Verify QR code generation
5. Test analytics dashboard

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         GitHub Pages (Frontend)                 │
│  https://ayushjhaa1187-spec.github.io/...      │
│  - Static HTML/CSS/JS                          │
│  - Landing page, dashboard, analytics          │
└──────────────────┬──────────────────────────────┘
                   │ API Calls
                   ▼
┌─────────────────────────────────────────────────┐
│          Vercel (Backend API)                   │
│  https://advitiya-x-jpd-hub-hackathon-26...    │
│  - Serverless Functions (Node.js)              │
│  - Express.js API routes                       │
│  - JWT authentication                          │
└──────────────────┬──────────────────────────────┘
                   │ Database Queries
                   ▼
┌─────────────────────────────────────────────────┐
│       Neon/Supabase (PostgreSQL)                │
│  - User data                                    │
│  - Short links                                  │
│  - Analytics data                               │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Quick Checklist

- [ ] Database created (Neon/Supabase/Vercel Postgres)
- [ ] Environment variables added to Vercel
- [ ] Database schema initialized
- [ ] Frontend API_BASE_URL updated
- [ ] Vercel redeployed with env vars
- [ ] Backend health check working
- [ ] User registration tested
- [ ] Link creation tested
- [ ] Frontend connects to backend
- [ ] QR codes generate correctly
- [ ] Analytics dashboard functional

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL environment variable in Vercel settings

### Issue: "CORS error" in browser console
**Solution**: Verify CORS_ORIGIN matches your GitHub Pages URL exactly

### Issue: "JWT token invalid"
**Solution**: Check JWT_SECRET is set in environment variables

### Issue: API returns 500 error
**Solution**: 
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure database schema is initialized

### Issue: Frontend doesn't connect to backend
**Solution**: 
1. Open browser console (F12)
2. Check network tab for failed requests
3. Verify API_BASE_URL in frontend code
4. Ensure no mixed content warnings (HTTP vs HTTPS)

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs/introduction
- **Supabase Docs**: https://supabase.com/docs
- **Project README**: [README.md](./README.md)
- **API Documentation**: [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

---

## 🎉 Once Complete

Your full-stack Smart Link Hub will be:
- ✅ Frontend live on GitHub Pages
- ✅ Backend API running on Vercel serverless
- ✅ Database hosted on Neon/Supabase
- ✅ **100% FREE HOSTING** for all components
- ✅ Auto-scaling and globally distributed
- ✅ Production-ready for hackathon submission

---

**Estimated Total Time**: 15-20 minutes

**Last Updated**: January 27, 2026, 8:00 AM IST
