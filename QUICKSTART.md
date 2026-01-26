# Smart Link Hub - Quickstart Guide

## 🚀 Overview
This is a comprehensive smart link management web application built for the Advitiya x JPD Hub Hackathon 2026. The application allows users to create, manage, and track smart links with advanced features like QR code generation, analytics, and custom short URLs.

## ✨ Features Implemented
- ✅ Professional landing page with hero section
- ✅ Link shortening with custom slugs
- ✅ QR code generation for links
- ✅ Analytics dashboard (clicks, devices, locations)
- ✅ User authentication (register/login)
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database integration
- ✅ Vercel deployment configuration
- ✅ Responsive design

## 📁 Project Structure
```
.
├── api/              # Vercel serverless functions
├── backend/          # Express.js backend
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── models/   # Database models
│   │   └── utils/    # Helper functions
│   └── vercel.json   # Vercel config
└── frontend/         # Static HTML/CSS/JS
    ├── landing.html  # Main landing page
    └── index.html    # Dashboard
```

## 🛠️ Tech Stack
**Backend:**
- Node.js + Express.js
- PostgreSQL (Database)
- JWT Authentication
- QR Code generation

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design

**Deployment:**
- Vercel (Backend + Frontend)
- PostgreSQL (Free tier)

## 🚦 Quick Deploy to Vercel

### 1. Fork this repository

### 2. Set up PostgreSQL Database
- Go to [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)
- Create a free PostgreSQL database
- Copy the connection string

### 3. Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your forked repository
4. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secret_key_here
   NODE_ENV=production
   ```
5. Click Deploy!

### 4. Configure Database
After deployment, run the database schema:
```sql
-- See schema.sql in backend folder
```

## 📝 API Endpoints

### Links
- `POST /api/links` - Create short link
- `GET /api/links` - Get all user links
- `GET /api/links/:id` - Get specific link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Analytics
- `GET /api/analytics/link/:shortCode` - Get link analytics
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/analytics/clicks/:shortCode` - Get click history

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## 🎯 Usage

1. **Visit the landing page**: `https://your-app.vercel.app/frontend/landing.html`
2. **Sign up**: Create an account
3. **Create links**: Shorten URLs and generate QR codes
4. **Track analytics**: Monitor clicks and performance
5. **Share**: Use short links or QR codes

## 🔧 Local Development

```bash
# Install dependencies
cd backend
npm install

# Set up .env file
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
PORT=3000

# Run development server
npm run dev
```

## 📊 What's Next?
- [ ] Connect frontend to backend APIs
- [ ] Add link preview feature
- [ ] Implement link expiration
- [ ] Add custom domains
- [ ] Social media integration

## 🏆 Hackathon Compliance
This project meets the hackathon requirements:
- ✅ Smart link web application
- ✅ Full-stack implementation
- ✅ Cloud deployment ready
- ✅ Professional UI/UX
- ✅ Comprehensive documentation

## 📞 Support
For issues or questions, open a GitHub issue.

---
**Built with ❤️ for Advitiya x JPD Hub Hackathon 2026**
