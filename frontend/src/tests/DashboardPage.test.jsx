import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '../pages/DashboardPage';
import { AuthContext } from '../context/AuthContext';
import * as notesService from '../services/notesService';

vi.mock('../services/notesService', () => ({
  getNotes: vi.fn(),
  deleteNote: vi.fn(),
}));

describe('DashboardPage', () => {
  const user = {
    id: 'user-123',
    fullName: 'John Doe',
    email: 'john@example.com',
  };

  const notes = [
    {
      _id: 'note-1',
      title: 'First Note',
      content: '<p>First note content</p>',
      tags: ['personal'],
      createdAt: '2026-08-17T10:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    },
    {
      _id: 'note-2',
      title: 'Second Note',
      content: '<p>Second note content</p>',
      tags: ['work'],
      createdAt: '2026-08-17T09:00:00.000Z',
      updatedAt: '2026-08-17T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <AuthContext.Provider
        value={{
          user,
          token: 'test-token',
          loading: false,
          authLoading: false,
          authError: null,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('loads and renders the user notes', async () => {
    notesService.getNotes.mockResolvedValue({
      success: true,
      count: notes.length,
      data: notes,
    });

    renderDashboard();

    expect(
      screen.getByText(/loading your notes/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('heading', {
        name: /first note/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /second note/i,
      })
    ).toBeInTheDocument();

    expect(notesService.getNotes).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no notes', async () => {
    notesService.getNotes.mockResolvedValue({
      success: true,
      count: 0,
      data: [],
    });

    renderDashboard();

    expect(
      await screen.findByText(/no notes yet/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /create your first note/i,
      })
    ).toHaveAttribute('href', '/notes/new');
  });

  it('shows an error when loading notes fails', async () => {
    notesService.getNotes.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to load notes',
        },
      },
    });

    renderDashboard();

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(/unable to load notes/i);
  });

  it('deletes a note and removes it from the dashboard', async () => {
    notesService.getNotes.mockResolvedValue({
      success: true,
      count: notes.length,
      data: notes,
    });

    notesService.deleteNote.mockResolvedValue({
      success: true,
      message: 'Note deleted',
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderDashboard();

    expect(
      await screen.findByRole('heading', {
        name: /first note/i,
      })
    ).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', {
      name: /delete/i,
    });

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(notesService.deleteNote).toHaveBeenCalledWith('note-1');
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: /first note/i,
        })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', {
        name: /second note/i,
      })
    ).toBeInTheDocument();
  });
});