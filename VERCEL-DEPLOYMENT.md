# Vercel Deployment Guide for Smart Link Hub

## Overview

This guide provides step-by-step instructions to deploy the Smart Link Hub application to Vercel, a serverless platform offering FREE tier with excellent performance and API support.

## Why Vercel?

✅ **Free Tier** - Generous free tier with no credit card required
✅ **Serverless API** - Express.js backend runs as serverless functions
✅ **Custom Domain** - Includes free *.vercel.app domain
✅ **Auto Scaling** - Handles traffic spikes automatically
✅ **Environment Variables** - Secure configuration management
✅ **GitHub Integration** - Automatic deployments on every push
✅ **Database Support** - Compatible with PostgreSQL, MongoDB, etc.
✅ **Edge Network** - Global CDN for fast content delivery

## Prerequisites

- GitHub account with repository push access
- Vercel account (free signup at https://vercel.com)
- Node.js 18+ installed locally
- Environment variables prepared (.env.example provided)

## Step 1: Prepare Your Repository

### Current Project Structure

```
Advitiya-x-JPD-Hub-Hackathon-26/
├── api/
│   └── index.js          # Vercel serverless handler
├── backend/
│   ├── src/
│   │   ├── app.js         # Express app
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Auth, CORS, etc.
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   └── src/
│       ├── api.js         # API client
│       └── dashboard.js
├── vercel.json            # Vercel config
├── .env.example           # Template
└── package.json
```

### Verify Essential Files

Ensure these files exist:

1. **vercel.json** - Already configured for routing
2. **api/index.js** - Serverless Express wrapper
3. **.env.example** - Environment variable template

## Step 2: Set Up Vercel Account

### Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up" (use GitHub for easy integration)
3. Authorize Vercel to access your GitHub repositories

### Install Vercel CLI (Optional)

```bash
npm install -g vercel
vercel login
```


## Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository:
   - Select **"Import Git Repository"**
   - Choose **"Advitiya-x-JPD-Hub-Hackathon-26"**
   - Click **"Import"**

4. Configure Project Settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. Add Environment Variables (click **"Environment Variables"**):
   ```
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=https://your-project.vercel.app
   ```

6. Click **"Deploy"**

### Method 2: Deploy via Vercel CLI

```bash
# Navigate to project directory
cd Advitiya-x-JPD-Hub-Hackathon-26

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? (press enter)
# - Directory? ./ (press enter)

# Deploy to production
vercel --prod
```

## Step 4: Configure Environment Variables

After deployment, add/update environment variables in Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Node
NODE_ENV=production
PORT=3000
```

3. Click **"Save"**
4. Redeploy for changes to take effect

## Step 5: Verify Deployment

### Check Deployment Status

1. View deployment logs in Vercel Dashboard
2. Check deployment URL: `https://your-project.vercel.app`

### Test API Endpoints

```bash
# Test health check
curl https://your-project.vercel.app/api/health

# Test links endpoint (requires auth)
curl https://your-project.vercel.app/api/links
```

### Frontend Testing

1. Open `https://your-project.vercel.app/frontend/index.html`
2. Test login functionality
3. Verify dashboard loads correctly
4. Test link creation and management

## Step 6: Troubleshooting Common Issues

### Issue 1: Build Fails

**Symptom**: Deployment fails during build

**Solution**:
```bash
# Check Node version compatibility
node --version  # Should be 18.x or higher

# Verify package.json dependencies
npm install
npm audit fix
```

### Issue 2: API Routes Not Working

**Symptom**: 404 errors on `/api/*` routes

**Solution**:
- Verify `vercel.json` is configured correctly
- Check that `api/index.js` exists
- Ensure Express app is exported properly

### Issue 3: CORS Errors

**Symptom**: Frontend can't access API

**Solution**:
```javascript
// Update CORS_ORIGIN environment variable
CORS_ORIGIN=https://your-actual-frontend-domain.vercel.app
```

### Issue 4: Database Connection Fails

**Symptom**: API works but database operations fail

**Solution**:
- Verify DATABASE_URL is set correctly
- Ensure database allows connections from Vercel IPs
- Check database provider firewall settings

## Important Notes

⚠️ **Free Tier Limitations**:
- Serverless function timeout: 10 seconds
- Max function size: 250MB
- Bandwidth: 100GB/month
- Build minutes: 6000 minutes/month

✅ **Best Practices**:
- Always use environment variables for sensitive data
- Never commit `.env` files to GitHub
- Monitor deployment logs regularly
- Set up custom domain for production

## Next Steps

1. **Set Up Database**: Deploy PostgreSQL on [Neon](https://neon.tech) or [Supabase](https://supabase.com) (free tiers available)
2. **Configure Custom Domain**: Add your domain in Vercel project settings
3. **Enable Analytics**: Activate Vercel Analytics for monitoring
4. **Set Up Monitoring**: Configure error tracking with [Sentry](https://sentry.io)
5. **Implement CI/CD**: Auto-deploy on git push (already enabled with GitHub integration)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)

## Support

For deployment issues:
- Check [Vercel Status](https://www.vercel-status.com/)
- Visit [Vercel Community](https://github.com/vercel/vercel/discussions)
- Contact repository maintainer

---

**Congratulations!** 🎉 Your Smart Link Hub is now deployed on Vercel with full backend API support!
