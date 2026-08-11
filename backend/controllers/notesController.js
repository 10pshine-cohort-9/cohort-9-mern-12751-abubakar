const Note = require('../models/Note');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { clean } = require('../utils/sanitizeHTML');
const asyncHandler = require('../utils/asyncHandler');

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

const getNotes = asyncHandler(async (req, res) => {
  const { search, sortBy } = req.query;
  const filter = { user: req.user.id };

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (typeof search === 'string' && search.trim()) {
    const q = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
    ];
  }

  const sortOption =
    sortBy === 'createdAt'
      ? { createdAt: -1, _id: -1 }
      : { updatedAt: -1, _id: -1 };

  const notes = await Note.find(filter).sort(sortOption).select('-__v');

  res.status(200).json({
    success: true,
    count: notes.length,
    data: notes,
  });
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.user.toString() !== req.user.id) {
    throw new AppError('Note not found', 404);
  }

  res.status(200).json({
    success: true,
    data: note,
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body || {};
  let note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.user.toString() !== req.user.id) {
    throw new AppError('Note not found', 404);
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

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  if (note.user.toString() !== req.user.id) {
    throw new AppError('Note not found', 404);
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