import { create } from 'zustand';
import { BibleStorage } from '../utils/bibleStorage';
import { bibleApi } from '../api/bibleApi';


interface Testament {
  id: number;
  name: string;
  books: Book[];
}

interface Book {
  id: number;
  name: string;
  testament_id: number;
  chapters_count: number;
}

interface BibleChapter {
  dateLabel: string;
  title: string;
  body: string;
}

interface BibleState {
  // Data
  testaments: Testament[];
  selectedBook: Book | null;
  currentChapter: BibleChapter | null;

  // Loading states
  isLoadingTestaments: boolean;
  isLoadingBooks: boolean;
  isLoadingChapter: boolean;

  // Local data availability
  hasLocalData: boolean;

  // Download progress state
  downloadProgress: { current: number; total: number; bookName: string } | null;

  // Actions
  fetchTestaments: () => Promise<void>;
  fetchBooks: (testamentId: number) => Promise<Book[]>;
  fetchChapter: (bookId: number, chapterNumber: number, bookInfo?: Book) => Promise<void>;
  setSelectedBook: (book: Book | null) => void;
  clearCurrentChapter: () => void;
  loadLocalData: () => Promise<void>;

  // On-demand book downloading
  downloadBook: (bookId: number) => Promise<void>;
  setDownloadProgress: (progress: { current: number; total: number; bookName: string } | null) => void;
}

export const useBibleStore = create<BibleState>((set, get) => ({
  // Initial state
  testaments: [],
  selectedBook: null,
  currentChapter: null,

  isLoadingTestaments: false,
  isLoadingBooks: false,
  isLoadingChapter: false,
  hasLocalData: false,
  downloadProgress: null,

  // Load local Bible data on initialization
  loadLocalData: async () => {
    try {
      const localData = await BibleStorage.getBibleData();
      if (localData) {
        set({
          testaments: localData.testaments,
          hasLocalData: true
        });
        console.log('Loaded Bible data from local storage');
      } else {
        console.log('No local Bible data found, will use API');
      }
    } catch (error) {
      console.error('Failed to load local Bible data:', error);
    }
  },

  // Fetch testaments - use local data if available, otherwise API
  fetchTestaments: async () => {
    const { hasLocalData, testaments } = get();

    // If we already have local data loaded, don't refetch
    if (hasLocalData && testaments.length > 0) {
      return;
    }

    set({ isLoadingTestaments: true });

    try {
      // Try local data first
      const localData = await BibleStorage.getBibleData();
      if (localData) {
        set({
          testaments: localData.testaments,
          hasLocalData: true,
          isLoadingTestaments: false
        });
        return;
      }

      // Fallback to API
      const response = await bibleApi.getTestaments();

      if (response) {
        set({
          testaments: response,
          isLoadingTestaments: false
        });
      } else {
        throw new Error('Failed to fetch testaments');
      }
    } catch (error) {
      console.error('Failed to fetch testaments:', error);
      set({ isLoadingTestaments: false });
    }
  },

  // Fetch books for a testament - use local data if available
  fetchBooks: async (testamentId: number): Promise<Book[]> => {
    const { hasLocalData, testaments } = get();

    // Try local data first
    if (hasLocalData) {
      const localData = await BibleStorage.getBibleData();
      if (localData) {
        const testament = localData.testaments.find(t => t.id === testamentId);
        if (testament && testament.books) {
          return testament.books;
        }
      }
    }

    // Fallback to API
    set({ isLoadingBooks: true });

    try {
      const response = await bibleApi.getBooks(testamentId);

      if (response) {
        set({ isLoadingBooks: false });
        return response;
      } else {
        throw new Error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      set({ isLoadingBooks: false });
      return [];
    }
  },

  // Fetch chapter - use local data if available, otherwise API
  fetchChapter: async (bookId: number, chapterNumber: number, bookInfo?: Book) => {
    set({ isLoadingChapter: true });

    try {
      // Try local data first
      const localData = await BibleStorage.getBibleData();
      if (localData && localData.chapters[`book_${bookId}`]) {
        const chapterData = localData.chapters[`book_${bookId}`][chapterNumber.toString()];
        if (chapterData) {
          const chapter: BibleChapter = {
            dateLabel: `Chapter ${chapterNumber}`,
            title: `Chapter ${chapterNumber}`,
            body: chapterData,
          };

          set({
            currentChapter: chapter,
            isLoadingChapter: false
          });
          return;
        }
      }

      // Fallback to API
      const response = await bibleApi.getChapter(bookId, chapterNumber);

      if (response) {
        set({
          currentChapter: response,
          isLoadingChapter: false
        });

        // Cache chapter locally for future offline access
        if (response.body) {
          const { testaments } = get();
          const resolvedBookInfo = bookInfo ?? testaments
            .flatMap(testament => testament.books)
            .find(book => book.id === bookId);

          await BibleStorage.saveChapterContent(bookId, chapterNumber, response.body, resolvedBookInfo);
        }
      } else {
        throw new Error('Failed to fetch chapter');
      }
    } catch (error) {
      console.error('Failed to fetch chapter:', error);
      set({ isLoadingChapter: false });
    }
  },

  setSelectedBook: (book: Book | null) => {
    set({ selectedBook: book });
  },

  clearCurrentChapter: () => {
    set({ currentChapter: null });
  },

  // Download a specific book on-demand
  downloadBook: async (bookId: number) => {
    try {
      set({ isLoadingBooks: true });

      // Get book info first
      const { testaments } = get();
      let bookInfo: Book | undefined;

      for (const testament of testaments) {
        bookInfo = testament.books.find(b => b.id === bookId);
        if (bookInfo) break;
      }

      if (!bookInfo) {
        throw new Error('Book not found');
      }

      // Download all chapters for this book
      const bookChapters: Record<string, string> = {};

      // Set initial progress
      set({ downloadProgress: { current: 0, total: bookInfo.chapters_count, bookName: bookInfo.name } });

      for (let chapterNum = 1; chapterNum <= bookInfo.chapters_count; chapterNum++) {
        try {
          const chapterResponse = await bibleApi.getChapter(bookId, chapterNum);

          if (chapterResponse && chapterResponse.body) {
            // Store the formatted chapter content directly
            bookChapters[chapterNum.toString()] = chapterResponse.body;
          }
        } catch (chapterError) {
          console.warn(`Failed to load chapter ${chapterNum} of ${bookInfo.name}:`, chapterError);
          // Continue with other chapters
        }

        // Update progress
        set({ downloadProgress: { current: chapterNum, total: bookInfo.chapters_count, bookName: bookInfo.name } });
      }

      // Clear progress when done
      set({ downloadProgress: null });

      // Update local storage with new book
      const localData = await BibleStorage.getBibleData();
      if (localData) {
        const updatedData = {
          ...localData,
          books: [...localData.books, bookInfo],
          chapters: {
            ...localData.chapters,
            [`book_${bookId}`]: bookChapters,
          },
        };

        // Update metadata
        updatedData.metadata = {
          ...updatedData.metadata,
          totalBooks: updatedData.books.length,
          totalChapters: Object.keys(updatedData.chapters).reduce((sum, bookKey) =>
            sum + Object.keys(updatedData.chapters[bookKey]).length, 0
          ),
          totalVerses: Object.keys(updatedData.chapters).reduce((sum, bookKey) =>
            sum + Object.keys(updatedData.chapters[bookKey]).length * 20, 0 // Rough estimate: 20 verses per chapter
          ),
        };

        await BibleStorage.saveBibleData(updatedData);
      }

      set({ isLoadingBooks: false });
    } catch (error) {
      console.error('Failed to download book:', error);
      set({ isLoadingBooks: false, downloadProgress: null });
    }
  },

  setDownloadProgress: (progress: { current: number; total: number; bookName: string } | null) => {
    set({ downloadProgress: progress });
  },
}));
