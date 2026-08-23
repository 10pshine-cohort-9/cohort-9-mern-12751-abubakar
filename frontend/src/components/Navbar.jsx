import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path;

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={user ? '/dashboard' : '/login'}
          className="text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          NoteSpace
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Notes
              </Link>

              <Link
                to="/profile"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/profile')
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Profile
              </Link>

              <div className="hidden h-5 w-px bg-white/10 sm:block" />

              <span className="hidden text-sm text-slate-400 md:block">
                {user.fullName || user.name || user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive('/login')
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20"
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