/**
 * Rate Limiter Middleware
 * Implements token bucket algorithm for API rate limiting
 * Prevents abuse and ensures fair API usage
 */

const rateStore = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Global rate limits
  global: {
    maxRequests: 10000,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Endpoint-specific rate limits
  endpoints: {
    '/api/links/:id/redirect': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min
    '/api/links': { maxRequests: 50, windowMs: 60 * 1000 }, // 50 req/min for create
    '/api/auth/login': { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 login attempts per 15 min
    '/api/links/:id/qrcode': { maxRequests: 50, windowMs: 60 * 1000 }, // QR generation
  },
  // Skip rate limiting for these paths
  skipPaths: ['/health', '/api/status'],
};

/**
 * Token Bucket Algorithm Implementation
 * Returns remaining tokens and resets window if needed
 */
function getTokenBucket(key, maxRequests, windowMs) {
  const now = Date.now();
  const bucket = rateStore.get(key) || { tokens: maxRequests, resetTime: now + windowMs };

  // Reset if window has passed
  if (now > bucket.resetTime) {
    bucket.tokens = maxRequests;
    bucket.resetTime = now + windowMs;
  }

  return bucket;
}

/**
 * Main rate limiting middleware
 */
const rateLimiter = (options = {}) => {
  const config = { ...RATE_LIMIT_CONFIG, ...options };

  return (req, res, next) => {
    // Skip rate limiting for whitelisted paths
    if (config.skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Get client identifier (user ID, IP address, etc.)
    const clientId = req.user?.id || req.ip || 'anonymous';
    const endpoint = req.baseUrl + req.path;

    // Determine rate limit based on endpoint
    let rateLimit = config.global;
    for (const [pattern, limit] of Object.entries(config.endpoints)) {
      if (matchPattern(endpoint, pattern)) {
        rateLimit = limit;
        break;
      }
    }

    // Get or create token bucket for this client
    const bucketKey = `${clientId}:${endpoint}`;
    const bucket = getTokenBucket(bucketKey, rateLimit.maxRequests, rateLimit.windowMs);

    // Check if client has tokens available
    if (bucket.tokens > 0) {
      bucket.tokens--;
      rateStore.set(bucketKey, bucket);

      // Set rate limit headers
      res.set('X-RateLimit-Limit', rateLimit.maxRequests);
      res.set('X-RateLimit-Remaining', bucket.tokens);
      res.set('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000));

      return next();
    }

    // Rate limit exceeded
    const resetTime = Math.ceil((bucket.resetTime - Date.now()) / 1000);
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
      retryAfter: resetTime,
    });
  };
};

/**
 * Specific rate limiter for public link redirects
 * More lenient to handle high traffic
 */
const publicLinkRateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const bucketKey = `public:${clientIp}`;
  const maxRequests = 1000; // 1000 redirects
  const windowMs = 60 * 60 * 1000; // Per hour

  const bucket = getTokenBucket(bucketKey, maxRequests, windowMs);

  if (bucket.tokens > 0) {
    bucket.tokens--;
    rateStore.set(bucketKey, bucket);
    return next();
  }

  res.status(429).json({
    success: false,
    error: 'Too Many Requests',
    message: 'Public link access limit exceeded. Try again later.',
  });
};

/**
 * Simple pattern matching for endpoint routes
 * Supports wildcard matching
 */
function matchPattern(url, pattern) {
  const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Cleanup old entries from rate store
 * Run periodically to prevent memory leaks
 */
function cleanupRateStore() {
  const now = Date.now();
  for (const [key, bucket] of rateStore.entries()) {
    if (now > bucket.resetTime + 60 * 60 * 1000) {
      rateStore.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupRateStore, 60 * 60 * 1000);

module.exports = {
  rateLimiter,
  publicLinkRateLimiter,
  RATE_LIMIT_CONFIG,
};
