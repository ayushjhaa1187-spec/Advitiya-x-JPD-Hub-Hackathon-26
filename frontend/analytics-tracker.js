/**
 * Analytics Tracker for Smart Link Hub
 * Tracks total visits, link clicks, and provides performance analysis
 */

const AnalyticsTracker = (() => {
  const STORAGE_KEY = 'smartLinkHub_analytics';
  const LINKS_KEY = 'smartLinkHub_links';
  const VISITS_KEY = 'smartLinkHub_totalVisits';

  // Initialize or get analytics data
  const getAnalytics = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  // Initialize or get links data
  const getLinks = () => {
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  // Get total visits
  const getTotalVisits = () => {
    const visits = localStorage.getItem(VISITS_KEY);
    return visits ? parseInt(visits) : 0;
  };

  // Increment total visits
  const incrementTotalVisits = () => {
    const current = getTotalVisits();
    localStorage.setItem(VISITS_KEY, (current + 1).toString());
    return current + 1;
  };

  // Track a link click
  const trackLinkClick = (linkId, linkUrl, linkTitle = 'Untitled') => {
    const links = getLinks();
    const timestamp = new Date().toISOString();

    if (!links[linkId]) {
      links[linkId] = {
        id: linkId,
        originalUrl: linkUrl,
        title: linkTitle,
        clicks: 0,
        createdAt: timestamp,
        lastClicked: null,
        clickHistory: []
      };
    }

    links[linkId].clicks += 1;
    links[linkId].lastClicked = timestamp;
    links[linkId].clickHistory.push({
      timestamp: timestamp,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });

    // Keep only last 100 clicks in history for performance
    if (links[linkId].clickHistory.length > 100) {
      links[linkId].clickHistory = links[linkId].clickHistory.slice(-100);
    }

    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    return links[linkId];
  };

  // Get analytics for a specific link
  const getLinkAnalytics = (linkId) => {
    const links = getLinks();
    return links[linkId] || null;
  };

  // Get all links analytics
  const getAllLinksAnalytics = () => {
    return getLinks();
  };

  // Get top performing links
  const getTopLinks = (limit = 5) => {
    const links = Object.values(getLinks());
    return links
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  };

  // Get least performing links
  const getLeastPerformingLinks = (limit = 5) => {
    const links = Object.values(getLinks());
    return links
      .filter(link => link.clicks > 0)
      .sort((a, b) => a.clicks - b.clicks)
      .slice(0, limit);
  };

  // Get links with no clicks
  const getUnusedLinks = () => {
    const links = Object.values(getLinks());
    return links.filter(link => link.clicks === 0);
  };

  // Get statistics summary
  const getStats = () => {
    const links = Object.values(getLinks());
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const activeLinks = links.filter(link => link.clicks > 0).length;
    const unusedLinks = links.filter(link => link.clicks === 0).length;

    return {
      totalVisits: getTotalVisits(),
      totalLinks: links.length,
      totalClicks: totalClicks,
      activeLinks: activeLinks,
      unusedLinks: unusedLinks,
      averageClicksPerLink: links.length > 0 ? (totalClicks / links.length).toFixed(2) : 0,
      topPerformer: links.length > 0 ? getTopLinks(1)[0] : null,
      leastPerformer: links.length > 0 && activeLinks > 0 ? getLeastPerformingLinks(1)[0] : null
    };
  };

  // Create a new link and track it
  const createLink = (linkId, originalUrl, title = 'Untitled') => {
    const links = getLinks();
    const timestamp = new Date().toISOString();

    links[linkId] = {
      id: linkId,
      originalUrl: originalUrl,
      title: title,
      clicks: 0,
      createdAt: timestamp,
      lastClicked: null,
      clickHistory: []
    };

    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    return links[linkId];
  };

  // Delete link analytics
  const deleteLink = (linkId) => {
    const links = getLinks();
    delete links[linkId];
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    return true;
  };

  // Reset all analytics (use with caution)
  const resetAnalytics = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LINKS_KEY);
    localStorage.removeItem(VISITS_KEY);
    return true;
  };

  // Export analytics as JSON
  const exportAnalytics = () => {
    return {
      exportDate: new Date().toISOString(),
      stats: getStats(),
      allLinks: getAllLinksAnalytics(),
      totalVisits: getTotalVisits()
    };
  };

  // Get click rate for a link (clicks per day)
  const getClickRate = (linkId) => {
    const link = getLinkAnalytics(linkId);
    if (!link) return 0;

    const createdDate = new Date(link.createdAt);
    const now = new Date();
    const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);

    return daysDiff > 0 ? (link.clicks / daysDiff).toFixed(2) : link.clicks;
  };

  // Get performance metrics for dashboard
  const getDashboardMetrics = () => {
    const links = Object.values(getLinks());
    const stats = getStats();

    return {
      totalVisits: stats.totalVisits,
      totalLinks: stats.totalLinks,
      todayClicks: getTodayClicks(),
      activeRules: 0, // Placeholder for smart rules
      totalClicks: stats.totalClicks,
      topPerformers: getTopLinks(5),
      leastPerformers: getLeastPerformingLinks(5),
      unusedLinks: getUnusedLinks()
    };
  };

  // Get today's click count
  const getTodayClicks = () => {
    const links = Object.values(getLinks());
    const today = new Date().toDateString();

    return links.reduce((total, link) => {
      const todayClicks = link.clickHistory.filter(click => {
        return new Date(click.timestamp).toDateString() === today;
      }).length;
      return total + todayClicks;
    }, 0);
  };

  // Public API
  return {
    trackLinkClick,
    getLinkAnalytics,
    getAllLinksAnalytics,
    getTopLinks,
    getLeastPerformingLinks,
    getUnusedLinks,
    getStats,
    createLink,
    deleteLink,
    resetAnalytics,
    exportAnalytics,
    getClickRate,
    getDashboardMetrics,
    incrementTotalVisits,
    getTotalVisits,
    getTodayClicks
  };
})();

// Track page visit on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AnalyticsTracker.incrementTotalVisits();
  });
} else {
  AnalyticsTracker.incrementTotalVisits();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsTracker;
}
