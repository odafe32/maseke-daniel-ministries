import client from './client';

export interface Testament {
  id: number;
  name: string;
  books: Book[];
}

export interface Book {
  id: number;
  name: string;
  testament_id: number;
  chapters_count: number;
}

export interface Verse {
  id: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  dateLabel: string;
  title: string;
  body: string;
}

export interface SearchResult {
  id: number;
  reference: string;
  text: string;
}

export const bibleApi = {
  // Get all testaments with their books
  getTestaments: async (): Promise<Testament[]> => {
    const response = await client.get('/mobile/bible/testaments');
    return response.data.data;
  },

  // Get books for a specific testament
  getBooks: async (testamentId: number): Promise<Book[]> => {
    const response = await client.get('/mobile/bible/books', {
      params: { testament_id: testamentId }
    });
    return response.data.data;
  },

  // Get verses for a specific book and chapter
  getVerses: async (bookId: number, chapter: number): Promise<Verse[]> => {
    const response = await client.get('/mobile/bible/verses', {
      params: { book_id: bookId, chapter }
    });
    return response.data.data;
  },

  // Get formatted chapter content for reading
  getChapter: async (bookId: number, chapter: number): Promise<BibleChapter> => {
    const response = await client.get('/mobile/bible/chapter', {
      params: { book_id: bookId, chapter }
    });
    return response.data.data;
  },

  // Search verses by text
  searchVerses: async (query: string): Promise<SearchResult[]> => {
    const response = await client.get('/mobile/bible/search', {
      params: { query }
    });
    return response.data.data;
  }
};
