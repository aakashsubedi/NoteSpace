import { Note } from '../types/Note';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
};

export const createNote = async (note: { title: string; content: string }): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
};

export const updateNote = async (
  id: string,
  note: { title: string; content: string }
): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  return response.json();
};

export const deleteNote = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
}; 