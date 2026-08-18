import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RichTextEditor from '../components/RichTextEditor';
import {
  createNote,
  getNote,
  updateNote,
} from '../services/notesService';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadNote = async () => {
      setLoading(true);
      setError('');

      try {
        const note = await getNote(id);

        setTitle(note.title || '');
        setContent(note.content || '');
        setTags(Array.isArray(note.tags) ? note.tags : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.error ||
            'Unable to load this note.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [id, isEditing]);

  const addTag = () => {
    const normalizedTag = tagInput.trim();

    if (!normalizedTag) {
      return;
    }

    const alreadyExists = tags.some(
      (tag) => tag.toLowerCase() === normalizedTag.toLowerCase()
    );

    if (alreadyExists) {
      setTagInput('');
      return;
    }

    setTags((currentTags) => [...currentTags, normalizedTag]);
    setTagInput('');
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((currentTags) =>
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    const plainContent = trimmedContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!trimmedTitle) {
      setError('Please enter a title.');
      return;
    }

    if (!plainContent) {
      setError('Please enter some content.');
      return;
    }

    // If the user typed a tag but didn't press Enter/Add,
    // include it before saving.
    const pendingTag = tagInput.trim();

    let finalTags = tags;

    if (
      pendingTag &&
      !tags.some(
        (tag) => tag.toLowerCase() === pendingTag.toLowerCase()
      )
    ) {
      finalTags = [...tags, pendingTag];
    }

    const noteData = {
      title: trimmedTitle,
      content: trimmedContent,
      tags: finalTags,
    };

    setSaving(true);

    try {
      if (isEditing) {
        await updateNote(id, noteData);
      } else {
        await createNote(noteData);
      }

      navigate('/dashboard');
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          `Unable to ${isEditing ? 'update' : 'create'} the note.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="text-sm text-slate-400">
            Loading note...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to notes
        </button>

        <p className="text-sm font-medium text-indigo-300">
          {isEditing ? 'Edit note' : 'New note'}
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          {isEditing ? 'Edit your note' : 'Create a new note'}
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-7"
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="note-title"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Title
            </label>

            <input
              id="note-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              placeholder="Give your note a title"
              disabled={saving}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {title.length}/200
            </p>
          </div>

          <div>
            <label
              htmlFor="note-content"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Content
            </label>

            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your note..."
            />
          </div>

          <div>
            <label
              htmlFor="tag-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Tags
            </label>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 transition focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
              {tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-300"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        disabled={saving}
                        aria-label={`Remove ${tag} tag`}
                        className="text-indigo-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                disabled={saving}
                className="w-full bg-transparent px-1 py-2 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Press Enter or comma to add a tag.
                </p>

                <button
                  type="button"
                  onClick={addTag}
                  disabled={saving || !tagInput.trim()}
                  className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save changes'
                : 'Create note'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default NoteEditorPage;