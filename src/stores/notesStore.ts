import { create } from 'zustand';
import { Note, notesApi, CreateNoteRequest, UpdateNoteRequest } from '../api/notesApi';

interface NotesState {
  // Data
  notes: Note[];
  savedVerses: { [key: string]: number[] }; // bookId-chapter: verseIds[]

  // Loading states
  isLoadingNotes: boolean;
  isCreatingNote: boolean;
  isUpdatingNote: boolean;
  isDeletingNote: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (noteData: CreateNoteRequest) => Promise<Note | null>;
  updateNote: (noteId: number, noteData: UpdateNoteRequest) => Promise<Note | null>;
  deleteNote: (noteId: number) => Promise<boolean>;
  getNotesForReference: (bookId: number, chapter: number) => Note[];
  getSavedVersesForReference: (bookId: number, chapter: number) => number[];
  saveVersesForReference: (bookId: number, chapter: number, verseIds: number[]) => Promise<Note | null>;
  unsaveVersesForReference: (bookId: number, chapter: number, verseIds: number[]) => Promise<boolean>;
  clearError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial state
  notes: [],
  savedVerses: {},

  isLoadingNotes: false,
  isCreatingNote: false,
  isUpdatingNote: false,
  isDeletingNote: false,

  error: null,

  // Fetch all notes for the user
  fetchNotes: async () => {
    set({ isLoadingNotes: true, error: null });

    try {
      const notes = await notesApi.getNotes();
      set({
        notes,
        isLoadingNotes: false
      });

      // Update savedVerses cache
      const savedVerses: { [key: string]: number[] } = {};
      notes.forEach(note => {
        const key = `${note.book.id}-${note.chapter}`;
        if (!savedVerses[key]) {
          savedVerses[key] = [];
        }
        note.verses.forEach(verseId => {
          if (!savedVerses[key].includes(verseId)) {
            savedVerses[key].push(verseId);
          }
        });
      });
      set({ savedVerses });

    } catch (error) {
      console.error('Failed to fetch notes:', error);
      set({
        isLoadingNotes: false,
        error: 'Failed to load notes'
      });
    }
  },

  // Create a new note
  createNote: async (noteData: CreateNoteRequest): Promise<Note | null> => {
    set({ isCreatingNote: true, error: null });

    try {
      const newNote = await notesApi.createNote(noteData);

      set(state => ({
        notes: [newNote, ...state.notes],
        isCreatingNote: false
      }));

      // Update savedVerses cache
      const key = `${noteData.book_id}-${noteData.chapter}`;
      set(state => ({
        savedVerses: {
          ...state.savedVerses,
          [key]: [...(state.savedVerses[key] || []), ...noteData.verses.filter(v => !state.savedVerses[key]?.includes(v))]
        }
      }));

      return newNote;
    } catch (error) {
      console.error('Failed to create note:', error);
      set({
        isCreatingNote: false,
        error: 'Failed to create note'
      });
      return null;
    }
  },

  // Update an existing note
  updateNote: async (noteId: number, noteData: UpdateNoteRequest): Promise<Note | null> => {
    set({ isUpdatingNote: true, error: null });

    try {
      const updatedNote = await notesApi.updateNote(noteId, noteData);

      set(state => ({
        notes: state.notes.map(note => note.id === noteId ? updatedNote : note),
        isUpdatingNote: false
      }));

      return updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
      set({
        isUpdatingNote: false,
        error: 'Failed to update note'
      });
      return null;
    }
  },

  // Delete a note
  deleteNote: async (noteId: number): Promise<boolean> => {
    set({ isDeletingNote: true, error: null });

    try {
      await notesApi.deleteNote(noteId);

      set(state => ({
        notes: state.notes.filter(note => note.id !== noteId),
        isDeletingNote: false
      }));

      return true;
    } catch (error) {
      console.error('Failed to delete note:', error);
      set({
        isDeletingNote: false,
        error: 'Failed to delete note'
      });
      return false;
    }
  },

  // Get notes for a specific book and chapter
  getNotesForReference: (bookId: number, chapter: number): Note[] => {
    const { notes } = get();
    return notes.filter(note => note.book.id === bookId && note.chapter === chapter);
  },

  // Get saved verses for a specific book and chapter
  getSavedVersesForReference: (bookId: number, chapter: number): number[] => {
    const { savedVerses } = get();
    const key = `${bookId}-${chapter}`;
    return savedVerses[key] || [];
  },

  // Save verses for a reference (create note if needed)
  saveVersesForReference: async (bookId: number, chapter: number, verseIds: number[]): Promise<Note | null> => {
    const existingNotes = get().getNotesForReference(bookId, chapter);

    // Check if we already have a note with some of these verses
    const existingNote = existingNotes.find(note =>
      note.verses.some(verseId => verseIds.includes(verseId))
    );

    if (existingNote) {
      // Update existing note by merging verses
      const mergedVerses = Array.from(new Set([...existingNote.verses, ...verseIds]));
      return await get().updateNote(existingNote.id, {
        verses: mergedVerses
      });
    } else {
      // Create new note
      return await get().createNote({
        book_id: bookId,
        chapter,
        verses: verseIds
      });
    }
  },

  // Unsave verses for a reference (remove from note or delete note)
  unsaveVersesForReference: async (bookId: number, chapter: number, verseIds: number[]): Promise<boolean> => {
    const existingNotes = get().getNotesForReference(bookId, chapter);

    // Find notes that contain the verses to unsave
    const notesToUpdate = existingNotes.filter(note =>
      note.verses.some(verseId => verseIds.includes(verseId))
    );

    for (const note of notesToUpdate) {
      const remainingVerses = note.verses.filter(verseId => !verseIds.includes(verseId));

      if (remainingVerses.length === 0) {
        // Delete the note if no verses remain
        const success = await get().deleteNote(note.id);
        if (!success) return false;
      } else {
        // Update the note with remaining verses
        const updatedNote = await get().updateNote(note.id, {
          verses: remainingVerses
        });
        if (!updatedNote) return false;
      }
    }

    return true;
  },

  clearError: () => {
    set({ error: null });
  },
}));
