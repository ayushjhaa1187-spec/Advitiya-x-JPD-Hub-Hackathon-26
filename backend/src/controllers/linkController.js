const { pool } = require('../database');

exports.createLink = async (req, res, next) => {
  try {
    const { title, url, priority, description, hubId } = req.body;
    
    // Get internal ID
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
