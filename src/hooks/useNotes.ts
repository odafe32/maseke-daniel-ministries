import { useEffect, useRef } from 'react';
import { useNotesStore } from '@/src/stores/notesStore';

export const useNotes = () => {
  const notesStore = useNotesStore();
  const initializedRef = useRef(false);

  // Initialize notes loading on first use (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log('Initializing notes data loading...');

      // Load notes from API
      notesStore.fetchNotes().catch(error => {
        console.error('Failed to initialize notes:', error);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    // State
    notes: notesStore.notes,
    savedVerses: notesStore.savedVerses,

    // Loading states
    isLoadingNotes: notesStore.isLoadingNotes,
    isCreatingNote: notesStore.isCreatingNote,
    isUpdatingNote: notesStore.isUpdatingNote,
    isDeletingNote: notesStore.isDeletingNote,

    // Error
    error: notesStore.error,

    // Actions
    fetchNotes: notesStore.fetchNotes,
    createNote: notesStore.createNote,
    updateNote: notesStore.updateNote,
    deleteNote: notesStore.deleteNote,

    // Helper functions
    getNotesForReference: notesStore.getNotesForReference,
    getSavedVersesForReference: notesStore.getSavedVersesForReference,
    saveVersesForReference: notesStore.saveVersesForReference,
    unsaveVersesForReference: notesStore.unsaveVersesForReference,

    clearError: notesStore.clearError,
  };
};
