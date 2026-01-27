const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new rule
router.post('/', rulesController.createRule);

// Get all rules for the authenticated user
router.get('/', rulesController.getRules);

// Get a specific rule by ID
router.get('/:id', rulesController.getRule);

// Update a rule
router.put('/:id', rulesController.updateRule);

// Delete a rule
router.delete('/:id', rulesController.deleteRule);

// Toggle rule enabled/disabled status
router.patch('/:id/toggle', rulesController.toggleRule);

// Test a rule without saving it
router.post('/test', rulesController.testRule);

// Get rule execution history
router.get('/:id/history', rulesController.getRuleHistory);

// Get rule analytics
router.get('/:id/analytics', rulesController.getRuleAnalytics);

module.exports = router;
