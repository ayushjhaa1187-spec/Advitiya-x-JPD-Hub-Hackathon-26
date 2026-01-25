const { pool } = require('../database');

exports.createHub = async (req, res, next) => {
  // Logic mostly handled in registration, but kept for scalability
};

exports.getHub = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM hubs WHERE unique_id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getPublicHub = async (req, res, next) => {
  try {
    const hubRes = await pool.query('SELECT * FROM hubs WHERE unique_id = $1', [req.params.id]);
    if (hubRes.rows.length === 0) return res.status(404).json({ message: 'Hub not found' });
    
    // Get Links for this hub
    const linkRes = await pool.query('SELECT * FROM links WHERE hub_id = $1 ORDER BY priority DESC', [hubRes.rows[0].id]);
    
    res.json({ hub: hubRes.rows[0], links: linkRes.rows });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { title, description, theme } = req.body;
    await pool.query(
      'UPDATE hubs SET title=$1, description=$2, theme=$3 WHERE unique_id=$4 AND user_id=$5',
      [title, description, theme, req.params.id, req.userId]
    );
    res.json({ message: 'Settings updated' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    // Determine real database ID of the hub based on unique string ID
    const hubRes = await pool.query('SELECT id FROM hubs WHERE unique_id = $1', [req.params.hubId]);
    if (hubRes.rows.length === 0) return res.json({ totalClicks: 0, totalVisits: 0 });

    const hubId = hubRes.rows[0].id;

    const clickRes = await pool.query('SELECT SUM(clicks) as total FROM links WHERE hub_id = $1', [hubId]);
    
    res.json({ 
      totalClicks: clickRes.rows[0].total || 0,
      totalVisits: clickRes.rows[0].total || 0 // Simplified: Using clicks as proxy for visits for now
    });
  } catch (err) { next(err); }
};
