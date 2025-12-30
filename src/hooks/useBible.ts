import { useEffect, useState, useRef } from 'react';
import { useBibleStore } from '@/src/stores/bibleStore';
import { Book, BibleChapter } from '@/src/api/bibleApi';

export const useBible = () => {
  const bibleStore = useBibleStore();
  const initializedRef = useRef(false);

  // Initialize local data loading on first use (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log('Initializing Bible data loading...');

      bibleStore.loadLocalData().then(() => {
        if (bibleStore.testaments.length === 0 && !bibleStore.isLoadingTestaments) {
          bibleStore.fetchTestaments();
        }
      }).catch(error => {
        console.error('Failed to initialize Bible data:', error);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    // State
    testaments: bibleStore.testaments,
    selectedBook: bibleStore.selectedBook,
    currentChapter: bibleStore.currentChapter,

    // Loading states
    isLoadingTestaments: bibleStore.isLoadingTestaments,
    isLoadingBooks: bibleStore.isLoadingBooks,
    isLoadingChapter: bibleStore.isLoadingChapter,

    // Local data status
    hasLocalData: bibleStore.hasLocalData,

    // Actions
    fetchTestaments: bibleStore.fetchTestaments,
    fetchBooks: bibleStore.fetchBooks,
    fetchChapter: bibleStore.fetchChapter,
    setSelectedBook: bibleStore.setSelectedBook,
    clearCurrentChapter: bibleStore.clearCurrentChapter,

    // On-demand downloading
    downloadBook: bibleStore.downloadBook,

    // Download progress
    downloadProgress: bibleStore.downloadProgress,

    // Computed values
    hasCurrentChapter: !!bibleStore.currentChapter,
    currentBookName: bibleStore.selectedBook?.name || '',
  };
};

export const useBibleBooks = (testamentId?: number) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bibleStore = useBibleStore();

  useEffect(() => {
    if (testamentId) {
      setIsLoading(true);
      bibleStore.fetchBooks(testamentId).then((fetchedBooks: Book[]) => {
        setBooks(fetchedBooks);
        setIsLoading(false);
      });
    }
  }, [testamentId]); // Remove bibleStore from dependencies

  return { books, isLoading };
};

export const useBibleChapter = (bookId?: number, chapter?: number) => {
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bibleStore = useBibleStore();

  useEffect(() => {
    if (bookId && chapter) {
      setIsLoading(true);
      bibleStore.fetchChapter(bookId, chapter).then(() => {
        // The chapter data is stored in the store, so we don't need to set it here
        setIsLoading(false);
      });
    }
  }, [bookId, chapter]); // Remove bibleStore from dependencies

  return { isLoading };
};
