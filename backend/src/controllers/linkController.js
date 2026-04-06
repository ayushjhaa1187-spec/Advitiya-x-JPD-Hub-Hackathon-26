const { pool } = require('../config/database');

// Helper to evaluate smart rules based on request context
const evaluateRule = (rule, req) => {
  const userAgent = req.headers['user-agent'] || '';
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  switch(rule.rule_type) {
    case 'device':
      if (rule.rule_condition === 'mobile' && /Mobile|Android|iPhone/i.test(userAgent)) return true;
      if (rule.rule_condition === 'desktop' && !/Mobile|Android|iPhone/i.test(userAgent)) return true;
      break;
    case 'time':
      // Example condition: 'after=17' (after 5 PM)
      if (rule.rule_condition.startsWith('after=')) {
        const hour = parseInt(rule.rule_condition.split('=')[1]);
        if (currentHour >= hour) return true;
      }
      break;
    case 'geo':
      // Simplified: Check if IP is from a specific range or header
      // In production, use a geo-ip library
      const country = req.headers['x-vercel-ip-country'] || 'UNKNOWN';
      if (rule.rule_condition === country) return true;
      break;
  }
  return false;
};

exports.createLink = async (req, res, next) => {
  try {
    const { title, url, priority, description, hubId } = req.body;
    const hubRes = await pool.query('SELECT id FROM hubs WHERE unique_id = $1', [hubId]);
    if(hubRes.rows.length === 0) return res.status(404).json({message: 'Hub not found'});

    const result = await pool.query(
      'INSERT INTO links (hub_id, title, url, priority, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [hubRes.rows[0].id, title, url, priority, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getLinksByHub = async (req, res, next) => {
  try {
    const hubRes = await pool.query('SELECT id FROM hubs WHERE unique_id = $1', [req.params.hubId]);
    if(hubRes.rows.length === 0) return res.json([]);

    const result = await pool.query('SELECT * FROM links WHERE hub_id = $1 ORDER BY priority DESC', [hubRes.rows[0].id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.deleteLink = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM links WHERE id = $1', [req.params.id]);
    res.json({ message: 'Link deleted' });
  } catch (err) { next(err); }
};

exports.trackClick = async (req, res, next) => {
  try {
    await pool.query('UPDATE links SET clicks = clicks + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Click tracked' });
  } catch (err) { next(err); }
};

// Handle Smart Redirection and Click Logging
exports.trackClickAndRedirect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referrer = req.headers['referer'] || 'direct';

    // 1. Fetch Link and Hub Rules
    const linkRes = await pool.query('SELECT * FROM links WHERE id = $1', [id]);
    if (linkRes.rows.length === 0) return res.status(404).send('Link Not Found');
    const link = linkRes.rows[0];

    const rulesRes = await pool.query('SELECT * FROM rules WHERE hub_id = $1 ORDER BY priority DESC', [link.hub_id]);
    const rules = rulesRes.rows;

    let targetUrl = link.url;

    // 2. Evaluate Smart Rules
    for (const rule of rules) {
      if (evaluateRule(rule, req)) {
        if (rule.destination_url) {
          targetUrl = rule.destination_url;
          break; // Stop at first matching rule with highest priority
        }
      }
    }

    // 3. Log Click and update count (Async)
    pool.query('UPDATE links SET clicks = clicks + 1 WHERE id = $1', [id]).catch(console.error);
    pool.query(
      'INSERT INTO link_clicks (link_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)',
      [id, ip, userAgent, referrer]
    ).catch(console.error);

    // 4. Redirect to final target
    return res.redirect(targetUrl);
  } catch (err) { 
    console.error('Redirect error:', err);
    res.status(500).send('Internal Server Error');
  }
};
