import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Note, notesApi, CreateNoteRequest, UpdateNoteRequest } from '../api/notesApi';

interface NotesState {
  // Data
  notes: Note[];
  savedVerses: { [key: string]: number[] }; // bookId-chapter: verseIds[]
  pendingNotes: CreateNoteRequest[];
  isConnected: boolean;

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
  loadCachedNotes: () => Promise<Note[]>;
  saveCachedNotes: () => Promise<void>;
  loadPendingNotes: () => Promise<void>;
  savePendingNotes: () => Promise<void>;
  processPendingNotes: () => Promise<void>;
  startPendingProcessing: () => () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial state
  notes: [],
  savedVerses: {},
  pendingNotes: [],
  isConnected: true,

  isLoadingNotes: false,
  isCreatingNote: false,
  isUpdatingNote: false,
  isDeletingNote: false,

  error: null,

  // Fetch all notes for the user
  fetchNotes: async () => {
    set({ isLoadingNotes: true, error: null });

    // Load cached notes immediately for offline use
    const cachedNotes = await get().loadCachedNotes();
    if (cachedNotes.length) {
      set({ notes: cachedNotes });
    }

    try {
      const notes = await notesApi.getNotes();
      set({
        notes,
        isLoadingNotes: false
      });

      await get().saveCachedNotes();

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

      // If we successfully fetched, attempt to process pending notes in background
      get().processPendingNotes().catch((err) => console.error('Failed to process pending notes:', err));

    } catch (error) {
      console.error('Failed to fetch notes:', error);
      set({
        isLoadingNotes: false,
        error: 'Failed to load notes'
      });
    }
  },

  saveCachedNotes: async () => {
    try {
      const { notes } = get();
      await AsyncStorage.setItem('cached_notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save cached notes:', error);
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

      await get().saveCachedNotes();

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

      // If network error, queue this note for later
      set(state => ({
        pendingNotes: [...state.pendingNotes, noteData],
        isCreatingNote: false,
      }));
      get().savePendingNotes().catch(err => console.error('Failed to persist pending notes:', err));

      set({ error: 'Note saved offline. Will sync when online.' });
      return null;
    }
  },

  // Update an existing note
  updateNote: async (noteId: number, noteData: UpdateNoteRequest): Promise<Note | null> => {
    set({ isUpdatingNote: true, error: null });

    try {
      const updatedNote = await notesApi.updateNote(noteId, noteData);

      set(state => {
        const newNotes = state.notes.map(note => note.id === noteId ? updatedNote : note);

        // Update savedVerses cache
        const newSavedVerses = { ...state.savedVerses };
        const key = `${updatedNote.book.id}-${updatedNote.chapter}`;

        // Remove old verses from cache
        if (newSavedVerses[key]) {
          // Find the old note to remove its verses
          const oldNote = state.notes.find(note => note.id === noteId);
          if (oldNote) {
            newSavedVerses[key] = newSavedVerses[key].filter(verseId => !oldNote.verses.includes(verseId));
          }
        }

        // Add new verses to cache
        if (!newSavedVerses[key]) {
          newSavedVerses[key] = [];
        }
        updatedNote.verses.forEach(verseId => {
          if (!newSavedVerses[key].includes(verseId)) {
            newSavedVerses[key].push(verseId);
          }
        });

        return {
          notes: newNotes,
          savedVerses: newSavedVerses,
          isUpdatingNote: false
        };
      });

      await get().saveCachedNotes();

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

      set(state => {
        // Find the note being deleted to remove its verses from cache
        const noteToDelete = state.notes.find(note => note.id === noteId);
        const newSavedVerses = { ...state.savedVerses };

        if (noteToDelete) {
          const key = `${noteToDelete.book.id}-${noteToDelete.chapter}`;
          if (newSavedVerses[key]) {
            newSavedVerses[key] = newSavedVerses[key].filter(verseId => !noteToDelete.verses.includes(verseId));

            // Remove the key if no verses remain
            if (newSavedVerses[key].length === 0) {
              delete newSavedVerses[key];
            }
          }
        }

        return {
          notes: state.notes.filter(note => note.id !== noteId),
          savedVerses: newSavedVerses,
          isDeletingNote: false
        };
      });

      await get().saveCachedNotes();

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
      const newNote = await get().createNote({
        book_id: bookId,
        chapter,
        verses: verseIds
      });

      // If offline, optimistically add to notes list so UI reflects bookmark immediately
      if (!newNote) {
        const optimisticNote: Note = {
          id: Date.now(),
          book: { id: bookId, name: 'Pending', testament: 'Pending' },
          chapter,
          verses: verseIds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          notes: [optimisticNote, ...state.notes],
        }));

        await get().saveCachedNotes();
      }

      return newNote;
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

  loadPendingNotes: async () => {
    try {
      const stored = await AsyncStorage.getItem('pending_notes');
      if (stored) {
        const parsed = JSON.parse(stored) as CreateNoteRequest[];
        set({ pendingNotes: parsed });
      }
    } catch (error) {
      console.error('Failed to load pending notes:', error);
    }
  },

  loadCachedNotes: async (): Promise<Note[]> => {
    try {
      const cached = await AsyncStorage.getItem('cached_notes');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached notes:', error);
      return [];
    }
  },

  savePendingNotes: async () => {
    try {
      const { pendingNotes } = get();
      await AsyncStorage.setItem('pending_notes', JSON.stringify(pendingNotes));
    } catch (error) {
      console.error('Failed to save pending notes:', error);
    }
  },

  processPendingNotes: async () => {
    const { pendingNotes, isConnected } = get();
    if (!isConnected || !pendingNotes.length) return;

    const [next, ...rest] = pendingNotes;

    try {
      const createdNote = await notesApi.createNote(next);

      set(state => ({
        notes: [createdNote, ...state.notes],
        pendingNotes: rest,
      }));

      await get().savePendingNotes();

    } catch (error) {
      console.error('Failed to sync pending note:', error);
      return;
    }

    if (get().pendingNotes.length) {
      setTimeout(() => {
        get().processPendingNotes().catch(err => console.error('Failed to process pending notes:', err));
      }, 20000);
    }
  },

  startPendingProcessing: () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = Boolean(state.isConnected && state.isInternetReachable);
      set({ isConnected: connected });

      if (connected) {
        get().processPendingNotes().catch(err => console.error('Failed to process pending notes:', err));
      }
    });

    get().loadPendingNotes().catch(err => console.error('Failed to load pending notes on start:', err));

    return unsubscribe;
  },

  clearError: () => {
    set({ error: null });
  },
}));
