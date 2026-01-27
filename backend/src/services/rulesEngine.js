const Rule = require('../models/Rule');

/**
 * Rules Engine Service
 * Evaluates and executes rules based on link data
 */
class RulesEngine {
  /**
   * Evaluate a single rule against context data
   * @param {Object} rule - Rule object with conditions
   * @param {Object} context - Context data (link, user, etc.)
   * @returns {Boolean} - Whether the rule matches
   */
  static evaluateRule(rule, context) {
    try {
      if (!rule.is_enabled) return false;
      
      const conditions = typeof rule.conditions === 'string' 
        ? JSON.parse(rule.conditions) 
        : rule.conditions;
      
      return this.evaluateConditions(conditions, context);
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Evaluate conditions recursively
   * @param {Object} conditions - Conditions object
   * @param {Object} context - Context data
   * @returns {Boolean} - Whether conditions match
   */
  static evaluateConditions(conditions, context) {
    const { field, operator, value, logic, group } = conditions;

    // Handle condition groups (AND/OR logic)
    if (group && Array.isArray(group)) {
      if (logic === 'OR') {
        return group.some(cond => this.evaluateConditions(cond, context));
      } else { // AND logic (default)
        return group.every(cond => this.evaluateConditions(cond, context));
      }
    }

    // Single condition evaluation
    return this.evaluateSingleCondition(field, operator, value, context);
  }

  /**
   * Evaluate a single condition
   * @param {String} field - Field to check
   * @param {String} operator - Comparison operator
   * @param {Any} value - Value to compare against
   * @param {Object} context - Context data
   * @returns {Boolean} - Whether condition matches
   */
  static evaluateSingleCondition(field, operator, value, context) {
    const contextValue = this.getNestedValue(context, field);

    switch (operator) {
      case 'equals':
        return contextValue === value;
      
      case 'not_equals':
        return contextValue !== value;
      
      case 'contains':
        return contextValue && String(contextValue).includes(String(value));
      
      case 'not_contains':
        return contextValue && !String(contextValue).includes(String(value));
      
      case 'starts_with':
        return contextValue && String(contextValue).startsWith(String(value));
      
      case 'ends_with':
        return contextValue && String(contextValue).endsWith(String(value));
      
      case 'regex':
        try {
          return contextValue && new RegExp(value).test(String(contextValue));
        } catch (e) {
          console.error('Invalid regex:', value);
          return false;
        }
      
      case 'greater_than':
        return Number(contextValue) > Number(value);
      
      case 'less_than':
        return Number(contextValue) < Number(value);
      
      case 'is_empty':
        return !contextValue || contextValue === '' || contextValue === null;
      
      case 'is_not_empty':
        return contextValue && contextValue !== '' && contextValue !== null;
      
      default:
        console.warn('Unknown operator:', operator);
        return false;
    }
  }

  /**
   * Execute rule actions
   * @param {Object} rule - Rule object with actions
   * @param {Object} context - Context data
   * @returns {Object} - Execution result
   */
  static async executeActions(rule, context) {
    try {
      const actions = typeof rule.actions === 'string'
        ? JSON.parse(rule.actions)
        : rule.actions;

      const results = [];

      for (const action of actions) {
        const result = await this.executeAction(action, context);
        results.push(result);
      }

      // Update rule execution count
      await Rule.incrementExecution(rule.id);

      return {
        success: true,
        results,
        rule_id: rule.id,
        rule_name: rule.name
      };
    } catch (error) {
      console.error('Error executing actions:', error);
      return {
        success: false,
        error: error.message,
        rule_id: rule.id
      };
    }
  }

  /**
   * Execute a single action
   * @param {Object} action - Action object
   * @param {Object} context - Context data
   * @returns {Object} - Action result
   */
  static async executeAction(action, context) {
    const { type, params } = action;

    switch (type) {
      case 'add_tag':
        return {
          type: 'add_tag',
          tag: params.tag,
          applied: true
        };

      case 'set_expiry':
        return {
          type: 'set_expiry',
          expires_at: params.expires_at,
          applied: true
        };

      case 'send_notification':
        return {
          type: 'send_notification',
          message: params.message,
          applied: true
        };

      case 'redirect':
        return {
          type: 'redirect',
          redirect_url: params.redirect_url,
          applied: true
        };

      case 'block':
        return {
          type: 'block',
          blocked: true,
          reason: params.reason
        };

      default:
        console.warn('Unknown action type:', type);
        return {
          type,
          applied: false,
          error: 'Unknown action type'
        };
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {String} path - Dot notation path (e.g., 'link.url')
   * @returns {Any} - Value at path
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Process all rules for a given context
   * @param {Number} userId - User ID
   * @param {Object} context - Context data
   * @returns {Array} - Array of execution results
   */
  static async processRules(userId, context) {
    try {
      const rules = await Rule.findAll(userId);
      const results = [];

      // Sort rules by priority (higher priority first)
      rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const rule of rules) {
        if (this.evaluateRule(rule, context)) {
          const result = await this.executeActions(rule, context);
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing rules:', error);
      return [];
    }
  }
}

module.exports = RulesEngine;
