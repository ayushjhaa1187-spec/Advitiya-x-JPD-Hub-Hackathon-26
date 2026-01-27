const express = require('express');
const router = express.Router();
const {
  getUserHubs,
  getHubBySlug,
  getHub,
  createHub,
  updateHub,
  deleteHub,
  trackLinkClick,
  getHubAnalytics,
  regenerateQRCode
} = require('../controllers/hubsController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/slug/:slug', getHubBySlug);
router.post('/:id/links/:linkId/click', trackLinkClick);

// Protected routes
router.use(protect);

router.route('/')
  .get(getUserHubs)
  .post(createHub);

router.route('/:id')
  .get(getHub)
  .put(updateHub)
  .delete(deleteHub);

router.get('/:id/analytics', getHubAnalytics);
router.post('/:id/qrcode', regenerateQRCode);

module.exports = router;
