import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note, onDelete, deletingId }) => {
  const preview = note.content
    ? note.content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
    : 'No content yet.';

  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const isDeleting = deletingId === note._id;

  return (
    <article
      aria-busy={isDeleting}
      className={`group flex min-w-0 w-full h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 sm:p-5 ${
        isDeleting
          ? 'pointer-events-none opacity-50'
          : 'hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex min-w-0 items-start gap-3">
          <h2 className="min-w-0 flex-1 wrap-break-word text-base font-semibold leading-6 text-white sm:text-lg">
            {note.title || 'Untitled note'}
          </h2>

          {updatedDate && (
            <time
              dateTime={note.updatedAt}
              className="max-w-22.5 shrink-0 wrap-break-word text-right text-[11px] leading-4 text-slate-400 sm:max-w-none sm:text-xs"
            >
              {updatedDate}
            </time>
          )}
        </div>

        <p className="min-w-0 wrap-anywhere text-sm leading-6 text-slate-300">
          {preview || 'No content yet.'}
        </p>

        {note.tags?.length > 0 && (
          <div className="mt-4 flex min-w-0 flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="max-w-full break-all rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={`/notes/${note._id}`}
          tabIndex={isDeleting ? -1 : undefined}
          aria-disabled={isDeleting || undefined}
          className="inline-flex min-w-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white sm:justify-start"
        >
          View
        </Link>

        <div className="flex min-w-0 flex-wrap gap-2">
          <Link
            to={`/notes/${note._id}/edit`}
            tabIndex={isDeleting ? -1 : undefined}
            aria-disabled={isDeleting || undefined}
            className="inline-flex min-w-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/10 hover:text-indigo-200"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(note._id)}
            disabled={isDeleting}
            className="inline-flex min-w-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;