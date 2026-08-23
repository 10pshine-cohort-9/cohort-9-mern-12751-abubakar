import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getNote } from '../services/notesService';

const NoteReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadNote = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getNote(id);

        if (mounted) {
          setNote(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.response?.data?.error ||
              'Unable to load this note.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNote();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="page-enter mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
        <div className="glass-surface rounded-2xl px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />

          <p className="text-sm text-slate-400">
            Loading note...
          </p>
        </div>
      </section>
    );
  }

  if (error || !note) {
    return (
      <section className="page-enter mx-auto max-w-2xl px-4 py-12">
        <div
          role="alert"
          className="glass-surface rounded-2xl p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-xl text-red-300">
            !
          </div>

          <h1 className="text-xl font-semibold text-white">
            {error || 'Note not found'}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            This note may have been removed or is no longer
            available.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to notes
          </Link>
        </div>
      </section>
    );
  }

  const formattedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : '';

  return (
    <article className="page-enter mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to notes
        </button>

        <Link
          to={`/notes/${note._id}/edit`}
          className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/30"
        >
          Edit note
        </Link>
      </div>

      <div className="glass-surface rounded-3xl px-6 py-8 sm:px-10 sm:py-10">
        <header className="border-b border-white/10 pb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Note
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {note.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {formattedDate && (
              <time dateTime={note.updatedAt}>
                Updated {formattedDate}
              </time>
            )}

            {note.tags?.length > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="text-slate-700"
                >
                  •
                </span>

                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <div className="note-reader-content mt-8">
          <div
            dangerouslySetInnerHTML={{
              __html: note.content,
            }}
          />
        </div>
      </div>
    </article>
  );
};

export default NoteReaderPage;