import api from './api';

export const getNotes = async (params = {}) => {
  const response = await api.get('/notes', {
    params,
  });

  return response.data;
};

export const getNote = async (noteId) => {
  const response = await api.get(`/notes/${noteId}`);

  return response.data.data;
};

export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);

  return response.data.data;
};

export const updateNote = async (noteId, noteData) => {
  const response = await api.put(`/notes/${noteId}`, noteData);

  return response.data.data;
};

export const deleteNote = async (noteId) => {
  const response = await api.delete(`/notes/${noteId}`);

  return response.data;
};