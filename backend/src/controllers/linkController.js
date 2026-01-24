const Link = require('../models/Link');
const Hub = require('../models/Hub');
const { validationResult } = require('express-validator');

// Create a new link
exports.createLink = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const {
      url,
      title,
      description,
      category,
      tags,
      hubId,
      ruleOperator
    } = req.body;

    // Validate hub ownership if hubId is provided
    if (hubId) {
      const hub = await Hub.findOne({
        where: { id: hubId, userId: req.user.id }
      });
      
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found or you do not have permission to add links to this hub'
        });
      }
    }

    // Create the link
    const link = await Link.create({
      url,
      title,
      description,
      category,
      tags: tags || [],
      hubId,
      userId: req.user.id,
      ruleOperator: ruleOperator || 'OR',
      isActive: true,
      clicks: 0
    });

    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      data: link
    });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create link',
      error: error.message
    });
  }
};

// Get all links for the authenticated user
exports.getAllLinks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      hubId,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
      isActive,
      isFavorite
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    // Apply filters
    if (category) where.category = category;
    if (hubId) where.hubId = hubId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isFavorite !== undefined) where.isFavorite = isFavorite === 'true';

    // Search functionality
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { url: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: links } = await Link.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      include: [
        {
          model: Hub,
          as: 'hub',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links',
      error: error.message
    });
  }
};

// Get a single link by ID
exports.getLinkById = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: Hub,
          as: 'hub',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    res.status(200).json({
      success: true,
      data: link
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch link',
      error: error.message
    });
  }
};

// Update a link
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      url,
      title,
      description,
      category,
      tags,
      hubId,
      isActive,
      ruleOperator
    } = req.body;

    // Find the link
    const link = await Link.findOne({
      where: { id, userId: req.user.id }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    // Validate hub ownership if hubId is being changed
    if (hubId && hubId !== link.hubId) {
      const hub = await Hub.findOne({
        where: { id: hubId, userId: req.user.id }
      });
      
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found or you do not have permission'
        });
      }
    }

    // Update the link
    await link.update({
      url: url || link.url,
      title: title || link.title,
      description: description !== undefined ? description : link.description,
      category: category !== undefined ? category : link.category,
      tags: tags !== undefined ? tags : link.tags,
      hubId: hubId !== undefined ? hubId : link.hubId,
      isActive: isActive !== undefined ? isActive : link.isActive,
      ruleOperator: ruleOperator !== undefined ? ruleOperator : link.ruleOperator
    });

    res.status(200).json({
      success: true,
      message: 'Link updated successfully',
      data: link
    });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update link',
      error: error.message
    });
  }
};

// Delete a link
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOne({
      where: { id, userId: req.user.id }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    await link.destroy();

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete link',
      error: error.message
    });
  }
};

// Increment link clicks (track analytics)
exports.trackClick = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOne({
      where: { id }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    const newClickCount = await link.incrementClicks();

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      data: {
        linkId: link.id,
        clicks: newClickCount,
        url: link.url
      }
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click',
      error: error.message
    });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOne({
      where: { id, userId: req.user.id }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    const isFavorite = await link.toggleFavorite();

    res.status(200).json({
      success: true,
      message: `Link ${isFavorite ? 'added to' : 'removed from'} favorites`,
      data: { isFavorite }
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
};

// Get popular links
exports.getPopularLinks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const links = await Link.getPopularLinks(parseInt(limit));

    res.status(200).json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching popular links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular links',
      error: error.message
    });
  }
};

// Search links
exports.searchLinks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const links = await Link.searchLinks(req.user.id, q);

    res.status(200).json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error searching links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search links',
      error: error.message
    });
  }
};

// Bulk operations
exports.bulkDelete = async (req, res) => {
  try {
    const { linkIds } = req.body;

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid link IDs provided'
      });
    }

    const result = await Link.destroy({
      where: {
        id: linkIds,
        userId: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      message: `${result} link(s) deleted successfully`,
      deletedCount: result
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete links',
      error: error.message
    });
  }
};
