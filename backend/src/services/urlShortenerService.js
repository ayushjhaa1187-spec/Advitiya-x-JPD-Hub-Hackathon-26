const axios = require('axios');

class URLShortenerService {
  constructor() {
    this.tinyurlAPI = 'https://tinyurl.com/api/create.php';
    this.bitlyToken = process.env.BITLY_ACCESS_TOKEN;
    this.bitlyAPI = 'https://api-ssl.bitly.com/v4/shorten';
  }

  /**
   * Shorten URL using TinyURL (free service, no token required)
   * @param {string} longUrl - Original URL
   * @returns {Promise<string>} Shortened URL
   */
  async shortenWithTinyURL(longUrl) {
    try {
      const response = await axios.post(this.tinyurlAPI, null, {
        params: {
          url: longUrl
        },
        timeout: 5000
      });

      if (response.data) {
        return response.data;
      }
      throw new Error('Invalid response from TinyURL');
    } catch (error) {
      console.error('TinyURL Shortening Error:', error.message);
      return null;
    }
  }

  /**
   * Shorten URL using Bitly API (requires authentication)
   * @param {string} longUrl - Original URL
   * @param {string} customTitle - Optional custom title
   * @returns {Promise<string>} Shortened URL
   */
  async shortenWithBitly(longUrl, customTitle = '') {
    if (!this.bitlyToken) {
      console.warn('Bitly token not configured');
      return null;
    }

    try {
      const payload = {
        long_url: longUrl,
        domain: 'bit.ly'
      };

      if (customTitle) {
        payload.title = customTitle;
      }

      const response = await axios.post(this.bitlyAPI, payload, {
        headers: {
          Authorization: `Bearer ${this.bitlyToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return response.data.link;
    } catch (error) {
      console.error('Bitly Shortening Error:', error.message);
      return null;
    }
  }

  /**
   * Shorten URL with fallback mechanism
   * @param {string} longUrl - Original URL
   * @param {string} provider - Preferred provider ('bitly', 'tinyurl', 'auto')
   * @returns {Promise<object>} { shortUrl, provider }
   */
  async shortenURL(longUrl, provider = 'auto') {
    try {
      let shortUrl = null;
      let usedProvider = null;

      if (provider === 'bitly' || provider === 'auto') {
        shortUrl = await this.shortenWithBitly(longUrl);
        if (shortUrl) {
          usedProvider = 'bitly';
          return { shortUrl, provider: usedProvider };
        }
      }

      if (provider === 'tinyurl' || provider === 'auto') {
        shortUrl = await this.shortenWithTinyURL(longUrl);
        if (shortUrl) {
          usedProvider = 'tinyurl';
          return { shortUrl, provider: usedProvider };
        }
      }

      return {
        shortUrl: null,
        provider: 'none',
        message: 'Could not shorten URL with available services'
      };
    } catch (error) {
      console.error('URL Shortening Error:', error);
      return { shortUrl: null, provider: 'none', error: error.message };
    }
  }

  /**
   * Generate custom short code (internal)
   * @param {string} hubId - Hub ID
   * @returns {string} Custom short code
   */
  generateCustomShortCode(hubId) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `hub-${hubId.substring(0, 4)}-${timestamp}-${randomStr}`.toLowerCase();
  }
}

module.exports = new URLShortenerService();
