import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import api, { setUnauthorizedHandler } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem('token')
  );
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Validate the stored token when the app starts
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');

        if (mounted) {
          setUser(res.data.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');

          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } else if (mounted) {
          setAuthError(
            'Unable to verify your session. Please try again.'
          );
          setToken(storedToken);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Shared authentication logic for login and registration
  const authenticate = async (
    endpoint,
    payload,
    fallbackMessage
  ) => {
    try {
      const res = await api.post(endpoint, payload);

      const data = res.data.data;
      const { token: newToken, ...userData } = data;

      if (!newToken) {
        throw new Error('No authentication token received.');
      }

      localStorage.setItem('token', newToken);

      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (error) {
      setAuthError(
        error.response?.data?.error || fallbackMessage
      );

      throw error;
    }
  };

  const login = (email, password) => {
  setAuthLoading(true);
  setAuthError(null);

  return authenticate(
    '/auth/login',
    {
      email,
      password,
    },
    'Login failed. Please try again.'
  ).finally(() => {
    setAuthLoading(false);
  });
};

  const register = (fullName, email, password) => {
  setAuthLoading(true);
  setAuthError(null);

  return authenticate(
    '/auth/register',
    {
      fullName,
      email,
      password,
    },
    'Registration failed. Please try again.'
  ).finally(() => {
    setAuthLoading(false);
  });
};

  const logout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  // Keep React auth state synchronized with Axios 401 responses
  useEffect(() => {
    setUnauthorizedHandler(logout);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = {
    user,
    token,
    loading,
    authLoading,
    authError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
};