const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createLink,
  getAllLinks: getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  trackClick,
  toggleFavorite,
  getPopularLinks,
  searchLinks,
  bulkDelete
} = require('../controllers/linkController');

const router = express.Router();

// Public routes
router.get('/popular', getPopularLinks);
router.get('/search', searchLinks);

// Protected routes (require authentication)
router.post('/', protect, createLink);
router.get('/', protect, getLinks);
router.get('/:id', protect, getLinkById);
router.put('/:id', protect, updateLink);
router.delete('/:id', protect, deleteLink);
router.post('/:id/click', trackClick);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/bulk/delete', protect, bulkDelete);

module.exports = router;            
