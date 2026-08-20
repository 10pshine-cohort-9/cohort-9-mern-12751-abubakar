import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NoteEditorPage from '../pages/NoteEditorPage';
import * as notesService from '../services/notesService';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../services/notesService', () => ({
  createNote: vi.fn(),
  getNote: vi.fn(),
  updateNote: vi.fn(),
}));

vi.mock('../components/RichTextEditor', () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      aria-label="Content"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe('NoteEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCreatePage = () =>
    render(
      <MemoryRouter initialEntries={['/notes/new']}>
        <Routes>
          <Route path="/notes/new" element={<NoteEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

  const renderEditPage = () =>
    render(
      <MemoryRouter initialEntries={['/notes/note-123/edit']}>
        <Routes>
          <Route
            path="/notes/:id/edit"
            element={<NoteEditorPage />}
          />
        </Routes>
      </MemoryRouter>
    );

  const addTag = (tag) => {
    const tagInput = screen.getByPlaceholderText(
      /type a tag and press enter/i
    );

    fireEvent.change(tagInput, {
      target: { value: tag },
    });

    fireEvent.keyDown(tagInput, {
      key: 'Enter',
      code: 'Enter',
    });
  };

  it('renders the create note form', () => {
    renderCreatePage();

    expect(
      screen.getByRole('heading', {
        name: /create a new note/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/content/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/tags/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /create note/i,
      })
    ).toBeInTheDocument();
  });

  it('shows validation error when the title is empty', () => {
    renderCreatePage();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: '' },
    });

    const form = screen
      .getByRole('button', { name: /create note/i })
      .closest('form');

    fireEvent.submit(form);

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(/please enter a title/i);

    expect(
      notesService.createNote
    ).not.toHaveBeenCalled();
  });

  it('creates a note and navigates to the dashboard', async () => {
    notesService.createNote.mockResolvedValue({
      _id: 'note-123',
      title: 'My Note',
      content: '<p>Hello world</p>',
      tags: ['personal', 'testing'],
    });

    renderCreatePage();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'My Note' },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: '<p>Hello world</p>' },
    });

    addTag('personal');
    addTag('testing');

    const form = screen
      .getByRole('button', { name: /create note/i })
      .closest('form');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(notesService.createNote).toHaveBeenCalledWith({
        title: 'My Note',
        content: '<p>Hello world</p>',
        tags: ['personal', 'testing'],
      });
    });

    expect(
      navigateMock
    ).toHaveBeenCalledWith('/dashboard');
  });

  it('loads an existing note in edit mode', async () => {
    notesService.getNote.mockResolvedValue({
      _id: 'note-123',
      title: 'Existing Note',
      content: '<p>Existing content</p>',
      tags: ['work', 'ideas'],
      createdAt: '2026-08-17T10:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    });

    renderEditPage();

    expect(
      await screen.findByDisplayValue('Existing Note')
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/content/i)
    ).toHaveValue('<p>Existing content</p>');

    expect(
      screen.getByText('work')
    ).toBeInTheDocument();

    expect(
      screen.getByText('ideas')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /remove work tag/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /remove ideas tag/i,
      })
    ).toBeInTheDocument();

    expect(
      notesService.getNote
    ).toHaveBeenCalledWith('note-123');

    expect(
      screen.getByRole('heading', {
        name: /edit your note/i,
      })
    ).toBeInTheDocument();
  });

  it('updates an existing note and navigates to the dashboard', async () => {
    notesService.getNote.mockResolvedValue({
      _id: 'note-123',
      title: 'Existing Note',
      content: '<p>Existing content</p>',
      tags: ['work'],
    });

    notesService.updateNote.mockResolvedValue({
      _id: 'note-123',
      title: 'Updated Note',
      content: '<p>Updated content</p>',
      tags: ['work', 'updated'],
    });

    renderEditPage();

    fireEvent.change(
      await screen.findByDisplayValue('Existing Note'),
      {
        target: { value: 'Updated Note' },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/content/i),
      {
        target: { value: '<p>Updated content</p>' },
      }
    );

    addTag('updated');

    const form = screen
      .getByRole('button', {
        name: /save changes/i,
      })
      .closest('form');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        notesService.updateNote
      ).toHaveBeenCalledWith(
        'note-123',
        {
          title: 'Updated Note',
          content: '<p>Updated content</p>',
          tags: ['work', 'updated'],
        }
      );
    });

    expect(
      navigateMock
    ).toHaveBeenCalledWith('/dashboard');
  });

  it('removes an existing tag', async () => {
    notesService.getNote.mockResolvedValue({
      _id: 'note-123',
      title: 'Existing Note',
      content: '<p>Existing content</p>',
      tags: ['work', 'ideas'],
    });

    renderEditPage();

    await screen.findByDisplayValue('Existing Note');

    fireEvent.click(
      screen.getByRole('button', {
        name: /remove work tag/i,
      })
    );

    expect(
      screen.queryByText('work')
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('ideas')
    ).toBeInTheDocument();
  });

  it('shows an error when creating a note fails', async () => {
    notesService.createNote.mockRejectedValue({
      response: {
        data: {
          error: 'Unable to save note',
        },
      },
    });

    renderCreatePage();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Note' },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: '<p>Test content</p>' },
    });

    const form = screen
      .getByRole('button', { name: /create note/i })
      .closest('form');

    fireEvent.submit(form);

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(/unable to save note/i);
  });
});