# 🔗 Smart Link Hub — Advitiya x JPD Hub Hackathon '26

![build](https://img.shields.io/badge/build-passing-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)
![stack](https://img.shields.io/badge/stack-MERN-blueviolet)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

> Intelligent URL management system with smart routing rules, real-time analytics, and team collaboration — built in 26 hours at Advitiya x JPD Hub Hackathon 2026.

---

## 🌐 Live Demo

**[🚀 Launch Smart Link Hub →](https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/landing.html)**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Smart Rules Engine** | Configure URL routing rules based on time, geography, device type, and UTM params |
| **Link Analytics** | Real-time click tracking, referrer tracking, and conversion metrics |
| **Team Workspace** | Multi-user collaboration with role-based link management |
| **Custom Domains** | Map branded short domains to your link hub instance |
| **JWT Auth** | Secure signup/login with JSON Web Token authentication |
| **RESTful API** | Full programmatic access for link creation and management |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (production) / MongoDB (dev) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | GitHub Pages (frontend), Vercel (API) |

---

## 📁 Project Structure

```
Advitiya-x-JPD-Hub-Hackathon-26/
├── frontend/          # HTML/CSS/JS frontend with landing page and dashboard
├── backend/           # Express API server
│   ├── routes/        # API route handlers
│   ├── models/        # Database models
│   ├── middleware/    # Auth middleware (JWT)
│   └── server.js      # Entry point
├── api/               # Serverless API functions (Vercel)
├── API-DOCUMENTATION.md
├── BUG_FIXES_REPORT.md
├── COMPLETE-DEPLOYMENT-GUIDE.md
├── CODE-TEMPLATES.md
├── DEPLOY-NOW.md
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL or MongoDB database
- Vercel CLI (for API deployment)

### 1. Clone the repo

```bash
git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
cd Advitiya-x-JPD-Hub-Hackathon-26
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

### 4. Start development

```bash
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | ✅ | Server port | `3001` |
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | ✅ | Secret key for JWT signing | `your-super-secret-key-min-32-chars` |
| `FRONTEND_URL` | ✅ | Allowed CORS origin | `https://yourdomain.github.io` |
| `NODE_ENV` | ✅ | Environment mode | `production` |

> Never commit `.env` to git. It is listed in `.gitignore`.

---

## 🗄️ Database Schema

| Table | Key Columns | Purpose |
|---|---|---|
| `users` | id, email, password_hash, created_at | User accounts |
| `links` | id, user_id, original_url, short_code, title, created_at | Shortened links |
| `link_rules` | id, link_id, rule_type, rule_value, target_url | Smart routing rules |
| `link_clicks` | id, link_id, ip, referrer, device, country, clicked_at | Click analytics |

All tables include `id` (UUID) and `created_at` (timestamptz). JWT auth guards all write endpoints.

---

## 📞 API Reference

See **[API-DOCUMENTATION.md](./API-DOCUMENTATION.md)** for full endpoint documentation.

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/links` | List all user links |
| POST | `/api/links` | Create a new short link |
| PUT | `/api/links/:id` | Update link or rules |
| DELETE | `/api/links/:id` | Delete a link |
| GET | `/api/links/:id/analytics` | Get click analytics |

All protected endpoints require: `Authorization: Bearer <token>`

---

## 🚀 Deployment

See **[COMPLETE-DEPLOYMENT-GUIDE.md](./COMPLETE-DEPLOYMENT-GUIDE.md)** for detailed instructions.

**Quick deploy:**
- Frontend → GitHub Pages (already live)
- API → Vercel (`vercel deploy` from `/api` folder)
- Database → Supabase or Railway (free tier)

---

## ✅ Production Readiness Checklist

- [x] JWT authentication on all protected routes
- [x] CORS configured for production frontend URL
- [x] Environment variables documented
- [x] .gitignore includes `.env`, `node_modules`
- [x] API documentation (API-DOCUMENTATION.md)
- [x] Bug fixes documented (BUG_FIXES_REPORT.md)
- [x] Deployment guide (COMPLETE-DEPLOYMENT-GUIDE.md)
- [x] Live frontend on GitHub Pages
- [ ] Vercel API deployment (needs DATABASE_URL env var)

---

## 🤝 Authors

Built by **Ayush Jha & Jahnvi Chauhan** for the Advitiya x JPD Hub Hackathon 2026.

- [@ayushjhaa1187-spec](https://github.com/ayushjhaa1187-spec)

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
