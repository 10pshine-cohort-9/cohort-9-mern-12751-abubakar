import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUpPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    user,
    loading,
    authLoading,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      const from = location.state?.from?.pathname || '/dashboard';

      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    try {
      await register(
        fullName.trim(),
        email.trim(),
        password
      );

      const from = location.state?.from?.pathname || '/dashboard';

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Registration failed. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="glass-surface rounded-2xl px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />
          <p className="text-sm text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="page-enter mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10 sm:px-0">
      <div className="relative w-full">
        <div
          aria-hidden="true"
          className="absolute -left-10 top-1/3 h-36 w-36 rounded-full bg-purple-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-8 bottom-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
              <span className="text-xl">✦</span>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
              NotesApp
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create Account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Start organizing your thoughts in one place.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
            >
              <span
                aria-hidden="true"
                className="mt-0.5"
              >
                !
              </span>

              <p>{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={authLoading}
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                minLength={6}
                required
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={authLoading}
                minLength={6}
                required
                placeholder="Repeat your password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="relative z-10">
                {authLoading
                  ? 'Creating account...'
                  : 'Sign Up'}
              </span>

              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0"
              />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-600">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-300 transition-colors hover:text-white"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;