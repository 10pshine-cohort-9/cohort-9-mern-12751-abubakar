import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '../context/AuthContext';
import SignUpPage from '../pages/SignUpPage';

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderSignUpPage = (auth = {}) => {
  const defaultAuth = {
    user: null,
    token: null,
    loading: false,
    authLoading: false,
    authError: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={{ ...defaultAuth, ...auth }}>
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the signup form', () => {
    renderSignUpPage();

    expect(
      screen.getByRole('heading', { name: /create account/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/confirm password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /^sign up$/i })
    ).toBeInTheDocument();
  });

  it('shows loading while authentication is being checked', () => {
    renderSignUpPage({
      loading: true,
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error when passwords do not match', () => {
    const register = vi.fn();

    renderSignUpPage({ register });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /^sign up$/i })
    );

    expect(
      screen.getByText(/passwords do not match/i)
    ).toBeInTheDocument();

    expect(register).not.toHaveBeenCalled();
  });

  it('shows an error when the password is too short', () => {
    const register = vi.fn();

    renderSignUpPage({ register });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '123' },
    });

    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: '123' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));

    expect(
      screen.getByText(/at least 6 characters/i)
    ).toBeInTheDocument();

    expect(register).not.toHaveBeenCalled();
  });

  it('does not render the signup form when the user is logged in', () => {
    renderSignUpPage({
      user: {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
      },
    });

    expect(
      screen.queryByRole('heading', { name: /create account/i })
    ).not.toBeInTheDocument();
  });

  it('has a link to the login page', () => {
    renderSignUpPage();

    expect(
      screen.getByRole('link', { name: /log in/i })
    ).toHaveAttribute('href', '/login');
  });
});