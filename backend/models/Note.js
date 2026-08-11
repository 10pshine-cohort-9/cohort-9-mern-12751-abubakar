const mongoose = require('mongoose');
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
    },
    tags: {
      type: [String],
      default: [],
      set: (arr) => Array.isArray(arr)
        ? arr.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
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

noteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);