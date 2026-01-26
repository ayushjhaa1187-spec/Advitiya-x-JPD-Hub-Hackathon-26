# Advitiya x JPD Hub Hackathon 2026

## 🚀 Smart Link Hub Generator - Intelligent Link Routing System

**A production-ready full-stack platform for managing dynamic link hubs with advanced rule-based organization and real-time analytics.**

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Smart Rules Engine](#-smart-rules-engine)
- [Analytics Dashboard](#-analytics-dashboard)
- [API Documentation](#-api-documentation)
- [Tech Stack](#-tech-stack)
- [Development Roadmap](#-development-roadmap)
- [Contributors](#-contributors)

---

## 🎯 Project Overview

This project is a comprehensive solution developed for the **Advitiya x JPD Hub Hackathon 2026**. It allows users to create personalized link hubs (similar to Linktree) but with "Smart" capabilities—dynamically showing or hiding content based on the visitor's device, location, time, and the performance of the links themselves.

---

## ✨ Key Features

- **🔐 Secure Authentication**: JWT-based login and registration with Bcrypt hashing.
- **🎨 Modern UI/UX**: Professional **Black & Neon Green** theme optimized for developers and high-end brands.
- **🧠 Smart Rules Engine**: 
    - **Device-based**: Show different links to mobile vs desktop users.
    - **Time-based**: Schedule links for specific hours or days (e.g., flash sales).
    - **Location-based**: Target specific countries or regions.
    - **Performance-based**: Automatically highlight top-performing links or hide underperforming ones.
- **📊 Advanced Analytics**: Real-time tracking of visits, clicks, and conversion rates with interactive charts.
- **📱 Responsive Design**: Fully optimized for mobile, tablet, and desktop viewports.
- **⚡ Performance Optimized**: Fast page loads with caching and fire-and-forget analytics tracking.

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- Git

### Installation (2-Hour Setup)

1. **Clone & Setup**
   ```bash
   git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
   cd Advitiya-x-JPD-Hub-Hackathon-26
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   psql -U postgres -d your_db < schema.sql
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   # Serving via live-server or any static host
   # Or visit the live demo: https://ayushjhaa1187-spec.github.io/Advitiya-x-JPD-Hub-Hackathon-26/frontend/
   ```

---

## 🧠 Smart Rules Engine

The core innovation of this platform is the **Rule Engine**, which evaluates conditions on every request:

| Rule Type | Description | Use Case |
|-----------|-------------|----------|
| **Device** | Filter by Mobile, Tablet, Desktop | App download links only on mobile. |
| **Time** | Specific hours/days/ranges | Show a "Live Now" link during webinar hours. |
| **Location** | Country/Region targeting | Regional shipping info for specific users. |
| **Performance**| Top/Bottom % based on clicks | Automatically promote popular content. |

---

## 📊 Analytics Dashboard

Get deep insights into your audience engagement:
- **Total Visits & Clicks**: Real-time event tracking.
- **Conversion Rate (CTR)**: Automatically calculated metrics.
- **Device Breakdown**: Pie charts showing user distribution.
- **Trends**: Line charts for traffic over time using **Recharts**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js + Express.js (or FastAPI implementation).
- **Database**: PostgreSQL with SQLAlchemy/Sequelize.
- **Authentication**: NextAuth.js / JWT.
- **Deployment**: Vercel (Frontend), Railway/Render (Backend).

---

## 🤝 Contributors

- **Ayush Kumar Jha** ([@ayushjhaa1187-spec](https://github.com/ayushjhaa1187-spec)) - Lead Developer
- **Jahnvi Chauhan** ([@jahnviChauhan](https://github.com/jahnviChauhan)) - Frontend/Design

---

**Built with ❤️ for Advitiya x JPD Hub Hackathon 2026**
