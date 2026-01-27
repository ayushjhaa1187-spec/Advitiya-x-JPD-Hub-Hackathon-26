# 🎯 Smart Rules Engine - Complete Implementation Guide

## ✅ Already Completed:
1. ✅ Rules database schema (`create_rules_table.sql`)

## 📋 Remaining Files to Create:

Due to GitHub's interface limitations, I'm providing all the code here. You can:
- Copy each file's code below
- Create files locally and push to GitHub
- Or create each file through GitHub's interface

---

## File 1: `/backend/src/models/Rule.js`

```javascript
const pool = require('../config/database');

class Rule {
  // Create a new rule
  static async create(ruleData) {
    const { linkId, userId, name, description, ruleType, conditions, actions, priority, isEnabled } = ruleData;
    
    const query = `
      INSERT INTO rules (link_id, user_id, name, description, rule_type, conditions, actions, priority, is_enabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      linkId,
      userId,
      name,
      description || null,
      ruleType,
      JSON.stringify(conditions),
      JSON.stringify(actions),
      priority || 0,
      isEnabled !== undefined ? isEnabled : true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all rules for a link
  static async getByLinkId(linkId) {
    const query = `
      SELECT * FROM rules 
      WHERE link_id = $1 AND is_enabled = true
      ORDER BY priority DESC, created_at DESC
    `;
    
    const result = await pool.query(query, [linkId]);
    return result.rows;
  }

  // Get all rules for a user
  static async getByUserId(userId) {
    const query = `
      SELECT r.*, l.short_code, l.original_url 
      FROM rules r
      JOIN links l ON r.link_id = l.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get rule by ID
  static async getById(id) {
    const query = 'SELECT * FROM rules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update rule
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

  // Delete rule
  static async delete(id) {
    const query = 'DELETE FROM rules WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Toggle rule enabled/disabled
  static async toggleEnabled(id) {
    const query = `
      UPDATE rules 
      SET is_enabled = NOT is_enabled 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Increment execution count
  static async incrementExecution(id) {
    const query = `
      UPDATE rules 
      SET execution_count = execution_count + 1,
          last_executed_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }
}

module.exports = Rule;
```

---

## File 2: `/backend/src/services/rulesEngine.js`

```javascript
const Rule = require('../models/Rule');

/**
 * Smart Rules Evaluation Engine
 * Evaluates rules and returns matching actions
 */

class RulesEngine {
  /**
   * Evaluate all rules for a link against current context
   * @param {number} linkId - Link ID
   * @param {object} context - Current request context (device, time, location, etc.)
   * @returns {object} - Actions to execute
   */
  static async evaluateRules(linkId, context) {
    try {
      // Get all enabled rules for this link
      const rules = await Rule.getByLinkId(linkId);
      
      if (!rules || rules.length === 0) {
        return { matched: false, actions: [] };
      }

      // Evaluate each rule
      const matchedRules = [];
      
      for (const rule of rules) {
        const isMatch = await this.evaluateRule(rule, context);
        
        if (isMatch) {
          matchedRules.push(rule);
          // Increment execution count
          await Rule.incrementExecution(rule.id);
        }
      }

      // Sort by priority and return actions
      matchedRules.sort((a, b) => b.priority - a.priority);
      
      return {
        matched: matchedRules.length > 0,
        actions: matchedRules.map(r => ({
          ruleId: r.id,
          ruleName: r.name,
          ...r.actions
        }))
      };
    } catch (error) {
      console.error('Rules evaluation error:', error);
      return { matched: false, actions: [], error: error.message };
    }
  }

  /**
   * Evaluate a single rule
   */
  static async evaluateRule(rule, context) {
    try {
      const conditions = typeof rule.conditions === 'string' 
        ? JSON.parse(rule.conditions) 
        : rule.conditions;

      switch (rule.rule_type) {
        case 'device':
          return this.evaluateDeviceRule(conditions, context);
        
        case 'time':
          return this.evaluateTimeRule(conditions, context);
        
        case 'location':
          return this.evaluateLocationRule(conditions, context);
        
        case 'clicks':
          return await this.evaluateClicksRule(conditions, rule.link_id);
        
        case 'combined':
          return this.evaluateCombinedRule(conditions, context, rule.link_id);
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Evaluate device-based rule
   */
  static evaluateDeviceRule(conditions, context) {
    if (!context.device || !conditions.deviceTypes) {
      return false;
    }

    const deviceType = context.device.toLowerCase();
    return conditions.deviceTypes.some(type => 
      deviceType.includes(type.toLowerCase())
    );
  }

  /**
   * Evaluate time-based rule
   */
  static evaluateTimeRule(conditions, context) {
    const now = new Date();
    const timezone = conditions.timezone || 'UTC';
    
    // Get current day of week (lowercase)
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = days[now.getDay()];
    
    // Check if current day matches
    if (conditions.days && !conditions.days.includes(currentDay)) {
      return false;
    }

    // Check time range
    if (conditions.startTime && conditions.endTime) {
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: timezone 
      });
      
      return currentTime >= conditions.startTime && currentTime <= conditions.endTime;
    }

    return true;
  }

  /**
   * Evaluate location-based rule
   */
  static evaluateLocationRule(conditions, context) {
    if (!context.location) {
      return false;
    }

    // Check country
    if (conditions.countries && conditions.countries.length > 0) {
      if (!conditions.countries.includes(context.location.country)) {
        return false;
      }
    }

    // Check regions/cities
    if (conditions.regions && conditions.regions.length > 0) {
      if (!conditions.regions.includes(context.location.region)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate click-performance rule
   */
  static async evaluateClicksRule(conditions, linkId) {
    try {
      const pool = require('../config/database');
      
      // Query click count for the period
      const periodDays = this.parsePeriod(conditions.period || '7days');
      
      const query = `
        SELECT COUNT(*) as click_count
        FROM analytics
        WHERE link_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${periodDays} days'
      `;
      
      const result = await pool.query(query, [linkId]);
      const clickCount = parseInt(result.rows[0].click_count);
      
      return clickCount >= (conditions.minClicks || 0);
    } catch (error) {
      console.error('Error evaluating clicks rule:', error);
      return false;
    }
  }

  /**
   * Evaluate combined rule (AND logic)
   */
  static async evaluateCombinedRule(conditions, context, linkId) {
    const results = await Promise.all([
      conditions.device ? this.evaluateDeviceRule(conditions.device, context) : true,
      conditions.time ? this.evaluateTimeRule(conditions.time, context) : true,
      conditions.location ? this.evaluateLocationRule(conditions.location, context) : true,
      conditions.clicks ? await this.evaluateClicksRule(conditions.clicks, linkId) : true
    ]);

    return results.every(result => result === true);
  }

  /**
   * Parse period string to days
   */
  static parsePeriod(period) {
    const match = period.match(/(\d+)(day|week|month)s?/);
    if (!match) return 7;

    const [, number, unit] = match;
    const multipliers = { day: 1, week: 7, month: 30 };
    return parseInt(number) * multipliers[unit];
  }
}

module.exports = RulesEngine;
```

---

## ⏰ **Due to response length limits, I'll create the remaining files in the repository root as a single comprehensive guide.**

Let me save this and create one more file with the REST of the implementation.
