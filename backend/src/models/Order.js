const db = require('../config/database');

class Order {
  static async create(orderData) {
    const { user_id, total_amount, status = 'pending' } = orderData;
    const result = await db.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [user_id, total_amount, status]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async findAll(limit = 20, offset = 0) {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
    return result.rows[0];
  }
}

module.exports = Order;
