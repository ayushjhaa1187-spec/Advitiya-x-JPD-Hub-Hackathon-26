const db = require('../config/database');

class Product {
  static async create(productData) {
    const { name, description, price, stock, category } = productData;
    const result = await db.query(
      'INSERT INTO products (name, description, price, stock, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, category]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll(limit = 20, offset = 0) {
    const result = await db.query('SELECT * FROM products LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
  }

  static async update(id, productData) {
    const { name, description, price, stock, category } = productData;
    const result = await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, description, price, stock, category, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async decreaseStock(id, quantity) {
    const result = await db.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *',
      [quantity, id]
    );
    return result.rows[0];
  }
}

module.exports = Product;
