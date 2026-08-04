const mongoose = require('mongoose');

/**
 * Schema for user notes with rich-text content.
 */
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      // will be sanitized HTML
    },
    tags: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for user-specific queries sorted by update time
noteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);