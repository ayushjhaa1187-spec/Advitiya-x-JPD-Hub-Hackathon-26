const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'green'],
    default: 'dark'
  },
  customization: {
    backgroundColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#10b981' },
    buttonStyle: { type: String, default: 'rounded' },
    font: { type: String, default: 'Inter' }
  },
  links: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    icon: String,
    order: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    },
    clicks: {
      type: Number,
      default: 0
    }
  }],
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalClicks: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  settings: {
    showAnalytics: {
      type: Boolean,
      default: false
    },
    password: String,
    seo: {
      title: String,
      description: String,
      image: String
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  qrCode: String
}, {
  timestamps: true
});

// Indexes for performance
hubSchema.index({ userId: 1, createdAt: -1 });
hubSchema.index({ slug: 1 });
hubSchema.index({ active: 1 });

// Virtual for hub URL
hubSchema.virtual('url').get(function() {
  return `/h/${this.slug}`;
});

// Pre-save middleware to generate slug
hubSchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Method to increment view count
hubSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  this.analytics.lastViewed = new Date();
  await this.save();
};

// Method to increment link click
hubSchema.methods.incrementLinkClick = async function(linkId) {
  const link = this.links.id(linkId);
  if (link) {
    link.clicks += 1;
    this.analytics.totalClicks += 1;
    await this.save();
  }
};

// Static method to get user hubs
hubSchema.statics.getUserHubs = function(userId) {
  return this.find({ userId, active: true })
    .sort({ createdAt: -1 })
    .select('-__v');
};

module.exports = mongoose.model('Hub', hubSchema);
