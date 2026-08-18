import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { deleteNote, getNotes } from '../services/notesService';
import NoteCard from '../components/NoteCard';

const DashboardPage = () => {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getNotes();

      setNotes(response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          'Unable to load your notes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

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
    <section className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-300">
            Your workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {user?.fullName
              ? `Welcome back, ${user.fullName}`
              : 'Your Notes'}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Keep your thoughts organized and easy to find.
          </p>
        </div>

        <Link
          to="/notes/new"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/30"
        >
          + New Note
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

            <p className="text-sm text-slate-400">
              Loading your notes...
            </p>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
            📝
          </div>

          <h2 className="text-xl font-semibold text-white">
            No notes yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Create your first note and start building your personal
            workspace.
          </p>

          <Link
            to="/notes/new"
            className="mt-6 inline-flex rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note._id}
              className={
                deletingId === note._id
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            >
              <NoteCard
                note={note}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardPage;