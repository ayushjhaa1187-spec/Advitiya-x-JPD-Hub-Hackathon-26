<div align="center">

# 🚀 Smart Link Hub

### Professional Link Management Platform for Advitiya x JPD Hub Hackathon 2026

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=vercel)](https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/landing.html)
[![GitHub](https://img.shields.io/badge/github-repository-blue?style=for-the-badge&logo=github)](https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26)
[![Commits](https://img.shields.io/github/commit-activity/t/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26?style=for-the-badge)](https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26/commits/main)

**Create, manage, and track smart links with advanced analytics. Free forever.**

[View Demo](https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/landing.html) • [Documentation](./QUICKSTART.md) • [Deploy Guide](./DEPLOY-NOW.md)

</div>

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| ⚡ **Lightning Fast** | Shorten links in milliseconds | ✅ |
| 📊 **Real-Time Analytics** | Track clicks, devices, locations | ✅ |
| 🔒 **Secure & Reliable** | Enterprise-grade security | ✅ |
| 📋 **QR Code Generation** | Auto-generate QR codes | ✅ |
| 🎯 **Custom Links** | Branded short links | ✅ |
| ♾️ **No Limits** | Unlimited links forever | ✅ |

## 🛠️ Tech Stack

```
Frontend:  HTML5, CSS3, JavaScript (Vanilla)
Backend:   Node.js, Express.js
Database:  PostgreSQL (Ready)
Deploy:    Vercel (Serverless)
API:       RESTful with JWT Auth
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
cd Advitiya-x-JPD-Hub-Hackathon-26
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Deploy to Vercel
```bash
# Visit https://vercel.com
# Import project from GitHub
# Add environment variables
# Click Deploy
```

**📚 Full deployment guide:** [DEPLOY-NOW.md](./DEPLOY-NOW.md)

### Alternative Deployment Platforms

> **GitHub Pages (Current - Recommended for Demo)**
> Live frontend: https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/landing.html
> Status: ✅ LIVE

> **Render (For Backend API)**
> Simple alternative to Vercel, free tier available
> 1. Go to render.com
> 2. Connect your GitHub account
> 3. Create new Web Service
> 4. Select backend folder
> 5. Deploy - Takes ~5 minutes

> **Railway.app**
> Another reliable alternative with PostgreSQL support

## 📝 Project Structure

```
.
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API handler
│   └── redirect.js        # Link redirect function
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database models
│   │   └── utils/        # Helper utilities
│   └── vercel.json       # Vercel configuration
└── frontend/               # Static assets
    ├── landing.html      # Landing page
    ├── index.html        # Dashboard
    └── api-service.js    # API integration layer
```

## 📊 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Links Management
- `GET /api/links` - Get all user links
- `POST /api/links` - Create short link
- `GET /api/links/:id` - Get specific link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/link/:shortCode` - Link analytics
- `GET /api/analytics/clicks/:shortCode` - Click history

### Redirect
- `GET /api/redirect?shortCode=abc123` - Redirect to original URL

## 🏆 Hackathon Submission

**Event:** Advitiya x JPD Hub Hackathon 2026  
**Problem Statement:** Develop a smart link web application  
**Team:** Solo Project  
**Repository:** [GitHub Link](https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26)

### Compliance Checklist
- [x] Smart link web application
- [x] Full-stack implementation
- [x] Cloud deployment configuration
- [x] Professional UI/UX design
- [x] Comprehensive documentation
- [x] API integration
- [x] Analytics tracking
- [x] QR code generation
- [x] Responsive design

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide with detailed setup
- **[DEPLOY-NOW.md](./DEPLOY-NOW.md)** - Complete deployment guide
- **[API-DOCUMENTATION.md](./API-DOCUMENTATION.md)** - API reference
- **[FEATURES.md](./FEATURES.md)** - Feature documentation
- **[ENHANCEMENT-ROADMAP.md](./ENHANCEMENT-ROADMAP.md)** - Future roadmap

## 🔧 Development

### Run Locally
```bash
# Backend
cd backend
npm run dev

# Frontend (serve static files)
python -m http.server 8000
# or
npx serve frontend
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-domain.com
```

## ✅ Testing

### Frontend Testing
- ✅ Landing page renders correctly
- ✅ Link shortening form functional
- ✅ Navigation links work
- ✅ Responsive design verified

### Backend Testing  
- ✅ API endpoints respond correctly
- ✅ Mock authentication works
- ✅ Redirect function operational
- ✅ Error handling implemented

## 👥 Contributing

This is a hackathon submission project. Contributions, issues, and feature requests are welcome after the hackathon!

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 📧 Contact

**Developer:** Ayush Kumar Jha  
**GitHub:** [@ayushjhaa1187-spec](https://github.com/ayushjhaa1187-spec)  
**Project Link:** [Smart Link Hub](https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26)

---

<div align="center">

**Made with ❤️ for Advitiya x JPD Hub Hackathon 2026**

⭐ Star this repo if you find it helpful!

</div>
