const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const QRCode = require('qrcode');
const {
  createLink,
  getAllLinks: getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  trackClick,
  trackClickAndRedirect,
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
router.get('/:id/redirect', trackClickAndRedirect); // NEW: Public redirect with analytics
router.post('/:id/click', trackClick);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/bulk/delete', protect, bulkDelete);

// QR Code generation
router.get('/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const link = await require('../models/Link').findByPk(id);
        
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }
        
        const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${link.shortCode}`;
        
        // Generate QR code as data URL
        const qrCode = await QRCode.toDataURL(shortUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        res.json({ qrCode, shortUrl });
    } catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

module.exports = router;            
