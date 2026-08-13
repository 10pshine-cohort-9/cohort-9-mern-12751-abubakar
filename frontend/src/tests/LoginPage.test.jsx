import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

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

import LoginPage from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = (auth = {}) => {
    const authValue = {
      user: null,
      loading: false,
      authLoading: false,
      authError: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      token: null,
      ...auth,
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('renders the login form', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', {
        name: /welcome back/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /^login$/i,
      })
    ).toBeInTheDocument();
  });

  it('shows a loading message while authentication is initializing', () => {
    renderLoginPage({
      loading: true,
    });

    expect(
      screen.getByText(/loading/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: /welcome back/i,
      })
    ).not.toBeInTheDocument();
  });

  it('disables the login button while logging in', () => {
    renderLoginPage({
      authLoading: true,
    });

    const button = screen.getByRole('button', {
      name: /logging in/i,
    });

    expect(button).toBeDisabled();

    expect(
      screen.getByLabelText(/email/i)
    ).toBeDisabled();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeDisabled();
   });
 
   it('logs in successfully', async () => {
  const login = vi.fn().mockResolvedValue();

  renderLoginPage({ login });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'john@example.com' },
  });

  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' },
  });

  fireEvent.click(
    screen.getByRole('button', {
      name: /^login$/i,
    })
  );

  expect(login).toHaveBeenCalledWith(
    'john@example.com',
    'password123'
  );
});
 
 it('shows an error when login fails', async () => {
   const login = vi.fn().mockRejectedValue(
     new Error('Invalid credentials')
   );
 
   renderLoginPage({ login });
 
   fireEvent.change(screen.getByLabelText(/email/i), {
     target: { value: 'john@example.com' },
   });
 
   fireEvent.change(screen.getByLabelText(/password/i), {
     target: { value: 'wrongpassword' },
   });
 
   fireEvent.click(
     screen.getByRole('button', {
       name: /^login$/i,
     })
   );
 
   expect(
    await screen.findByRole('alert')
   ).toHaveTextContent(
    /login failed\. please check your email and password/i
  );
 });

  it('does not render the login form when the user is authenticated', () => {
    renderLoginPage({
      user: {
        id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
      },
    });

    expect(
      screen.queryByRole('heading', {
        name: /welcome back/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: /^login$/i,
      })
    ).not.toBeInTheDocument();
  });
});