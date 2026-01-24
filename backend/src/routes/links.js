const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const linkController = require('../controllers/linkController');
const auth = require('../middleware/auth');

// Validation rules
const createLinkValidation = [
  body('url')
    .notEmpty().withMessage('URL is required')
    .isURL().withMessage('Must be a valid URL'),
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['Technology', 'Education', 'Entertainment', 'Business', 'Health', 'Science', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('hubId')
    .optional()
    .isInt().withMessage('Hub ID must be an integer'),
  body('ruleOperator')
    .optional()
    .isIn(['AND', 'OR']).withMessage('Rule operator must be either AND or OR')
];

const updateLinkValidation = [
  body('url')
    .optional()
    .isURL().withMessage('Must be a valid URL'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['Technology', 'Education', 'Entertainment', 'Business', 'Health', 'Science', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('hubId')
    .optional()
    .isInt().withMessage('Hub ID must be an integer'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  body('ruleOperator')
    .optional()
    .isIn(['AND', 'OR']).withMessage('Rule operator must be either AND or OR')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const idValidation = [
  param('id')
    .isInt().withMessage('ID must be an integer')
];

// Routes

// Create a new link
router.post('/',
  auth,
  createLinkValidation,
  linkController.createLink
);

// Get all links (with pagination and filters)
router.get('/',
  auth,
  paginationValidation,
  linkController.getAllLinks
);

// Get popular links
router.get('/popular',
  auth,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  linkController.getPopularLinks
);

// Search links
router.get('/search',
  auth,
  query('q').notEmpty().withMessage('Search query is required'),
  linkController.searchLinks
);

// Get a single link by ID
router.get('/:id',
  auth,
  idValidation,
  linkController.getLinkById
);

// Update a link
router.put('/:id',
  auth,
  idValidation,
  updateLinkValidation,
  linkController.updateLink
);

// Delete a link
router.delete('/:id',
  auth,
  idValidation,
  linkController.deleteLink
);

// Track click on a link
router.post('/:id/click',
  idValidation,
  linkController.trackClick
);

// Toggle favorite status
router.post('/:id/favorite',
  auth,
  idValidation,
  linkController.toggleFavorite
);

// Bulk delete links
router.post('/bulk-delete',
  auth,
  body('linkIds')
    .isArray({ min: 1 }).withMessage('Link IDs array is required')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id))) {
        throw new Error('All link IDs must be integers');
      }
      return true;
    }),
  linkController.bulkDelete
);

module.exports = router;
