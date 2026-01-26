# Backend Architecture & API Structure
## Smart Link Hub - Link Management System with Smart Rules

### Overview
A scalable, production-ready backend for managing shortened links with advanced analytics, device-based redirects, and time-based rule engine.

---

## Clean Architecture Structure

```
backend/
├── src/
│   ├── config/              # Configuration & Environment
│   │   ├── database.js      # Database connection
│   │   ├── redis.js         # Cache configuration
│   │   └── env.js           # Environment variables
│   │
│   ├── models/              # Database Models (Sequelize/ORM)
│   │   ├── Link.js          # Link model with rule evaluation
│   │   ├── User.js          # User authentication model
│   │   ├── Hub.js           # Hub/Collection model
│   │   ├── Rule.js          # Rule engine model
│   │   └── Analytics.js     # Analytics tracking model
│   │
│   ├── controllers/         # Business Logic Layer
│   │   ├── linkController.js
│   │   ├── userController.js
│   │   ├── analyticsController.js
│   │   └── ruleController.js
│   │
│   ├── services/            # Application Services
│   │   ├── linkService.js
│   │   ├── analyticsService.js
│   │   ├── cacheService.js  # Redis caching
│   │   ├── ruleEngine.js    # Rule evaluation logic
│   │   └── qrCodeService.js
│   │
│   ├── middleware/          # Middleware Handlers
│   │   ├── auth.js          # JWT authentication
│   │   ├── validation.js    # Input validation
│   │   ├── errorHandler.js  # Error handling
│   │   └── rateLimiter.js   # Rate limiting (NEW)
│   │
│   ├── routes/              # API Routes
│   │   ├── links.js
│   │   ├── users.js
│   │   ├── analytics.js
│   │   └── rules.js
│   │
│   ├── utils/               # Utility Functions
│   │   ├── logger.js        # Logging utility
│   │   ├── validators.js    # Validation helpers
│   │   └── helpers.js       # General helpers
│   │
│   └── app.js               # Express application setup
│
├── API-STRUCTURE.md         # This file
├── schema.sql               # Database schema
├── package.json
└── .env.example
```

---

## API Endpoints

### Links Management
```
GET    /api/v1/links              # Get all links for user
GET    /api/v1/links/:id          # Get specific link
POST   /api/v1/links              # Create new link
PUT    /api/v1/links/:id          # Update link
DELETE /api/v1/links/:id          # Delete link
GET    /api/v1/links/:id/redirect # Public redirect endpoint
GET    /api/v1/links/:id/qrcode   # Generate QR code
```

### Analytics
```
GET    /api/v1/analytics/overview     # Get dashboard stats
GET    /api/v1/analytics/:linkId      # Get link analytics
GET    /api/v1/analytics/device-type  # Get device breakdown
POST   /api/v1/analytics/track        # Track click event
```

### Rules Engine
```
GET    /api/v1/rules               # Get all rules
POST   /api/v1/rules               # Create rule
PUT    /api/v1/rules/:id           # Update rule
DELETE /api/v1/rules/:id           # Delete rule
POST   /api/v1/rules/:id/evaluate  # Test rule
```

### Authentication
```
POST   /api/v1/auth/register       # Register user
POST   /api/v1/auth/login          # Login user
POST   /api/v1/auth/oauth/google   # Google OAuth
POST   /api/v1/auth/oauth/github   # GitHub OAuth
```

---

## Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### Links Table
```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code VARCHAR(20) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  tags VARCHAR(255)[],
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  rule_operator ENUM('AND', 'OR') DEFAULT 'OR',
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_category ON links(category);
```

### Analytics Table
```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  device_type VARCHAR(20),     -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  referrer TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_analytics_link_id ON analytics(link_id);
CREATE INDEX idx_analytics_device ON analytics(device_type);
```

### Rules Table
```sql
CREATE TABLE rules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_type VARCHAR(50),       -- device-type, time-based, analytics
  rule_name VARCHAR(255),
  conditions JSONB,            -- {"device": "mobile", "operator": "AND"}
  target_url TEXT,
  priority INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_rules_user_id ON rules(user_id);
```

---

## Input Validation

### Link Creation Validation
```javascript
{
  original_url: { required: true, type: 'url' },
  title: { required: true, minLength: 3, maxLength: 255 },
  description: { maxLength: 1000 },
  category: { enum: ['Technology', 'Education', 'Business', ...] },
  tags: { type: 'array', maxItems: 10 },
}
```

### Rule Creation Validation
```javascript
{
  rule_type: { required: true, enum: ['device-type', 'time-based', 'analytics'] },
  rule_name: { required: true, minLength: 3 },
  conditions: { required: true, type: 'object' },
  target_url: { required: true, type: 'url' },
}
```

---

## Error Handling

### HTTP Status Codes
```
200 OK                 - Successful request
201 Created            - Resource created
400 Bad Request        - Invalid input
401 Unauthorized       - Authentication required
403 Forbidden          - Access denied
404 Not Found          - Resource not found
429 Too Many Requests  - Rate limit exceeded
500 Internal Server Error - Server error
```

### Error Response Format
```json
{
  "success": false,
  "error": "InvalidInput",
  "message": "URL must be valid",
  "statusCode": 400,
  "timestamp": "2024-01-26T10:00:00Z"
}
```

---

## Rate Limiting

### Configuration
```javascript
Global:                10,000 requests / 15 minutes
Link Redirect:         100 requests / 1 minute (per IP)
Link Create:           50 requests / 1 minute (per user)
Auth Login:            10 attempts / 15 minutes (per IP)
QR Code Generation:    50 requests / 1 minute (per user)
```

### Rate Limit Headers
```
X-RateLimit-Limit:     50
X-RateLimit-Remaining: 45
X-RateLimit-Reset:     1644234600
```

---

## Caching Strategy

### Redis Caching Layers
1. **Popular Links Cache** (24 hours)
   - Frequently accessed links
   - Updated on every click

2. **User Dashboard Cache** (5 minutes)
   - User's recent links
   - Analytics summary

3. **Rule Cache** (10 minutes)
   - Compiled rules for fast evaluation
   - Invalidated on rule update

4. **QR Code Cache** (7 days)
   - Generated QR code images
   - Key: `qr:{linkId}`

---

## Performance Optimization

### Indexing Strategy
- Single field indexes on frequently queried columns
- Composite indexes for common filter combinations
- GIN indexes for array/JSON search

### Query Optimization
- Pagination for list endpoints (default: 20 items)
- Lazy loading for analytics data
- Connection pooling (25 connections)

### Scalability
- Stateless API design for horizontal scaling
- Database read replicas for analytics queries
- Load balancing with sticky sessions

---

## Deployment

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-26T10:00:00Z",
  "uptime": 86400,
  "database": "connected",
  "cache": "connected"
}
```

---

## Non-Functional Requirements Met

✅ **Scalability**
- Horizontal scaling with stateless design
- Database read replicas
- Redis caching for high-traffic endpoints

✅ **Performance**
- Public link redirects optimized (<50ms)
- Caching at multiple layers
- Query optimization with proper indexing

✅ **Reliability**
- Connection pooling
- Error handling and logging
- Health check endpoint

✅ **Security**
- JWT authentication
- Input validation
- SQL injection prevention

✅ **Maintainability**
- Clean architecture separation
- Modular services
- Comprehensive documentation
