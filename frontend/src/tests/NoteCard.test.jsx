import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NoteCard from '../components/NoteCard';

describe('NoteCard', () => {
  const note = {
    _id: 'note-123',
    title: 'My First Note',
    content: '<p>This is my <strong>note content</strong>.</p>',
    tags: ['personal', 'testing'],
    createdAt: '2026-08-17T10:00:00.000Z',
    updatedAt: '2026-08-17T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNoteCard = (onDelete = vi.fn()) => {
    return render(
      <MemoryRouter>
        <NoteCard note={note} onDelete={onDelete} />
      </MemoryRouter>
    );
  };

  it('renders the note title and content preview', () => {
    renderNoteCard();

    expect(
      screen.getByRole('heading', {
        name: /my first note/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this is my note content/i)
    ).toBeInTheDocument();
  });

  it('renders the note tags', () => {
    renderNoteCard();

    expect(
      screen.getByText('personal')
    ).toBeInTheDocument();

    expect(
      screen.getByText('testing')
    ).toBeInTheDocument();
  });

  it('links to the correct edit page', () => {
    renderNoteCard();

    expect(
      screen.getByRole('link', {
        name: /edit/i,
      })
    ).toHaveAttribute(
      'href',
      '/notes/note-123/edit'
    );
  });

  it('calls onDelete with the note id', () => {
    const onDelete = vi.fn();

    renderNoteCard(onDelete);

    fireEvent.click(
      screen.getByRole('button', {
        name: /delete/i,
      })
    );

    expect(onDelete).toHaveBeenCalledWith('note-123');
  });
});