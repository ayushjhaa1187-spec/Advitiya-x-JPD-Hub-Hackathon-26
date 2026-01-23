# Backend - E-Commerce Platform

## Overview
This is a Node.js backend API for an e-commerce platform built for the Advitiya x JPD Hub Hackathon 2026.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS
- **Validation**: Express Validator
- **Logging**: Winston

## Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js       # Environment variables
│   │   └── database.js  # Database connection
│   ├── controllers/     # Request handlers
│   │   └── userController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/          # API routes
│   │   └── users.js
│   ├── services/        # Business logic
│   │   └── userService.js
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

#### User Routes
```http
GET    /api/users        # Get all users
GET    /api/users/:id    # Get user by ID
POST   /api/users        # Create new user
PUT    /api/users/:id    # Update user
DELETE /api/users/:id    # Delete user
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
