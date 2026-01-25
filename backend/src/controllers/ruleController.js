const { pool } = require('../database');

exports.createRule = async (req, res, next) => {
  try {
    const { name, type, condition, priority, operator, hubId } = req.body;
    
    const hubRes = await pool.query('SELECT id FROM hubs WHERE unique_id = $1', [hubId]);
    const result = await pool.query(
      'INSERT INTO rules (hub_id, name, type, condition, priority, operator) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [hubRes.rows[0].id, name, type, condition, priority, operator]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.getRulesByHub = async (req, res, next) => {
  try {
    const hubRes = await pool.query('SELECT id FROM hubs WHERE unique_id = $1', [req.params.hubId]);
    if(hubRes.rows.length === 0) return res.json([]);

    const result = await pool.query('SELECT * FROM rules WHERE hub_id = $1', [hubRes.rows[0].id]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.deleteRule = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM rules WHERE id = $1', [req.params.id]);
    res.json({ message: 'Rule deleted' });
  } catch (err) { next(err); }
};
