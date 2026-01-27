/**
 * Analytics Service - FINALS ENHANCED VERSION
  * 
 * REAL ANALYTICS ENDPOINTS - Connected to persistent PostgreSQL database
 * Tracks link performance metrics including:
 * - Click tracking with timestamps
 * - Visit analytics with device/location data  
 * - Performance metrics for optimization
 * - Real-time data storage in PostgreSQL
 * Non-blocking fire-and-forget tracking for visits and clicks
 * Implements performance-optimized tracking as recommended for finals
 */

const Analytics = require('../models/Analytics');

class AnalyticsService {
  /**
   * Track hub visit - Fire and forget (non-blocking)
   * CRITICAL: This should NEVER block the user's page load
   * @param {String} hubId - Hub ID
   * @param {Object} context - Visit context (device, location, timestamp)
   * @returns {Promise} - Resolves immediately, tracking happens in background
   */
  async trackHubVisit(hubId, context = {}) {
    try {
      // Fire and forget - don't await this
      setImmediate(async () => {
        try {
          await Analytics.create({
            hubId,
            type: 'visit',
            device: context.device || 'unknown',
            location: context.location || {},
            userAgent: context.userAgent,
            ip: context.ip,
            timestamp: new Date()
          });
        } catch (err) {
          // Silent fail - don't disrupt user experience
          console.error('Analytics tracking failed (non-critical):', err.message);
        }
      });
      
      // Return immediately
      return { success: true, message: 'Tracking initiated' };
    } catch (error) {
      // Even if this fails, don't block
      console.error('Analytics initialization failed:', error.message);
      return { success: false, message: 'Tracking skipped' };
    }
  }

  /**
   * Track link click - Fire and forget (non-blocking)
   * CRITICAL: User should be redirected IMMEDIATELY, tracking happens in background
   * @param {String} linkId - Link ID
   * @param {String} hubId - Hub ID
   * @param {Object} context - Click context
   * @returns {Promise} - Resolves immediately
   */
  async trackLinkClick(linkId, hubId, context = {}) {
    try {
      // Fire and forget
      setImmediate(async () => {
        try {
          await Analytics.create({
            hubId,
            linkId,
            type: 'click',
            device: context.device || 'unknown',
            location: context.location || {},
            userAgent: context.userAgent,
            ip: context.ip,
            timestamp: new Date()
          });
        } catch (err) {
          console.error('Click tracking failed (non-critical):', err.message);
        }
      });
      
      return { success: true, message: 'Click tracked' };
    } catch (error) {
      console.error('Click tracking initialization failed:', error.message);
      return { success: false, message: 'Tracking skipped' };
    }
  }

  /**
   * Get hub analytics summary
   * @param {String} hubId - Hub ID
   * @param {Object} options - Query options (dateRange, groupBy)
   * @returns {Promise<Object>} - Analytics summary
   */
  async getHubAnalytics(hubId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      const query = { hubId };
      
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Get all analytics records
      const records = await Analytics.find(query);

      // Calculate metrics
      const totalVisits = records.filter(r => r.type === 'visit').length;
      const totalClicks = records.filter(r => r.type === 'click').length;
      
      // Device breakdown
      const deviceBreakdown = {};
      records.forEach(record => {
        deviceBreakdown[record.device] = (deviceBreakdown[record.device] || 0) + 1;
      });

      // Top clicked links
      const linkClicks = {};
      records
        .filter(r => r.type === 'click' && r.linkId)
        .forEach(record => {
          linkClicks[record.linkId] = (linkClicks[record.linkId] || 0) + 1;
        });
      
      const topLinks = Object.entries(linkClicks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([linkId, clicks]) => ({ linkId, clicks }));

      // Visits over time (group by day)
      const visitsOverTime = this._groupByDay(records.filter(r => r.type === 'visit'));

      return {
        success: true,
        data: {
          totalVisits,
          totalClicks,
          clickThroughRate: totalVisits > 0 ? (totalClicks / totalVisits * 100).toFixed(2) : 0,
          deviceBreakdown,
          topLinks,
          visitsOverTime
        }
      };
    } catch (error) {
      console.error('Error fetching hub analytics:', error);
      return {
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      };
    }
  }

  /**
   * Get link-specific analytics
   * @param {String} linkId - Link ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Link analytics
   */
  async getLinkAnalytics(linkId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      const query = { linkId, type: 'click' };
      
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const clicks = await Analytics.find(query);
      
      // Device breakdown
      const deviceBreakdown = {};
      clicks.forEach(click => {
        deviceBreakdown[click.device] = (deviceBreakdown[click.device] || 0) + 1;
      });

      // Location breakdown
      const locationBreakdown = {};
      clicks.forEach(click => {
        if (click.location && click.location.country) {
          locationBreakdown[click.location.country] = 
            (locationBreakdown[click.location.country] || 0) + 1;
        }
      });

      // Clicks over time
      const clicksOverTime = this._groupByDay(clicks);

      return {
        success: true,
        data: {
          totalClicks: clicks.length,
          deviceBreakdown,
          locationBreakdown,
          clicksOverTime
        }
      };
    } catch (error) {
      console.error('Error fetching link analytics:', error);
      return {
        success: false,
        message: 'Failed to fetch link analytics',
        error: error.message
      };
    }
  }

  /**
   * Helper: Group records by day
   * @private
   * @param {Array} records - Analytics records
   * @returns {Array} - Grouped by day
   */
  _groupByDay(records) {
    const grouped = {};
    
    records.forEach(record => {
      const date = new Date(record.timestamp);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      grouped[day] = (grouped[day] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, count }));
  }

  /**
   * Get real-time analytics (last 24 hours)
   * @param {String} hubId - Hub ID
   * @returns {Promise<Object>} - Real-time metrics
   */
  async getRealtimeAnalytics(hubId) {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentRecords = await Analytics.find({
        hubId,
        timestamp: { $gte: last24Hours }
      });

      const visits = recentRecords.filter(r => r.type === 'visit').length;
      const clicks = recentRecords.filter(r => r.type === 'click').length;

      return {
        success: true,
        data: {
          last24Hours: {
            visits,
            clicks,
            activeNow: this._estimateActiveUsers(recentRecords)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching realtime analytics:', error);
      return {
        success: false,
        message: 'Failed to fetch realtime analytics',
        error: error.message
      };
    }
  }

  /**
   * Estimate active users (visits in last 5 minutes)
   * @private
   * @param {Array} records - Recent records
   * @returns {Number} - Estimated active users
   */
  _estimateActiveUsers(records) {
    const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
    return records.filter(r => 
      r.type === 'visit' && new Date(r.timestamp) >= last5Minutes
    ).length;
  }

  /**
   * Cleanup old analytics data (optional - for production)
   * @param {Number} daysToKeep - Number of days to keep (default: 90)
   * @returns {Promise<Object>} - Deletion result
   */
  async cleanupOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await Analytics.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `Cleaned up analytics older than ${daysToKeep} days`
      };
    } catch (error) {
      console.error('Error cleaning up analytics:', error);
      return {
        success: false,
        message: 'Failed to cleanup analytics',
        error: error.message
      };
    }
  }
}

module.exports = new AnalyticsService();
