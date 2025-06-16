import { api } from './api';
import { Note } from '../types/Note';

interface NoteData {
  title: string;
  content: string;
}

export const noteService = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const response = await api.get<Note[]>('/notes/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch notes');
    }
  },

  // Get a single note
  getNote: async (id: number): Promise<Note> => {
    try {
      const response = await api.get<Note>(`/notes/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching note ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch note');
    }
  },

  // Create a new note
  createNote: async (data: NoteData): Promise<Note> => {
    try {
      console.log('Sending note creation request with data:', data);
      const response = await api.post<Note>('/notes/', data);
      console.log('Note creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating note:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      if (error.response?.status === 500) {
        throw new Error('Server error: Please check if the backend server is running and properly configured');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication error: Please login again');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else {
        throw new Error('Failed to create note: ' + (error.message || 'Unknown error'));
      }
    }
  },

  // Update a note
  updateNote: async (id: number, data: NoteData): Promise<Note> => {
    try {
      const response = await api.put<Note>(`/notes/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating note ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to update note');
    }
  },

  // Delete a note
  deleteNote: async (id: number): Promise<void> => {
    try {
      await api.delete(`/notes/${id}/`);
    } catch (error: any) {
      console.error(`Error deleting note ${id}:`, error);
      throw new Error(error.response?.data?.detail || 'Failed to delete note');
    }
  },
}; 