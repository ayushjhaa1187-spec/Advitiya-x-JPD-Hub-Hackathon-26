# Backend - Link Hub Management System with Smart Rules

## Overview
This is a Node.js backend API for a Link Hub Management Platform with intelligent rule-based link display system, built for the Advitiya x JPD Hub Hackathon 2026.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS
- **Validation**: Express Validator
- **Logging**: Winston

## Core Features
- **Hub Management**: Create, update, and manage link hubs with unique slugs
- **Smart Link Rules**: Device, time, location, and performance-based link visibility
- **Rule Engine**: AND/OR logic for combining multiple rules
- **Analytics**: Fire-and-forget click tracking with performance insights
- **Public Pages**: Dynamic slug-based hub pages with rule evaluation

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js       # Environment variables
│   │   └── database.js  # Database connection
│   ├── controllers/     # Request handlers
│   │   ├── userController.js
│   │   ├── hubController.js
│   │   ├── linkController.js
│   │   └── analyticsController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Hub.js
│   │   ├── Link.js
│   │   └── Analytics.js
│   ├── routes/          # API routes
│   │   ├── users.js
│   │   ├── hubs.js
│   │   ├── links.js
│   │   └── analytics.js
│   ├── services/        # Business logic
│   │   ├── userService.js
│   │   ├── hubService.js
│   │   ├── ruleEngine.js
│   │   └── analyticsService.js
│   ├── utils/           # Utility functions
│   │   ├── apiResponse.js
│   │   ├── helpers.js
│   │   └── logger.js
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
└── README.md           # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps
1. Clone the repository
```bash
git clone https://github.com/ayushjhaa1187-spec/Advitiya-x-JPD-Hub-Hackathon-26.git
cd Advitiya-x-JPD-Hub-Hackathon-26/backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your configuration:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `NODE_ENV`: Environment (development/production)

4. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server health status.

#### Authentication
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
```

#### Hub Management
```http
GET    /api/hubs             # Get all user hubs
GET    /api/hubs/:slug       # Get hub by slug (public)
POST   /api/hubs             # Create new hub
PUT    /api/hubs/:id         # Update hub
DELETE /api/hubs/:id         # Delete hub
```

#### Link Management
```http
GET    /api/links            # Get all links for a hub
GET    /api/links/:id        # Get link by ID
POST   /api/links            # Create new link
PUT    /api/links/:id        # Update link
DELETE /api/links/:id        # Delete link
```

#### Analytics
```http
POST   /api/analytics/track  # Track link click (fire-and-forget)
GET    /api/analytics/hub/:id # Get hub analytics
```

## Rule Engine

The Rule Engine supports multiple rule types with AND/OR logic:

### Rule Types
1. **Device Rules**: Show/hide links based on device type (mobile, tablet, desktop)
2. **Time Rules**: Show/hide links based on time of day and days of week
3. **Location Rules**: Show/hide links based on user location (country/state)
4. **Performance Rules**: Show/hide links based on click ranking (top 5%, bottom 10%, etc.)

### Rule Operators
- **AND**: All rules must pass (default)
- **OR**: At least one rule must pass

### Example Rule Configuration
```json
{
  "title": "Mobile Landing Page",
  "url": "https://example.com/mobile",
  "rules": [
    {
      "type": "device",
      "value": "mobile",
      "action": "show"
    },
    {
      "type": "time",
      "value": {
        "startHour": 9,
        "endHour": 17,
        "daysOfWeek": [1, 2, 3, 4, 5]
      },
      "action": "show"
    }
  ],
  "ruleOperator": "AND"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Logging level | info |

## Scripts

```bash
# Start server
npm start

# Development mode with nodemon
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Error Handling
The API uses a centralized error handling middleware that returns errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation
- Rate limiting
- XSS protection

## Analytics Implementation
- **Fire-and-Forget Pattern**: Click tracking doesn't block user experience
- **Real-time Updates**: Analytics updated asynchronously
- **Performance Metrics**: Track clicks, visits, device types, and more

## Performance Optimizations
- **Caching**: Hub data cached with node-cache (10-minute TTL)
- **Async Operations**: Non-blocking analytics tracking
- **Database Indexing**: Optimized queries for slug lookups
- **Connection Pooling**: Efficient database connections

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT

## Contact
For questions or support, please contact the development team.

## Hackathon Finals - IIT Ropar 2026
This project is built for the Advitiya x JPD Hub Hackathon Finals.
