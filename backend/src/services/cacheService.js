/**
 * Cache Service - FINALS ENHANCED VERSION
 * Implements 10x faster public hub loads with node-cache
 * As recommended in Recommendation.pdf for scalability
 */

const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // Initialize cache with TTL (Time To Live)
    this.hubCache = new NodeCache({
      stdTTL: 600, // 10 minutes default TTL
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false // Better performance - return references
    });

    this.linkCache = new NodeCache({
      stdTTL: 300, // 5 minutes for links
      checkperiod: 60
    });

    this.analyticsCache = new NodeCache({
      stdTTL: 60, // 1 minute for analytics (more dynamic)
      checkperiod: 30
    });
  }

  /**
   * Get cached hub by slug
   * CRITICAL: Public hubs accessed frequently - cache prevents DB overload
   * @param {String} slug - Hub slug
   * @returns {Object|null} - Cached hub or null
   */
  getHub(slug) {
    try {
      const cached = this.hubCache.get(slug);
      if (cached) {
        console.log(`[CACHE HIT] Hub: ${slug}`);
        return cached;
      }
      console.log(`[CACHE MISS] Hub: ${slug}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set hub in cache
   * @param {String} slug - Hub slug
   * @param {Object} hubData - Hub data to cache
   * @param {Number} ttl - Optional custom TTL in seconds
   * @returns {Boolean} - Success status
   */
  setHub(slug, hubData, ttl = 600) {
    try {
      this.hubCache.set(slug, hubData, ttl);
      console.log(`[CACHE SET] Hub: ${slug} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  /**
   * Invalidate hub cache when updated
   * CRITICAL: Called after hub update to ensure fresh data
   * @param {String} slug - Hub slug to invalidate
   * @returns {Number} - Number of deleted entries (1 if successful)
   */
  invalidateHub(slug) {
    try {
      const deleted = this.hubCache.del(slug);
      console.log(`[CACHE INVALIDATE] Hub: ${slug} (${deleted} entries cleared)`);
      return deleted;
    } catch (error) {
      console.error('Cache invalidation error:', error.message);
      return 0;
    }
  }

  /**
   * Get cached link
   * @param {String} linkId - Link ID
   * @returns {Object|null} - Cached link or null
   */
  getLink(linkId) {
    try {
      const cached = this.linkCache.get(`link_${linkId}`);
      if (cached) {
        console.log(`[CACHE HIT] Link: ${linkId}`);
        return cached;
      }
      return null;
    } catch (error) {
      console.error('Link cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set link in cache
   * @param {String} linkId - Link ID
   * @param {Object} linkData - Link data
   * @param {Number} ttl - Optional TTL
   * @returns {Boolean} - Success status
   */
  setLink(linkId, linkData, ttl = 300) {
    try {
      this.linkCache.set(`link_${linkId}`, linkData, ttl);
      return true;
    } catch (error) {
      console.error('Link cache set error:', error.message);
      return false;
    }
  }

  /**
   * Invalidate link cache
   * @param {String} linkId - Link ID to invalidate
   * @returns {Number} - Deleted count
   */
  invalidateLink(linkId) {
    try {
      return this.linkCache.del(`link_${linkId}`);
    } catch (error) {
      console.error('Link cache invalidation error:', error.message);
      return 0;
    }
  }

  /**
   * Invalidate all links in a hub (when hub is updated)
   * @param {Array} linkIds - Array of link IDs
   * @returns {Number} - Total deleted count
   */
  invalidateHubLinks(linkIds = []) {
    try {
      let deletedCount = 0;
      linkIds.forEach(linkId => {
        deletedCount += this.linkCache.del(`link_${linkId}`);
      });
      console.log(`[CACHE INVALIDATE] Hub links: ${deletedCount} links cleared`);
      return deletedCount;
    } catch (error) {
      console.error('Hub links cache invalidation error:', error.message);
      return 0;
    }
  }

  /**
   * Get cached analytics
   * @param {String} key - Analytics cache key (e.g., 'hub_123_analytics')
   * @returns {Object|null} - Cached analytics or null
   */
  getAnalytics(key) {
    try {
      const cached = this.analyticsCache.get(key);
      if (cached) {
        console.log(`[CACHE HIT] Analytics: ${key}`);
        return cached;
      }
      return null;
    } catch (error) {
      console.error('Analytics cache get error:', error.message);
      return null;
    }
  }

  /**
   * Set analytics in cache
   * @param {String} key - Analytics cache key
   * @param {Object} data - Analytics data
   * @param {Number} ttl - TTL (default 60s for analytics)
   * @returns {Boolean} - Success status
   */
  setAnalytics(key, data, ttl = 60) {
    try {
      this.analyticsCache.set(key, data, ttl);
      return true;
    } catch (error) {
      console.error('Analytics cache set error:', error.message);
      return false;
    }
  }

  /**
   * Invalidate analytics cache
   * @param {String} key - Analytics cache key
   * @returns {Number} - Deleted count
   */
  invalidateAnalytics(key) {
    try {
      return this.analyticsCache.del(key);
    } catch (error) {
      console.error('Analytics cache invalidation error:', error.message);
      return 0;
    }
  }

  /**
   * Clear ALL cache (use with caution)
   * @returns {Object} - Cleared counts
   */
  clearAll() {
    try {
      const hubCount = this.hubCache.keys().length;
      const linkCount = this.linkCache.keys().length;
      const analyticsCount = this.analyticsCache.keys().length;

      this.hubCache.flushAll();
      this.linkCache.flushAll();
      this.analyticsCache.flushAll();

      console.log('[CACHE CLEAR] All caches flushed');
      return {
        hubsCleared: hubCount,
        linksCleared: linkCount,
        analyticsCleared: analyticsCount
      };
    } catch (error) {
      console.error('Cache clear all error:', error.message);
      return { hubsCleared: 0, linksCleared: 0, analyticsCleared: 0 };
    }
  }

  /**
   * Get cache statistics (for monitoring)
   * @returns {Object} - Cache stats
   */
  getStats() {
    try {
      return {
        hubs: {
          keys: this.hubCache.keys().length,
          hits: this.hubCache.getStats().hits,
          misses: this.hubCache.getStats().misses,
          hitRate: this._calculateHitRate(this.hubCache.getStats())
        },
        links: {
          keys: this.linkCache.keys().length,
          hits: this.linkCache.getStats().hits,
          misses: this.linkCache.getStats().misses,
          hitRate: this._calculateHitRate(this.linkCache.getStats())
        },
        analytics: {
          keys: this.analyticsCache.keys().length,
          hits: this.analyticsCache.getStats().hits,
          misses: this.analyticsCache.getStats().misses,
          hitRate: this._calculateHitRate(this.analyticsCache.getStats())
        }
      };
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return null;
    }
  }

  /**
   * Calculate cache hit rate
   * @private
   * @param {Object} stats - Cache stats
   * @returns {String} - Hit rate percentage
   */
  _calculateHitRate(stats) {
    const total = stats.hits + stats.misses;
    if (total === 0) return '0%';
    return `${((stats.hits / total) * 100).toFixed(2)}%`;
  }

  /**
   * Warm up cache with popular hubs (optional - for production)
   * @param {Array} hubs - Array of hub objects
   * @returns {Number} - Number of hubs cached
   */
  warmUpCache(hubs = []) {
    try {
      let cachedCount = 0;
      hubs.forEach(hub => {
        if (hub.slug) {
          this.setHub(hub.slug, hub);
          cachedCount++;
        }
      });
      console.log(`[CACHE WARMUP] ${cachedCount} hubs preloaded`);
      return cachedCount;
    } catch (error) {
      console.error('Cache warmup error:', error.message);
      return 0;
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
