# 🚀 RENDER BACKEND DEPLOYMENT GUIDE

## Complete Step-by-Step Guide to Deploy Your Backend on Render

Your backend is ready to be deployed! This guide will take you through the entire process.

---

## ✅ WHAT YOU'LL HAVE AFTER DEPLOYMENT

✓ **Working Backend API** running on Render
✓ **PostgreSQL Database** connected and running
✓ **User Authentication** working (Login/Register)
✓ **Link Management API** fully functional
✓ **Analytics API** tracking link clicks
✓ **Frontend connected** to working backend
✓ **Real Data** persisting in database
✓ **Dashboard showing real stats** (not 0, 0, 0)
✓ **Add Link functionality** actually saves links
✓ **Rules Engine** fully operational

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### You Have:
- ✅ GitHub repository with backend code
- ✅ `backend/src/index.js` - Express server
- ✅ `backend/package.json` - Dependencies
- ✅ `backend/schema.sql` - Database schema
- ✅ `.env.example` - Environment variables template

### You Need:
- ❌ Render account (Free tier available)
- ❌ Database service on Render
- ❌ Backend deployed
- ❌ Frontend API URL updated

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### STEP 1: Create Render Account (2 minutes)

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub

**Why GitHub auth?** Easier to deploy directly from your repo

---

### STEP 2: Create PostgreSQL Database on Render (5 minutes)

1. From Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in details:
   - **Name**: `advitiya-db`
   - **Database**: `advitiya_db`
   - **User**: `advitiya_user`
   - **Region**: Choose closest to you (e.g., Singapore for India)
   - **Plan**: Free (0 credits/month)
3. Click **"Create Database"**
4. Wait 2-3 minutes for it to be created
5. **COPY the Internal Connection String** - You'll need this!

**Example**: `postgresql://advitiya_user:password@localhost:5432/advitiya_db`

---

### STEP 3: Initialize Database Schema

1. In your Render dashboard, go to the database you just created
2. Click **"Connect"** → **"psql"**
3. Copy the connection command and paste in terminal
4. Once connected, run:
   ```sql
   -- Copy-paste the entire content from backend/schema.sql
   ```
5. Verify tables created:
   ```sql
   \dt
   ```

---

### STEP 4: Create Backend Web Service on Render (10 minutes)

1. From Render dashboard, click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**:
   - Select your GitHub account
   - Choose `Advitiya-x-JPD-Hub-Hackathon-26` repository
   - Click **"Connect"**

3. **Configure the service**:
   - **Name**: `advitiya-backend` (or any name)
   - **Environment**: `Node`
   - **Region**: Same as database
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   
4. **Add Environment Variables** (CRITICAL!):
   Click **"Environment"** and add:
   ```
   DATABASE_URL = postgresql://advitiya_user:password@dpg-xxx.render.internal:5432/advitiya_db
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = your-super-secret-key-here-min-32-chars
   API_BASE_URL = https://advitiya-backend.onrender.com
   ```

5. **Choose Plan**: Select Free tier

6. Click **"Create Web Service"**

**Wait 5-10 minutes** for deployment to complete

---

### STEP 5: Verify Backend is Running

1. Go to your Render dashboard
2. Click on `advitiya-backend` service
3. Check **"Logs"** tab - should show:
   ```
   Server running on port 10000
   Database connected successfully
   ```

4. Test the API:
   ```bash
   # Get your deployed URL from Render dashboard (e.g., https://advitiya-backend.onrender.com)
   curl https://advitiya-backend.onrender.com/api/health
   ```
   Should return: `{"status": "healthy"}`

---

### STEP 6: Update Frontend to Use New Backend URL

1. Go to your GitHub repo
2. Edit `frontend/api-service.js` OR `frontend/dashboard.js`
3. Change API URL from `http://localhost:5000` to:
   ```javascript
   const API_BASE_URL = "https://advitiya-backend.onrender.com/api";
   ```
4. Commit and push changes

**GitHub Pages will automatically update within 1 minute**

---

## 🧪 TESTING YOUR DEPLOYMENT

### Test 1: Health Check
```bash
curl https://advitiya-backend.onrender.com/api/health
# Should return: {"status": "healthy"}
```

### Test 2: Create User (Register)
```bash
curl -X POST https://advitiya-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Test 3: Login
```bash
curl -X POST https://advitiya-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Should return JWT token
```

### Test 4: Create Link
```bash
curl -X POST https://advitiya-backend.onrender.com/api/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "title": "Google"}'
```

### Test 5: Get Links
```bash
curl https://advitiya-backend.onrender.com/api/links \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 YOUR FRONTEND NOW WORKS!

Once backend is running and URL is updated:

✅ **Dashboard page**:
- Login button works
- After login, stats show REAL data (not 0, 0, 0)
- Add Link button saves to database
- Links table shows actual links

✅ **Analytics page**:
- Shows real click data
- Charts display actual stats
- Export functionality works

✅ **Add Link form**:
- Links are saved in database
- Persists across page reloads
- Rules can be applied

✅ **Public page**:
- Generated with actual links
- QR code shows
- Analytics tracked

---

## 🆘 TROUBLESHOOTING

### Problem: "Database connection failed"
**Solution**: Check DATABASE_URL in environment variables. Must match Render's internal connection string.

### Problem: "502 Bad Gateway"
**Solution**: Backend crashed. Check logs in Render dashboard. Usually missing environment variables.

### Problem: "CORS error"
**Solution**: Backend CORS not configured. Update backend to allow GitHub Pages domain:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://ayushjhaa1187-spec.github.io'
}));
```

### Problem: Frontend still shows 0 values
**Solution**: Hard refresh browser (Ctrl+Shift+R). GitHub Pages may cache old JS.

---

## 📊 EXPECTED RESULTS

After successful deployment:

```
✅ Backend running: https://advitiya-backend.onrender.com
✅ Database connected: PostgreSQL on Render
✅ Frontend URL: https://ayushjhaa1187-spec.github.io/...
✅ API calls working
✅ Data persisting
✅ Login/Register functional
✅ Analytics tracking
✅ Dashboard showing real stats
✅ Rules engine operational
✅ Public pages generated
```

---

## 📝 SUBMISSION READY

Once everything is working:

1. **GitHub Repository**: https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26
2. **Live Frontend**: https://ayushjhaa1187-spec.github.io/...
3. **Live Backend**: https://advitiya-backend.onrender.com
4. **Database**: PostgreSQL on Render
5. **All features working**: Login, Links, Analytics, Rules

You're ready to submit to the hackathon! 🎉
