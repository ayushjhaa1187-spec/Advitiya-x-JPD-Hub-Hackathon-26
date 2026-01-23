const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hashedPassword, role]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, email } = userData;
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, updated_at',
      [name, email, id]
    );
    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async verifyPassword(storedPassword, providedPassword) {
    return await bcrypt.compare(providedPassword, storedPassword);
  }
}

module.exports = User;
