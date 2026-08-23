import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path;

  const isDark = theme === 'dark';

  return (
    <nav className="theme-navbar border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={user ? '/dashboard' : '/login'}
          className="theme-heading text-xl font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          NoteSpace
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              isDark
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="theme-control flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base transition-all hover:bg-white/10"
          >
            <span aria-hidden="true">
              {isDark ? '☀' : '☾'}
            </span>
          </button>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`theme-nav-link rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/dashboard')
                    ? 'theme-nav-active bg-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Notes
              </Link>

              <Link
                to="/profile"
                className={`theme-nav-link rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/profile')
                    ? 'theme-nav-active bg-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Profile
              </Link>

              <div className="hidden h-5 w-px bg-white/10 sm:block" />

              <span className="theme-muted hidden text-sm md:block">
                {user.fullName ||
                  user.name ||
                  user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="theme-button rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`theme-nav-link rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/login')
                    ? 'theme-nav-active'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;