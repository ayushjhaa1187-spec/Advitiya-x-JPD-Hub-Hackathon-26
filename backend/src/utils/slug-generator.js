/**
 * Slug/Short Code Generator Utility
 * Generates unique short codes for URLs
 * Requires: npm install nanoid
 */

const { customAlphabet } = require('nanoid');

// Custom alphabet without ambiguous characters (no 0, O, I, l)
const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

// Create nanoid function with custom alphabet and length
const nanoid = customAlphabet(alphabet, 6);

/**
 * Generate a random short code
 * @param {number} length - Length of the slug (default: 6)
 * @returns {string} - Random slug
 */
function generateSlug(length = 6) {
    if (length !== 6) {
        // Create custom nanoid for different lengths
        const customNanoid = customAlphabet(alphabet, length);
        return customNanoid();
    }
    return nanoid();
}

/**
 * Generate a memorable slug (lowercase only)
 * @param {number} length - Length of the slug (default: 6)
 * @returns {string} - Memorable slug
 */
function generateMemorableSlug(length = 6) {
    const memorableAlphabet = 'abcdefghijkmnopqrstuvwxyz23456789';
    const memorableNanoid = customAlphabet(memorableAlphabet, length);
    return memorableNanoid();
}

/**
 * Validate if a slug is safe to use
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid
 */
function isValidSlug(slug) {
    // Check length
    if (!slug || slug.length < 3 || slug.length > 20) {
        return false;
    }
    
    // Check for valid characters only
    const validPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validPattern.test(slug)) {
        return false;
    }
    
    // Check for reserved words
    const reservedWords = [
        'api', 'admin', 'dashboard', 'login', 'register', 
        'logout', 'auth', 'public', 'static', 'assets',
        'health', 'status', 'docs', 'swagger'
    ];
    
    if (reservedWords.includes(slug.toLowerCase())) {
        return false;
    }
    
    return true;
}

/**
 * Generate a custom slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slugified text
 */
function slugifyText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/[\s_-]+/g, '-')  // Replace spaces with -
        .replace(/^-+|-+$/g, '');  // Trim dashes
}

module.exports = {
    generateSlug,
    generateMemorableSlug,
    isValidSlug,
    slugifyText
};
