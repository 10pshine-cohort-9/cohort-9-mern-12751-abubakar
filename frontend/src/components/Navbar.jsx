import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={user ? '/dashboard' : '/login'}
          className="text-xl font-bold text-white"
        >
          NotesApp
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-300 text-sm">
                {user.fullName || user.name || user.email}
              </span>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
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