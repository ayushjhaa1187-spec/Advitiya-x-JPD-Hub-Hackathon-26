const crypto = require('crypto');

const helpers = {
  // Generate random string
  generateRandomString: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Format date to readable string
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  },

  // Calculate pagination
  getPagination: (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
  },

  // Format pagination response
  getPaginationData: (count, page, limit) => {
    const totalPages = Math.ceil(count / limit);
    return {
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  },

  // Slugify string
  slugify: (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
};

module.exports = helpers;
