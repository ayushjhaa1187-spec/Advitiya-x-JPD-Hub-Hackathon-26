/**
 * Rule Engine Service - FINALS ENHANCED VERSION
 * Implements AND/OR logic, performance ranking, and all rule types
 * Created for Advitiya x JPD Hub Hackathon 2026 - IIT Ropar Finals
 */

class RuleEngine {
  /**
   * Main evaluation function - evaluates all rules for a link
   * @param {Object} link - Link object with rules array and ruleOperator
   * @param {Object} context - Evaluation context (device, timestamp, location, hub)
   * @returns {Boolean} - True if link should be shown
   */
  evaluateAllRules(link, context) {
    // No rules means always show
    if (!link.rules || link.rules.length === 0) {
      return true;
    }

    // Evaluate each rule
    const ruleResults = link.rules.map(rule => 
      this.evaluateRule(rule, context)
    );

    // Apply AND/OR logic
    const operator = link.ruleOperator || 'AND'; // Default to AND

    if (operator === 'AND') {
      // ALL rules must pass
      return ruleResults.every(result => result === true);
    } else if (operator === 'OR') {
      // At least ONE rule must pass
      return ruleResults.some(result => result === true);
    }

    // Default: show link
    return true;
  }

  /**
   * Evaluate a single rule
   * @param {Object} rule - Rule object
   * @param {Object} context - Evaluation context
   * @returns {Boolean} - True if rule passes
   */
  evaluateRule(rule, context) {
    switch (rule.type) {
      case 'device':
        return this.checkDevice(rule, context);
      case 'time':
        return this.checkTime(rule, context);
      case 'location':
        return this.checkLocation(rule, context);
      case 'performance':
        return this.checkPerformance(rule, context);
      default:
        return true; // Unknown rule type - default to pass
    }
  }

  /**
   * Check device rule
   * @param {Object} rule - { type: 'device', value: 'mobile'|'desktop'|'tablet', action: 'show'|'hide' }
   * @param {Object} context - { device: 'mobile'|'desktop'|'tablet' }
   * @returns {Boolean}
   */
  checkDevice(rule, context) {
    const matches = rule.value === context.device;
    
    if (rule.action === 'show') {
      return matches; // Show if device matches
    } else {
      return !matches; // Hide if device matches
    }
  }

  /**
   * Check time rule
   * @param {Object} rule - { type: 'time', value: { startHour, endHour, daysOfWeek }, action: 'show'|'hide' }
   * @param {Object} context - { timestamp: Date }
   * @returns {Boolean}
   */
  checkTime(rule, context) {
    const timestamp = new Date(context.timestamp);
    const currentHour = timestamp.getHours();
    const currentDay = timestamp.getDay(); // 0-6 (Sunday-Saturday)

    // Check hour range
    const hourMatch = currentHour >= rule.value.startHour && 
                      currentHour <= rule.value.endHour;

    // Check day of week
    const dayMatch = rule.value.daysOfWeek.includes(currentDay);

    const matches = hourMatch && dayMatch;

    if (rule.action === 'show') {
      return matches;
    } else {
      return !matches;
    }
  }

  /**
   * Check location rule
   * @param {Object} rule - { type: 'location', value: { country, state }, action: 'show'|'hide' }
   * @param {Object} context - { location: { country, state } }
   * @returns {Boolean}
   */
  checkLocation(rule, context) {
    let matches = false;

    if (rule.value.country && context.location) {
      matches = rule.value.country === context.location.country;
      
      // If state is specified, check that too
      if (matches && rule.value.state) {
        matches = rule.value.state === context.location.state;
      }
    }

    if (rule.action === 'show') {
      return matches;
    } else {
      return !matches;
    }
  }

  /**
   * Check performance rule - FINALS CRITICAL FEATURE
   * Ranks links by clicks and evaluates based on percentile
   * @param {Object} rule - { type: 'performance', value: { percentile: 'top5'|'top10'|'bottom5' }, action: 'show'|'hide' }
   * @param {Object} context - { linkId, hubLinks: [array of all links in hub] }
   * @returns {Boolean}
   */
  checkPerformance(rule, context) {
    const allLinks = context.hubLinks || [];
    
    // No links to compare
    if (allLinks.length === 0) {
      return rule.action === 'show';
    }

    // Sort all links by clicks (descending) with rank
    const rankedLinks = allLinks
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .map((link, index) => ({
        ...link,
        rank: index + 1
      }));

    // Find current link's rank
    const currentLink = rankedLinks.find(l => l._id.toString() === context.linkId.toString());
    
    if (!currentLink) {
      return rule.action === 'show'; // Link not found - default behavior
    }

    // Evaluate based on percentile
    let isInPercentile = false;

    switch (rule.value.percentile) {
      case 'top1':
        isInPercentile = currentLink.rank === 1;
        break;
      case 'top5':
        // FINALS FIX: If hub has only 3 links, all 3 show in "top 5"
        isInPercentile = currentLink.rank <= Math.min(5, rankedLinks.length);
        break;
      case 'top10':
        isInPercentile = currentLink.rank <= Math.min(10, rankedLinks.length);
        break;
      case 'bottom5':
        const bottomStart = Math.max(1, rankedLinks.length - 4);
        isInPercentile = currentLink.rank >= bottomStart;
        break;
      case 'bottom10':
        const bottomStart10 = Math.max(1, rankedLinks.length - 9);
        isInPercentile = currentLink.rank >= bottomStart10;
        break;
      default:
        isInPercentile = true;
    }

    // Apply action
    if (rule.action === 'show') {
      return isInPercentile;
    } else {
      return !isInPercentile;
    }
  }

  /**
   * Get device type from user agent
   * @param {String} userAgent
   * @returns {String} - 'mobile'|'tablet'|'desktop'
   */
  static getDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
}

module.exports = new RuleEngine();
