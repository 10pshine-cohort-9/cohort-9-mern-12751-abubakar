import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
  createNote,
  deleteNote,
  getNotes,
} from '../services/notesService';

import {
  exportNotesToJson,
  importNotesFromJson,
} from '../services/notesTransferService';

import NoteCard from '../components/NoteCard';

const DashboardPage = () => {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [selectedTag, setSelectedTag] = useState('all');

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [menuOpen, setMenuOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] =
    useState(false);

  const [exportMode, setExportMode] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);

  const importInputRef = useRef(null);
  const menuRef = useRef(null);
  const exportDialogRef = useRef(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const serverSort =
        sortBy === 'updatedAt' || sortBy === 'createdAt'
          ? sortBy
          : 'updatedAt';

      const response = await getNotes({
        search: search.trim() || undefined,
        sortBy: serverSort,
      });

      setNotes(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        'Unable to load your notes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadNotes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [loadNotes]);

  useEffect(() => {
    setSelectedNoteIds((currentIds) =>
      currentIds.filter((id) =>
        notes.some((note) => note._id === id)
      )
    );
  }, [notes]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener(
        'mousedown',
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, [menuOpen]);

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
    let result = notes;

    if (selectedTag !== 'all') {
      result = result.filter((note) =>
        note.tags?.some(
          (tag) =>
            tag.toLowerCase() ===
            selectedTag.toLowerCase()
        )
      );
    }

    if (sortBy === 'titleAsc') {
      result = [...result].sort((a, b) =>
        (a.title || '').localeCompare(
          b.title || '',
          undefined,
          { sensitivity: 'base' }
        )
      );
    }

    if (sortBy === 'titleDesc') {
      result = [...result].sort((a, b) =>
        (b.title || '').localeCompare(
          a.title || '',
          undefined,
          { sensitivity: 'base' }
        )
      );
    }

    return result;
  }, [notes, selectedTag, sortBy]);

  const allVisibleSelected =
    filteredNotes.length > 0 &&
    filteredNotes.every((note) =>
      selectedNoteIds.includes(note._id)
    );

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const openExportDialog = () => {
    clearMessages();
    setMenuOpen(false);
    setExportDialogOpen(true);
  };

  const closeExportDialog = () => {
    if (importing) {
      return;
    }

    setExportDialogOpen(false);

    if (exportMode === 'all') {
      setSelectionMode(false);
      setSelectedNoteIds([]);
    }
  };

  useEffect(() => {
    if (!exportDialogOpen) {
      return undefined;
    }

    if (exportDialogRef.current) {
      exportDialogRef.current.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeExportDialog();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () =>
      document.removeEventListener('keydown', handleKeyDown);
  }, [exportDialogOpen, exportMode, importing]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSelectedExport = () => {
    clearMessages();
    setExportDialogOpen(false);
    setSelectionMode(true);
    setSelectedNoteIds([]);
  };

  const handleToggleSelection = (noteId) => {
    setSelectedNoteIds((currentIds) =>
      currentIds.includes(noteId)
        ? currentIds.filter((id) => id !== noteId)
        : [...currentIds, noteId]
    );
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedNoteIds([]);
      return;
    }

    setSelectedNoteIds(
      filteredNotes.map((note) => note._id)
    );
  };

  const handleExportAll = () => {
    if (notes.length === 0) {
      setError('There are no notes to export.');
      return;
    }

    try {
      exportNotesToJson(notes);

      setSuccess(
        `${notes.length} ${notes.length === 1 ? 'note' : 'notes'
        } exported successfully.`
      );

      setSelectionMode(false);
      setSelectedNoteIds([]);
    } catch {
      setError(
        'Unable to export your notes. Please try again.'
      );
    }
  };

  const handleExportSelected = () => {
    if (selectedNoteIds.length === 0) {
      setError(
        'Select at least one note to export.'
      );
      return;
    }

    const selectedNotes = notes.filter((note) =>
      selectedNoteIds.includes(note._id)
    );

    try {
      exportNotesToJson(selectedNotes);

      setSuccess(
        `${selectedNotes.length} ${selectedNotes.length === 1 ? 'note' : 'notes'
        } exported successfully.`
      );

      setSelectionMode(false);
      setSelectedNoteIds([]);
    } catch {
      setError(
        'Unable to export the selected notes. Please try again.'
      );
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImporting(true);
    clearMessages();

    try {
      const importedNotes =
        await importNotesFromJson(file);

      if (importedNotes.length === 0) {
        throw new Error(
          'The selected file does not contain any notes.'
        );
      }

      for (const note of importedNotes) {
        await createNote(note);
        importedCount += 1;
      }

      setSuccess(
        `${importedCount} ${importedCount === 1 ? 'note' : 'notes'
        } imported successfully.`
      );
    } catch (importError) {
      const partialNotice =
        importedCount > 0
          ? ` ${importedCount} note(s) were already imported.`
          : '';
      setError(
        importError.response?.data?.error ||
        importError.message ||
        'Unable to import your notes. Please try again.') +
        partialNotice
    } finally {
      if (importedCount > 0) {
        await loadNotes();
      }
      setImporting(false);

      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this note?'
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(noteId);
    clearMessages();

    try {
      await deleteNote(noteId);

      setNotes((currentNotes) =>
        currentNotes.filter(
          (note) => note._id !== noteId
        )
      );

      setSelectedNoteIds((currentIds) =>
        currentIds.filter((id) => id !== noteId)
      );

      setSuccess('Note deleted successfully.');
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
      {/* Header */}
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
            Capture ideas, organize thoughts, and keep
            everything in one place.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:gap-3">
          <Link
            to="/notes/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25"
          >
            <span aria-hidden="true">+</span>
            New Note
          </Link>

          {/* Secondary actions */}
          <div
            ref={menuRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setMenuOpen((current) => !current)
              }
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="More note actions"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              ⋯
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="theme-menu absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={openExportDialog}
                  disabled={notes.length === 0}
                  className="theme-menu-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">↓</span>
                  Export notes
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    importInputRef.current?.click();
                  }}
                  disabled={importing}
                  className="theme-menu-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">↑</span>
                  Import notes
                </button>
              </div>
            )}
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Search and filtering */}
      <div className="glass-surface mb-8 rounded-2xl p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <label
              htmlFor="note-search"
              className="sr-only"
            >
              Search notes
            </label>

            <input
              id="note-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search your notes..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear note search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
              >
                ×
              </button>
            )}
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
              className="w-full min-w-[210px] rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="updatedAt">
                Recently updated
              </option>
              <option value="createdAt">
                Recently created
              </option>
              <option value="titleAsc">
                Title A → Z
              </option>
              <option value="titleDesc">
                Title Z → A
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
                  ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              All notes
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selectedTag.toLowerCase() ===
                    tag.toLowerCase()
                    ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-300'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span aria-hidden="true">!</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          <span aria-hidden="true">✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Selection toolbar */}
      {selectionMode &&
        !loading &&
        filteredNotes.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
              >
                {allVisibleSelected
                  ? 'Clear selection'
                  : 'Select all'}
              </button>

              <span className="h-4 w-px bg-white/10" />

              <span className="text-sm text-slate-400">
                {selectedNoteIds.length === 0
                  ? 'No notes selected'
                  : `${selectedNoteIds.length} selected`}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedNoteIds([]);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExportSelected}
                disabled={selectedNoteIds.length === 0}
                className="rounded-lg bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export selected
              </button>
            </div>
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
              : 'Try changing your search, sorting, or selected tag.'}
          </p>

          {notes.length === 0 ? (
            <Link
              to="/notes/new"
              className="mt-6 inline-flex rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
            >
              Create your first note
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTag('all');
                setSortBy('updatedAt');
              }}
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
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
              {filteredNotes.length === 1
                ? 'note'
                : 'notes'}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`min-w-0 ${deletingId === note._id
                    ? 'pointer-events-none opacity-50'
                    : 'relative page-enter'
                  }`}
              >
                {selectionMode && (
                  <label className="absolute left-3 top-3 z-20 flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={selectedNoteIds.includes(
                        note._id
                      )}
                      onChange={() =>
                        handleToggleSelection(note._id)
                      }
                      aria-label={`Select ${note.title}`}
                      className="h-5 w-5 rounded border-white/20 bg-slate-900/90 text-indigo-500 focus:ring-indigo-500"
                    />
                  </label>
                )}

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

      {/* Export dialog */}
      {exportDialogOpen && (
        <div
          ref={exportDialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-dialog-title"
        >
          <div className="glass-surface w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/40">
            <div className="mb-6">
              <h2
                id="export-dialog-title"
                className="text-xl font-semibold text-white"
              >
                Export notes
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choose which notes you want to save as a JSON
                backup.
              </p>
            </div>

            <div className="space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${exportMode === 'all'
                    ? 'border-indigo-400/30 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
              >
                <input
                  type="radio"
                  name="exportMode"
                  value="all"
                  checked={exportMode === 'all'}
                  onChange={() =>
                    setExportMode('all')
                  }
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-medium text-white">
                    Export all notes
                  </span>

                  <span className="mt-1 block text-xs text-slate-400">
                    Save all {notes.length} notes.
                  </span>
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${exportMode === 'selected'
                    ? 'border-indigo-400/30 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
              >
                <input
                  type="radio"
                  name="exportMode"
                  value="selected"
                  checked={exportMode === 'selected'}
                  onChange={() =>
                    setExportMode('selected')
                  }
                  className="mt-1"
                />

                <span>
                  <span className="block text-sm font-medium text-white">
                    Export selected notes
                  </span>

                  <span className="mt-1 block text-xs text-slate-400">
                    Choose specific notes before exporting.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeExportDialog}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  exportMode === 'all'
                    ? () => {
                      setExportDialogOpen(false);
                      handleExportAll();
                    }
                    : startSelectedExport
                }
                className="rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {exportMode === 'all'
                  ? 'Export all'
                  : 'Choose notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;