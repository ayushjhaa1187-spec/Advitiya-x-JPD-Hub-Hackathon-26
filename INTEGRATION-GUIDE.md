# Full-Stack Integration Guide

## Overview

This guide explains how the backend, frontend, and database components of the Link Hub Management System are integrated together.

## Project Architecture

```
Advitiya-x-JPD-Hub-Hackathon-26/
├── backend/              # Node.js + Express API Server
│   ├── src/
│   │   ├── config/       # Database & environment configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Authentication, error handling
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   ├── package.json      # Dependencies
│   └── Dockerfile        # Docker configuration
│
├── frontend/             # React.js Application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client functions (api.js)
│   │   └── utils/        # Helper functions
│   ├── package.json      # Dependencies
│   └── Dockerfile        # Docker configuration
│
├── docker-compose.yml    # Full-stack orchestration
├── INTEGRATION-GUIDE.md  # This file
└── .env                  # Environment variables
```

## Components

### 1. Backend (Node.js + Express)
- **Port**: 5000
- **Database**: MongoDB
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Key Endpoints**:
  - `POST /api/users/register` - User registration
  - `POST /api/users/login` - User authentication
  - `GET /api/links` - Fetch all links
  - `POST /api/links` - Create new link
  - `PUT /api/links/:id` - Update link
  - `DELETE /api/links/:id` - Delete link

### 2. Frontend (React.js)
- **Port**: 3000
- **Framework**: React.js with Vite
- **API Communication**: Axios (api.js)
- **State Management**: React Context/Hooks
- **Key Features**:
  - User authentication UI
  - Link management dashboard
  - Smart rule configuration
  - Link organization and filtering

### 3. Database (MongoDB)
- **Port**: 27017
- **Collections**:
  - `users` - User accounts and authentication
  - `links` - Link records with metadata
  - `rules` - Smart rules for link organization
  - `analytics` - Click tracking and insights

## Quick Start with Docker

### Prerequisites
- Docker installed and running
- Docker Compose installed
- Git installed

### Steps to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
   cd Advitiya-x-JPD-Hub-Hackathon-26
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Docker Compose Services

- **mongodb**: Database service
- **backend**: API server
- **frontend**: React application
- **nginx**: Reverse proxy (optional)

## API Integration

### Backend to Frontend Communication

The frontend communicates with the backend through the `api.js` file:

```javascript
// frontend/src/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});
```

### Authentication Flow

1. User registers/logs in via frontend
2. Backend validates credentials against MongoDB
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in subsequent API requests
6. Backend validates token via JWT middleware

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
NODE_ENV=development
MONGODB_URI=mongodb://root:password123@mongodb:27017/linkhub?authSource=admin
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Links Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  url: String,
  category: String,
  tags: [String],
  rules: [ObjectId],
  clicks: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Development Workflow

### 1. Backend Development
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Connection
- Ensure MongoDB is running
- Update `MONGODB_URI` in environment variables

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker ps`
- Check MongoDB URI in .env file
- Verify authentication credentials

### Frontend API Connection Issues
- Check if backend is running on port 5000
- Verify `REACT_APP_API_URL` in .env
- Check CORS settings in backend

### Port Conflicts
- Change port mappings in docker-compose.yml
- Update environment variables accordingly

## Deployment

### Production Deployment

1. **Update environment variables**
   - Set `NODE_ENV=production`
   - Use secure JWT_SECRET
   - Configure correct CORS_ORIGIN

2. **Build Docker images**
   ```bash
   docker-compose build
   ```

3. **Push to registry** (Optional)
   ```bash
   docker tag linkhub-backend:latest your-registry/linkhub-backend:latest
   docker push your-registry/linkhub-backend:latest
   ```

4. **Deploy to server**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## Monitoring and Logging

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Health Checks
- Backend: `GET http://localhost:5000/api/health`
- MongoDB: Built-in health check in docker-compose.yml

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Create a pull request with detailed description

## Support

For issues and questions, please create an issue on GitHub or contact the team.
