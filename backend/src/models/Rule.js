Rule.js  const pool = require('../config/database');

class Rule {
  static async create(ruleData) {
    const { linkId, userId, name, description, ruleType, conditions, actions, priority, isEnabled } = ruleData;
    
    const query = `
      INSERT INTO rules (link_id, user_id, name, description, rule_type, conditions, actions, priority, is_enabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      linkId, userId, name, description || null, ruleType,
      JSON.stringify(conditions), JSON.stringify(actions),
      priority || 0, isEnabled !== undefined ? isEnabled : true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByLinkId(linkId) {
    const query = `SELECT * FROM rules WHERE link_id = $1 AND is_enabled = true ORDER BY priority DESC`;
    const result = await pool.query(query, [linkId]);
    return result.rows;
  }

  static async getByUserId(userId) {
    const query = `
      SELECT r.*, l.short_code, l.original_url 
      FROM rules r JOIN links l ON r.link_id = l.id
      WHERE r.user_id = $1 ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM rules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'conditions' || key === 'actions') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    values.push(id);
    const query = `UPDATE rules SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM rules WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async toggleEnabled(id) {
    const query = `UPDATE rules SET is_enabled = NOT is_enabled WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async incrementExecution(id) {
    const query = `
      UPDATE rules 
      SET execution_count = execution_count + 1, last_executed_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }
}

module.exports = Rule;
