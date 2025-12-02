import { useEffect, useRef } from 'react';
import { useNotesStore } from '@/src/stores/notesStore';

export const useNotes = () => {
  const notesStore = useNotesStore();
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize notes loading on first use (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log('Initializing notes data loading...');

      // Load pending notes & start connectivity listener
      notesStore.loadPendingNotes().catch(err => console.error('Failed to load pending notes:', err));
      unsubscribeRef.current = notesStore.startPendingProcessing();

      // Load notes from API (with cached fallback handled in store)
      notesStore.fetchNotes().catch(error => {
        console.error('Failed to initialize notes:', error);
      });
    }

    return () => {
      unsubscribeRef.current?.();
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    // State
    notes: notesStore.notes,
    savedVerses: notesStore.savedVerses,
    chapterVerseCache: notesStore.chapterVerseCache,

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
    ensureChapterVerses: notesStore.ensureChapterVerses,
    prefetchVersesForNotes: notesStore.prefetchVersesForNotes,

    // Helper functions
    getNotesForReference: notesStore.getNotesForReference,
    getSavedVersesForReference: notesStore.getSavedVersesForReference,
    saveVersesForReference: notesStore.saveVersesForReference,
    unsaveVersesForReference: notesStore.unsaveVersesForReference,
    getVerseTextForNote: notesStore.getVerseTextForNote,

    clearError: notesStore.clearError,
  };
};
