const Note = require('../models/Note');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { clean } = require('../utils/sanitizeHtml');
const asyncHandler = require('../utils/asyncHandler'); // optional

/**
 * POST /api/notes
 * Create a new note for the authenticated user.
 */
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body || {};

  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  const sanitizedContent = clean(content);

  const note = await Note.create({
    title,
    content: sanitizedContent,
    tags: tags || [],
    user: req.user.id,
  });

  logger.info({ noteId: note._id, userId: req.user.id }, 'Note created');

  res.status(201).json({
    success: true,
    data: note,
  });
});

/**
 * GET /api/notes
 * Returns all notes for the logged-in user.
 * Optional query params: ?search=keyword&sortBy=updatedAt
 */
const getNotes = asyncHandler(async (req, res) => {
  const { search, sortBy } = req.query;
  const filter = { user: req.user.id };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOption = sortBy === 'createdAt' ? { createdAt: -1 } : { updatedAt: -1 };

  const notes = await Note.find(filter).sort(sortOption).select('-__v');

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

/**
 * GET /api/notes/:id
 * Get a single note by ID (owner only).
 */
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  // Ownership check
  if (note.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this note', 403);
  }

  res.status(200).json({
    success: true,
    data: note,
  });
});

/**
 * PUT /api/notes/:id
 * Update an existing note (owner only).
 */
const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body || {};
  let note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this note', 403);
  }

  if (title) note.title = title;
  if (content) note.content = clean(content);
  if (tags !== undefined) note.tags = tags;

  await note.save();

  logger.info({ noteId: note._id }, 'Note updated');

  res.status(200).json({
    success: true,
    data: note,
  });
});

/**
 * DELETE /api/notes/:id
 * Delete a note (owner only).
 */
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this note', 403);
  }

  await note.deleteOne();

  logger.info({ noteId: note._id }, 'Note deleted');

  res.status(200).json({
    success: true,
    message: 'Note deleted',
  });
});

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};