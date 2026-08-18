import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const {
    login,
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

    try {
      await login(email.trim(), password);

      const from = location.state?.from?.pathname || '/dashboard';

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Login failed. Please check your email and password.'
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
          className="absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl"
        />

        <div className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">
              <span className="text-xl">✦</span>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              NotesApp
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sign in and get back to your ideas.
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="relative z-10">
                {authLoading ? 'Logging in...' : 'Login'}
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
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-indigo-300 transition-colors hover:text-white"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;