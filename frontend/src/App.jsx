import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import NoteEditorPage from './pages/NoteEditorPage';
import NoteReaderPage from './pages/NoteReaderPage';

import './App.css';

// Routes that should only be available to logged-out users.
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Keeps Navbar visible across application.
const AppLayout = () => {
  return (
    <>
      <Navbar />

      <main className="px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </>
  );
};

// Sends unknown routes to the appropriate destination.
const NotFoundRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <Navigate
      to={user ? '/dashboard' : '/login'}
      replace
    />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/notes/new"
            element={<NoteEditorPage />}
          />

          <Route
            path="/notes/:id"
            element={<NoteReaderPage />}
          />

          <Route
            path="/notes/:id/edit"
            element={<NoteEditorPage />}
          />
        </Route>

        <Route
          path="*"
          element={<NotFoundRedirect />}
        />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;