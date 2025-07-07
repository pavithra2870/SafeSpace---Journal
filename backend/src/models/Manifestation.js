const mongoose = require('mongoose');

const ManifestationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [300, 'Title cannot be more than 300 characters'],
  },
  category: {
    type: String,
    enum: ['personal', 'career', 'relationships', 'health', 'financial', 'spiritual', 'travel'],
    default: 'personal',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  fulfilled: {
    type: Boolean,
    default: false,
  },
  fulfilledDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Manifestation', ManifestationSchema);
