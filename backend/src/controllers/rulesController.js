const Rule = require('../models/Rule');
const Link = require('../models/Link');

// Create a new rule
exports.createRule = async (req, res) => {
  try {
    const { name, description, conditions, actions, priority } = req.body;
    
    // Validate required fields
    if (!name || !conditions || !actions) {
      return res.status(400).json({ error: 'Name, conditions, and actions are required' });
    }

    const rule = await Rule.create({
      user_id: req.user.id,
      name,
      description,
      conditions,
      actions,
      priority: priority || 0,
      is_enabled: true
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

// Get all rules for authenticated user
exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.findAll(req.user.id);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

// Get a specific rule by ID
exports.getRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(rule);
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: 'Failed to fetch rule' });
  }
};

// Update a rule
exports.updateRule = async (req, res) => {
  try {
    const { name, description, conditions, actions, priority, is_enabled } = req.body;
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updatedRule = await Rule.update(req.params.id, {
      name,
      description,
      conditions,
      actions,
      priority,
      is_enabled
    });
    
    res.json(updatedRule);
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

// Delete a rule
exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await Rule.delete(req.params.id);
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

// Toggle rule enabled/disabled status
exports.toggleRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updatedRule = await Rule.toggleEnabled(req.params.id);
    res.json(updatedRule);
  } catch (error) {
    console.error('Error toggling rule:', error);
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
};

// Test a rule without saving it
exports.testRule = async (req, res) => {
  try {
    const { conditions, testUrl } = req.body;
    
    if (!conditions || !testUrl) {
      return res.status(400).json({ error: 'Conditions and test URL are required' });
    }
    
    // Simulate rule evaluation
    const matches = evaluateConditions(conditions, { url: testUrl });
    
    res.json({ 
      matches,
      message: matches ? 'Rule conditions match' : 'Rule conditions do not match'
    });
  } catch (error) {
    console.error('Error testing rule:', error);
    res.status(500).json({ error: 'Failed to test rule' });
  }
};

// Get rule execution history
exports.getRuleHistory = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Return execution history from rule data
    res.json({
      execution_count: rule.execution_count || 0,
      last_executed_at: rule.last_executed_at
    });
  } catch (error) {
    console.error('Error fetching rule history:', error);
    res.status(500).json({ error: 'Failed to fetch rule history' });
  }
};

// Get rule analytics
exports.getRuleAnalytics = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    // Verify ownership
    if (rule.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({
      rule_id: rule.id,
      name: rule.name,
      execution_count: rule.execution_count || 0,
      is_enabled: rule.is_enabled,
      created_at: rule.created_at,
      last_executed_at: rule.last_executed_at
    });
  } catch (error) {
    console.error('Error fetching rule analytics:', error);
    res.status(500).json({ error: 'Failed to fetch rule analytics' });
  }
};

// Helper function to evaluate rule conditions
function evaluateConditions(conditions, context) {
  try {
    const { field, operator, value } = conditions;
    const contextValue = context[field];
    
    switch (operator) {
      case 'contains':
        return contextValue && contextValue.includes(value);
      case 'equals':
        return contextValue === value;
      case 'starts_with':
        return contextValue && contextValue.startsWith(value);
      case 'ends_with':
        return contextValue && contextValue.endsWith(value);
      case 'regex':
        return contextValue && new RegExp(value).test(contextValue);
      default:
        return false;
    }
  } catch (error) {
    console.error('Error evaluating conditions:', error);
    return false;
  }
}

module.exports = exports;
