import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.fullName || 'User';
  const email = user?.email || 'No email available';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const formattedMemberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        undefined,
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className="page-enter mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to notes
        </Link>

        <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-indigo-300">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Profile
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
          View your account information and manage your session.
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass-surface rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-indigo-400/20 bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-2xl font-bold text-indigo-200">
              {initials || 'U'}
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                {fullName}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {email}
              </p>

              {formattedMemberSince && (
                <p className="mt-3 text-xs text-slate-500">
                  Member since {formattedMemberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-surface rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your account information currently associated with
              NotesSpace.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Full name
              </p>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {fullName}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Email
              </p>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {email}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-surface rounded-3xl p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Session
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign out of your NoteSpace account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition-all hover:-translate-y-0.5 hover:bg-red-500/15 hover:text-red-200"
          >
            Log out
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;