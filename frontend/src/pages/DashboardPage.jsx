import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { deleteNote, getNotes } from '../services/notesService';
import NoteCard from '../components/NoteCard';

const DashboardPage = () => {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [selectedTag, setSelectedTag] = useState('all');

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadNotes = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getNotes({
          search: search.trim() || undefined,
          sortBy,
        });

        if (active) {
          setNotes(response.data || []);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.error ||
              'Unable to load your notes. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      loadNotes();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [search, sortBy]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();

    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        const normalizedTag = tag?.trim();

        if (normalizedTag) {
          tagSet.add(normalizedTag);
        }
      });
    });

    return Array.from(tagSet).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (selectedTag === 'all') {
      return notes;
    }

    return notes.filter((note) =>
      note.tags?.some(
        (tag) =>
          tag.toLowerCase() === selectedTag.toLowerCase()
      )
    );
  }, [notes, selectedTag]);

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(noteId);
    setError('');

    try {
      await deleteNote(noteId);

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note._id !== noteId)
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'Unable to delete the note. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-enter mx-auto max-w-7xl">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-indigo-300">
            Your workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {user?.fullName
              ? `Welcome back, ${user.fullName}`
              : 'Your Notes'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Capture ideas, organize thoughts, and keep everything
            in one place.
          </p>
        </div>

        <Link
          to="/notes/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25"
        >
          <span aria-hidden="true">+</span>
          New Note
        </Link>
      </div>

      <div className="glass-surface glass-surface-hover mb-8 rounded-2xl p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <label
              htmlFor="note-search"
              className="sr-only"
            >
              Search notes
            </label>

            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            >
              ⌕
            </span>

            <input
              id="note-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your notes..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="note-sort"
              className="sr-only"
            >
              Sort notes
            </label>

            <select
              id="note-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="w-full min-w-[190px] rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="updatedAt">
                Recently updated
              </option>
              <option value="createdAt">
                Recently created
              </option>
            </select>
          </div>
        </div>

        {availableTags.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="mr-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Filter
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedTag === 'all'
                  ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
                }`}
            >
              All notes
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedTag.toLowerCase() === tag.toLowerCase()
                    ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/10'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="glass-surface rounded-2xl px-8 py-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

            <p className="text-sm text-slate-400">
              Loading your notes...
            </p>
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="glass-surface rounded-2xl border-dashed px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/10 text-2xl">
            📝
          </div>

          <h2 className="text-xl font-semibold text-white">
            {notes.length === 0
              ? 'No notes yet'
              : 'No matching notes'}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            {notes.length === 0
              ? 'Create your first note and start building your personal workspace.'
              : 'Try changing your search or selecting another tag.'}
          </p>

          {notes.length === 0 ? (
            <Link
              to="/notes/new"
              className="mt-6 inline-flex rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-300 transition-all hover:-translate-y-0.5 hover:bg-indigo-500/20 hover:text-indigo-200"
            >
              Create your first note
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTag('all');
              }}
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-medium text-slate-300">
                {filteredNotes.length}
              </span>{' '}
              {filteredNotes.length === 1 ? 'note' : 'notes'}
              {selectedTag !== 'all' && (
                <>
                  {' '}
                  tagged{' '}
                  <span className="font-medium text-indigo-300">
                    #{selectedTag}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={
                  deletingId === note._id
                    ? 'pointer-events-none opacity-50'
                    : 'page-enter'
                }
              >
                <NoteCard
                  note={note}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default DashboardPage;