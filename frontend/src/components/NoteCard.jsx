import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note, onDelete, deletingId }) => {
  const preview = note.content
    ? note.content.replace(/<[^>]*>/g, '').trim()
    : 'No content yet.';

  const updatedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString()
    : '';

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="flex-1">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="line-clamp-2 text-lg font-semibold text-white">
            {note.title}
          </h2>

          {updatedDate && (
            <time
              dateTime={note.updatedAt}
              className="shrink-0 text-xs text-slate-400"
            >
              {updatedDate}
            </time>
          )}
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-slate-300">
          {preview || 'No content yet.'}
        </p>

        {note.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <Link
          to={`/notes/${note._id}/edit`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/10 hover:text-indigo-200"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() => onDelete(note._id)}
          disabled={deletingId === note._id}
          className="rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default NoteCard;