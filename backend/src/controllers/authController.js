const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    // Auto-create a default Hub for the new user
    await pool.query(
      'INSERT INTO hubs (user_id, unique_id) VALUES ($1, $2)',
      [result.rows[0].id, 'hub_' + Date.now()]
    );

    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Get their Hub ID to send back
    const hubRes = await pool.query('SELECT unique_id FROM hubs WHERE user_id = $1', [user.id]);
    const hubId = hubRes.rows[0]?.unique_id;

    res.json({ token, user: { id: user.id, name: user.name, email: user.email }, hubId });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res) => {
  // Implementation for getProfile if needed
  res.json({ message: "Profile fetched" });
};
