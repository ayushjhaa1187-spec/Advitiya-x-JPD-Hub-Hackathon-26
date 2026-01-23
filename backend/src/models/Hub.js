const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Hub title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  links: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  visits: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
hubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from title if not provided
hubSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

// Increment visit count
hubSchema.methods.incrementVisits = async function() {
  this.visits += 1;
  await this.save();
};

module.exports = mongoose.model('Hub', hubSchema);
