// Smart Link Hub Backend API - Advitiya x JPD Hub Hackathon 2026
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Rate limiter
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

// Auth middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === AUTH ===
app.post('/api/users/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, hashedPassword, name]);
    const token = jwt.sign({ id: result.rows[0].id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: result.rows[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === HUBS ===
app.post('/api/hubs', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const slug = 'hub_' + Date.now();
    const result = await pool.query('INSERT INTO link_hubs (user_id, hub_slug, title, description) VALUES ($1, $2, $3, $4) RETURNING *', [req.user.id, slug, title, description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hubs', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM link_hubs WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hubs/:slug', async (req, res) => {
  try {
    const hubResult = await pool.query('SELECT * FROM link_hubs WHERE hub_slug = $1', [req.params.slug]);
    if (hubResult.rows.length === 0) return res.status(404).json({ error: 'Hub not found' });
    const hub = hubResult.rows[0];
    const linksResult = await pool.query('SELECT * FROM links WHERE hub_id = $1 AND is_active = true ORDER BY position', [hub.id]);
    const rulesResult = await pool.query('SELECT * FROM rules WHERE hub_id = $1 AND is_active = true', [hub.id]);
    await pool.query('UPDATE link_hubs SET total_visits = total_visits + 1 WHERE id = $1', [hub.id]);
    await pool.query('INSERT INTO hub_visits (hub_id) VALUES ($1)', [hub.id]);
    res.json({ hub, links: linksResult.rows, rules: rulesResult.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === LINKS ===
app.post('/api/links', verifyToken, async (req, res) => {
  try {
    const { hub_id, title, url, description, priority } = req.body;
    const result = await pool.query('INSERT INTO links (hub_id, title, url, description, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *', [hub_id, title, url, description, priority || 5]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/links/:hub_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links WHERE hub_id = $1 AND is_active = true ORDER BY position', [req.params.hub_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/links/:id', verifyToken, async (req, res) => {
  try {
    const { title, url, description, priority } = req.body;
    const result = await pool.query('UPDATE links SET title = COALESCE($1, title), url = COALESCE($2, url), description = COALESCE($3, description), priority = COALESCE($4, priority), updated_at = NOW() WHERE id = $5 RETURNING *', [title, url, description, priority, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/links/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM links WHERE id = $1', [req.params.id]);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/links/:id/click', async (req, res) => {
  try {
    await pool.query('UPDATE links SET click_count = click_count + 1 WHERE id = $1', [req.params.id]);
    await pool.query('INSERT INTO link_analytics (hub_id, link_id) SELECT hub_id, id FROM links WHERE id = $1', [req.params.id]);
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === RULES ===
app.post('/api/rules', verifyToken, async (req, res) => {
  try {
    const { hub_id, rule_name, rule_type, condition, target_link_id, priority } = req.body;
    const result = await pool.query('INSERT INTO rules (hub_id, rule_name, rule_type, condition, target_link_id, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [hub_id, rule_name, rule_type, condition, target_link_id, priority || 5]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rules/:hub_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rules WHERE hub_id = $1 AND is_active = true ORDER BY priority DESC', [req.params.hub_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ANALYTICS ===
app.get('/api/analytics/:hub_id', verifyToken, async (req, res) => {
  try {
    const hubStats = await pool.query('SELECT total_visits FROM link_hubs WHERE id = $1', [req.params.hub_id]);
    const linkClicks = await pool.query('SELECT SUM(click_count) as total_clicks FROM links WHERE hub_id = $1', [req.params.hub_id]);
    const activeLinks = await pool.query('SELECT COUNT(*) as count FROM links WHERE hub_id = $1 AND is_active = true', [req.params.hub_id]);
    const activeRules = await pool.query('SELECT COUNT(*) as count FROM rules WHERE hub_id = $1 AND is_active = true', [req.params.hub_id]);
    const topLinks = await pool.query('SELECT title, url, click_count FROM links WHERE hub_id = $1 ORDER BY click_count DESC LIMIT 5', [req.params.hub_id]);
    res.json({ hub_visits: hubStats.rows[0]?.total_visits || 0, total_clicks: linkClicks.rows[0]?.total_clicks || 0, active_links: activeLinks.rows[0]?.count || 0, active_rules: activeRules.rows[0]?.count || 0, top_links: topLinks.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === URL SHORTENER ===
app.post('/api/shorten', verifyToken, async (req, res) => {
  try {
    const { hub_id, original_url } = req.body;
    const short_code = Math.random().toString(36).substr(2, 8);
    const result = await pool.query('INSERT INTO url_shortcuts (hub_id, original_url, short_code) VALUES ($1, $2, $3) RETURNING *', [hub_id, original_url, short_code]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
