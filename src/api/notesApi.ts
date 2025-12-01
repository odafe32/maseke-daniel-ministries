import client from './client';

export interface Note {
  id: number;
  book: {
    id: number;
    name: string;
    testament: string;
  };
  chapter: number;
  verses: number[];
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  book_id: number;
  chapter: number;
  verses: number[];
  content?: string;
}

export interface UpdateNoteRequest {
  book_id?: number;
  chapter?: number;
  verses?: number[];
  content?: string;
}

export const notesApi = {
  // Get all notes for the authenticated user
  getNotes: async (): Promise<Note[]> => {
    const response = await client.get('/mobile/bible/notes');
    return response.data.data;
  },

  // Create a new note
  createNote: async (noteData: CreateNoteRequest): Promise<Note> => {
    const response = await client.post('/mobile/bible/notes', noteData);
    return response.data.data;
  },

  // Update an existing note
  updateNote: async (noteId: number, noteData: UpdateNoteRequest): Promise<Note> => {
    const response = await client.put(`/mobile/bible/notes/${noteId}`, noteData);
    return response.data.data;
  },

  // Delete a note
  deleteNote: async (noteId: number): Promise<void> => {
    await client.delete(`/mobile/bible/notes/${noteId}`);
  },

  // Get notes for a specific book and chapter
  getNotesByReference: async (bookId: number, chapter: number): Promise<Note[]> => {
    const response = await client.get('/mobile/bible/notes/reference', {
      params: { book_id: bookId, chapter }
    });
    return response.data.data;
  }
};
