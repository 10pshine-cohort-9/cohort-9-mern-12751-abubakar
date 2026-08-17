import React from 'react';
import { useEffect, useState } from 'react';
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

  // If the user is already authenticated, redirect them.
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  // Don't render the login form if already authenticated.
  if (user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="glass p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />

        <h2 className="text-3xl font-bold mb-6 text-center text-white relative z-10">
          Welcome Back
        </h2>

        {error && (
          <div
            role="alert"
            className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center border border-red-500/30 relative z-10"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 relative z-10"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-gray-300 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-linear-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {authLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 relative z-10">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary hover:text-white transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;