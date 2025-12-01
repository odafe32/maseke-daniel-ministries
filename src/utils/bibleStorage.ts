import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '@/src/api/bibleApi';

export interface UserPreferences {
  themeId: string;
  fontSize: number;
  lastRead: {
    bookId: number;
    chapterNumber: number;
    timestamp: string;
  } | null;
  readingHistory: Array<{
    bookId: number;
    chapterNumber: number;
    timestamp: string;
  }>;
  appSettings: {
    autoDownloadUpdates: boolean;
    showVerseNumbers: boolean;
  };
}

export interface BibleData {
  metadata: {
    version: string;
    lastUpdated: string;
    totalBooks: number;
    totalChapters: number;
    totalVerses: number;
  };
  testaments: any[];
  books: any[];
  chapters: Record<string, Record<string, string>>;
}

const PREFERENCES_KEY = '@bible_app_preferences';
const BIBLE_DATA_KEY = '@bible_app_data';
const CURRENT_VERSION = '1.0';

const DEFAULT_PREFERENCES: UserPreferences = {
  themeId: 'classic',
  fontSize: 18,
  lastRead: null,
  readingHistory: [],
  appSettings: {
    autoDownloadUpdates: true,
    showVerseNumbers: true,
  },
};

const createEmptyBibleData = (): BibleData => ({
  metadata: {
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    totalBooks: 0,
    totalChapters: 0,
    totalVerses: 0,
  },
  testaments: [],
  books: [],
  chapters: {},
});

export class BibleStorage {
  // Preferences Management
  static async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    try {
      const currentPrefs = await this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...prefs };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  static async getPreferences(): Promise<UserPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (prefsJson) {
        const prefs = JSON.parse(prefsJson);
        // Merge with defaults to handle missing properties
        return { ...DEFAULT_PREFERENCES, ...prefs };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  // Individual preference setters
  static async saveTheme(themeId: string): Promise<void> {
    await this.savePreferences({ themeId });
  }

  static async saveFontSize(fontSize: number): Promise<void> {
    await this.savePreferences({ fontSize });
  }

  static async saveLastRead(bookId: number, chapterNumber: number): Promise<void> {
    const lastRead = {
      bookId,
      chapterNumber,
      timestamp: new Date().toISOString(),
    };

    const prefs = await this.getPreferences();
    const updatedHistory = [
      lastRead,
      ...prefs.readingHistory.filter(
        item => !(item.bookId === bookId && item.chapterNumber === chapterNumber)
      ),
    ].slice(0, 50); // Keep last 50 entries

    await this.savePreferences({
      lastRead,
      readingHistory: updatedHistory,
    });
  }

  static async saveAppSetting(key: keyof UserPreferences['appSettings'], value: boolean): Promise<void> {
    const prefs = await this.getPreferences();
    await this.savePreferences({
      appSettings: {
        ...prefs.appSettings,
        [key]: value,
      },
    });
  }

  // Bible Data Management
  static async saveBibleData(data: BibleData): Promise<void> {
    try {
      await AsyncStorage.setItem(BIBLE_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save Bible data:', error);
      throw error;
    }
  }

  static async getBibleData(): Promise<BibleData | null> {
    try {
      const dataJson = await AsyncStorage.getItem(BIBLE_DATA_KEY);
      return dataJson ? JSON.parse(dataJson) : null;
    } catch (error) {
      console.error('Failed to load Bible data:', error);
      return null;
    }
  }

  static async saveChapterContent(bookId: number, chapterNumber: number, content: string, bookInfo?: Book): Promise<void> {
    try {
      const data = (await this.getBibleData()) ?? createEmptyBibleData();
      const bookKey = `book_${bookId}`;

      if (!data.chapters[bookKey]) {
        data.chapters[bookKey] = {};
      }

      data.chapters[bookKey][chapterNumber.toString()] = content;

      if (bookInfo) {
        const existingBookIndex = data.books.findIndex(book => book.id === bookInfo.id);
        if (existingBookIndex >= 0) {
          data.books[existingBookIndex] = bookInfo;
        } else {
          data.books.push(bookInfo);
        }

        if (!data.testaments.find((t: { id: number }) => t.id === bookInfo.testament_id)) {
          data.testaments.push({ id: bookInfo.testament_id, name: '', books: [bookInfo] });
        } else {
          const testament = data.testaments.find((t: { id: number }) => t.id === bookInfo.testament_id);
          if (testament) {
            const existing = testament.books?.find((b: Book) => b.id === bookInfo.id);
            if (!existing) {
              testament.books = [...(testament.books || []), bookInfo];
            }
          }
        }
      }

      const totalChapters = Object.values(data.chapters).reduce((sum, chapters) => sum + Object.keys(chapters).length, 0);
      const totalVerses = Object.values(data.chapters).reduce((sum, chapters) => sum + Object.keys(chapters).length * 20, 0);

      data.metadata = {
        ...data.metadata,
        lastUpdated: new Date().toISOString(),
        totalBooks: Object.keys(data.chapters).length,
        totalChapters,
        totalVerses,
      };

      await this.saveBibleData(data);
    } catch (error) {
      console.error('Failed to save chapter content:', error);
    }
  }

  static async hasBibleData(): Promise<boolean> {
    const data = await this.getBibleData();
    return data !== null;
  }

  static async clearBibleData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIBLE_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear Bible data:', error);
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PREFERENCES_KEY, BIBLE_DATA_KEY]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  static async getStorageInfo(): Promise<{
    preferencesSize: number;
    bibleDataSize: number;
    totalSize: number;
  }> {
    try {
      const prefs = await AsyncStorage.getItem(PREFERENCES_KEY);
      const bibleData = await AsyncStorage.getItem(BIBLE_DATA_KEY);

      const preferencesSize = prefs ? prefs.length : 0;
      const bibleDataSize = bibleData ? bibleData.length : 0;
      const totalSize = preferencesSize + bibleDataSize;

      return {
        preferencesSize,
        bibleDataSize,
        totalSize,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        preferencesSize: 0,
        bibleDataSize: 0,
        totalSize: 0,
      };
    }
  }
}
