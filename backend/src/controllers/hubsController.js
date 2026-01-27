const Hub = require('../models/Hub');
const QRCode = require('qrcode');

// @desc    Get all hubs for authenticated user
// @route   GET /api/hubs
// @access  Private
exports.getUserHubs = async (req, res) => {
  try {
    const hubs = await Hub.getUserHubs(req.user.id);
    
    res.status(200).json({
      success: true,
      count: hubs.length,
      data: hubs
    });
  } catch (error) {
    console.error('Get hubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hubs',
      error: error.message
    });
  }
};

// @desc    Get hub by slug (public)
// @route   GET /api/hubs/slug/:slug
// @access  Public
exports.getHubBySlug = async (req, res) => {
  try {
    const hub = await Hub.findOne({ 
      slug: req.params.slug, 
      active: true 
    }).select('-userId -__v');
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }

    // Increment view count
    await hub.incrementViews();
    
    res.status(200).json({
      success: true,
      data: hub
    });
  } catch (error) {
    console.error('Get hub by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hub',
      error: error.message
    });
  }
};

// @desc    Get single hub by ID
// @route   GET /api/hubs/:id
// @access  Private
exports.getHub = async (req, res) => {
  try {
    const hub = await Hub.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: hub
    });
  } catch (error) {
    console.error('Get hub error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hub',
      error: error.message
    });
  }
};

// @desc    Create new hub
// @route   POST /api/hubs
// @access  Private
exports.createHub = async (req, res) => {
  try {
    const { name, description, theme, links } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Hub name is required'
      });
    }

    const hubData = {
      userId: req.user.id,
      name,
      description: description || '',
      theme: theme || 'dark',
      links: links || []
    };

    const hub = await Hub.create(hubData);
    
    // Generate QR code
    const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/h/${hub.slug}`;
    const qrCode = await QRCode.toDataURL(hubUrl);
    hub.qrCode = qrCode;
    await hub.save();
    
    res.status(201).json({
      success: true,
      data: hub
    });
  } catch (error) {
    console.error('Create hub error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A hub with this slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create hub',
      error: error.message
    });
  }
};

// @desc    Update hub
// @route   PUT /api/hubs/:id
// @access  Private
exports.updateHub = async (req, res) => {
  try {
    const hub = await Hub.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }

    const { name, description, theme, customization, links, settings, active } = req.body;
    
    if (name) hub.name = name;
    if (description !== undefined) hub.description = description;
    if (theme) hub.theme = theme;
    if (customization) hub.customization = { ...hub.customization, ...customization };
    if (links) hub.links = links;
    if (settings) hub.settings = { ...hub.settings, ...settings };
    if (active !== undefined) hub.active = active;
    
    await hub.save();
    
    res.status(200).json({
      success: true,
      data: hub
    });
  } catch (error) {
    console.error('Update hub error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hub',
      error: error.message
    });
  }
};

// @desc    Delete hub
// @route   DELETE /api/hubs/:id
// @access  Private
exports.deleteHub = async (req, res) => {
  try {
    const hub = await Hub.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }
    
    await hub.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Hub deleted successfully'
    });
  } catch (error) {
    console.error('Delete hub error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hub',
      error: error.message
    });
  }
};

// @desc    Track link click
// @route   POST /api/hubs/:id/links/:linkId/click
// @access  Public
exports.trackLinkClick = async (req, res) => {
  try {
    const hub = await Hub.findOne({ 
      _id: req.params.id,
      active: true 
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }
    
    await hub.incrementLinkClick(req.params.linkId);
    
    res.status(200).json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

// @desc    Get hub analytics
// @route   GET /api/hubs/:id/analytics
// @access  Private
exports.getHubAnalytics = async (req, res) => {
  try {
    const hub = await Hub.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }
    
    const analytics = {
      totalViews: hub.analytics.totalViews,
      totalClicks: hub.analytics.totalClicks,
      lastViewed: hub.analytics.lastViewed,
      clickThroughRate: hub.analytics.totalViews > 0 
        ? ((hub.analytics.totalClicks / hub.analytics.totalViews) * 100).toFixed(2)
        : 0,
      links: hub.links.map(link => ({
        title: link.title,
        url: link.url,
        clicks: link.clicks,
        active: link.active
      }))
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// @desc    Regenerate QR code
// @route   POST /api/hubs/:id/qrcode
// @access  Private
exports.regenerateQRCode = async (req, res) => {
  try {
    const hub = await Hub.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!hub) {
      return res.status(404).json({
        success: false,
        message: 'Hub not found'
      });
    }
    
    const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/h/${hub.slug}`;
    const qrCode = await QRCode.toDataURL(hubUrl);
    hub.qrCode = qrCode;
    await hub.save();
    
    res.status(200).json({
      success: true,
      data: { qrCode }
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate QR code',
      error: error.message
    });
  }
};
