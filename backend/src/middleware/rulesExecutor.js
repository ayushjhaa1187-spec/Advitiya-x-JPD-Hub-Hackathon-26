const RulesEngine = require('../services/rulesEngine');

/**
 * Rules Executor Middleware
 * Automatically executes rules when links are created or accessed
 */
const rulesExecutor = async (req, res, next) => {
  try {
    // Skip if not authenticated
    if (!req.user) {
      return next();
    }

    // Get link data from request
    const link = req.link || req.body;

    // Only process if we have a link URL
    if (!link || !link.url) {
      return next();
    }

    // Build context for rule evaluation
    const context = {
      url: link.url,
      short_code: link.short_code,
      title: link.title,
      created_at: link.created_at,
      user_id: req.user.id
    };

    // Process all rules for this user
    const results = await RulesEngine.processRules(req.user.id, context);

    // Attach rule execution results to request for later use
    req.ruleResults = results;

    // Apply rule actions to the link object
    if (results.length > 0) {
      for (const result of results) {
        if (result.success && result.results) {
          for (const action of result.results) {
            applyActionToLink(link, action);
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error executing rules:', error);
    // Continue even if rules fail - don't block the request
    next();
  }
};

/**
 * Apply a rule action to a link object
 * @param {Object} link - Link object to modify
 * @param {Object} action - Action to apply
 */
function applyActionToLink(link, action) {
  switch (action.type) {
    case 'add_tag':
      if (!link.tags) link.tags = [];
      if (!link.tags.includes(action.tag)) {
        link.tags.push(action.tag);
      }
      break;

    case 'set_expiry':
      link.expires_at = action.expires_at;
      break;

    case 'redirect':
      link.redirect_url = action.redirect_url;
      break;

    case 'block':
      link.is_blocked = true;
      link.block_reason = action.reason;
      break;

    default:
      // Unknown action, skip
      break;
  }
}

/**
 * Optional middleware to check if a link is blocked by rules
 * Use this in the link redirect endpoint
 */
const checkBlockedLink = async (req, res, next) => {
  try {
    const link = req.link;

    if (link && link.is_blocked) {
      return res.status(403).json({
        error: 'This link has been blocked',
        reason: link.block_reason || 'Link access denied by rules'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking blocked link:', error);
    next();
  }
};

module.exports = {
  rulesExecutor,
  checkBlockedLink
};
