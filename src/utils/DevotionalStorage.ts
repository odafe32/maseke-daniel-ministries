import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevotionalEntry } from '@/src/api/devotionApi';

export interface DevotionalPreferences {
  themeId: string;
  fontSize: number;
  lastViewed: {
    devotionalId: number;
    dayNumber: number;
    entryId: number;
    timestamp: string;
  } | null;
  viewingHistory: Array<{
    devotionalId: number;
    dayNumber: number;
    entryId: number;
    timestamp: string;
  }>;
  appSettings: {
    autoPlayVideo: boolean;
    showVideoIntro: boolean;
    enableAutoRefresh: boolean; // ← NEW: Auto-refresh setting
    refreshInterval: number; // ← NEW: Custom refresh interval
  };
}

export interface DevotionalCache {
  metadata: {
    version: string;
    lastUpdated: string;
    totalEntries: number;
    lastRefresh?: string; // ← NEW: Track last refresh
  };
  devotionals: Record<string, any>;
  entries: Record<string, DevotionalEntry>;
  dayIndex: Record<string, number>;
}

export interface RefreshTimestamps {
  devotionals: string | null;
  entries: Record<string, string>; // entryId -> timestamp
  bookmarks: string | null;
  lastAutoRefresh: string | null;
}

const PREFERENCES_KEY = '@devotional_preferences';
const CACHE_KEY = '@devotional_cache';
const THEME_KEY = '@devotional_theme';
const FONT_SIZE_KEY = '@devotional_font_size';
const REFRESH_TIMESTAMPS_KEY = '@devotional_refresh_timestamps';
const CURRENT_VERSION = '1.0';
const CACHE_EXPIRY_DAYS = 7;

// Refresh configuration
export const REFRESH_CONFIG = {
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  BACKGROUND_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
  FORCE_REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour - force refresh if older
};

export const DEFAULT_PREFERENCES: DevotionalPreferences = {
  themeId: 'classic',
  fontSize: 18,
  lastViewed: null,
  viewingHistory: [],
  appSettings: {
    autoPlayVideo: true,
    showVideoIntro: true,
    enableAutoRefresh: true,
    refreshInterval: REFRESH_CONFIG.AUTO_REFRESH_INTERVAL,
  },
};

const createEmptyCache = (): DevotionalCache => ({
  metadata: {
    version: CURRENT_VERSION,
    lastUpdated: new Date().toISOString(),
    totalEntries: 0,
    lastRefresh: new Date().toISOString(),
  },
  devotionals: {},
  entries: {},
  dayIndex: {},
});

const createEmptyRefreshTimestamps = (): RefreshTimestamps => ({
  devotionals: null,
  entries: {},
  bookmarks: null,
  lastAutoRefresh: null,
});

export class DevotionalStorage {
  // ============================================
  // REFRESH TIMESTAMP MANAGEMENT
  // ============================================

  /**
   * Get refresh timestamps
   */
  static async getRefreshTimestamps(): Promise<RefreshTimestamps> {
    try {
      const timestampsJson = await AsyncStorage.getItem(REFRESH_TIMESTAMPS_KEY);
      if (timestampsJson) {
        return { ...createEmptyRefreshTimestamps(), ...JSON.parse(timestampsJson) };
      }
    } catch (error) {
      console.error('❌ Failed to load refresh timestamps:', error);
    }
    return createEmptyRefreshTimestamps();
  }

  /**
   * Save refresh timestamps
   */
  static async saveRefreshTimestamps(timestamps: Partial<RefreshTimestamps>): Promise<void> {
    try {
      const current = await this.getRefreshTimestamps();
      const updated = { ...current, ...timestamps };
      await AsyncStorage.setItem(REFRESH_TIMESTAMPS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Failed to save refresh timestamps:', error);
    }
  }

  /**
   * Mark entry as refreshed
   */
  static async markEntryRefreshed(entryId: number): Promise<void> {
    const timestamp = new Date().toISOString();
    const current = await this.getRefreshTimestamps();
    
    await this.saveRefreshTimestamps({
      entries: { ...current.entries, [entryId.toString()]: timestamp },
      lastAutoRefresh: timestamp,
    });
    
    console.log(`✅ Entry ${entryId} marked as refreshed at ${timestamp}`);
  }

  /**
   * Check if entry needs refresh
   */
  static async shouldRefreshEntry(entryId: number, forceThreshold = REFRESH_CONFIG.FORCE_REFRESH_THRESHOLD): Promise<boolean> {
    try {
      const timestamps = await this.getRefreshTimestamps();
      const lastRefresh = timestamps.entries[entryId.toString()];
      
      if (!lastRefresh) {
        console.log(`⏰ Entry ${entryId} never refreshed - should refresh`);
        return true;
      }
      
      const lastRefreshTime = new Date(lastRefresh).getTime();
      const now = new Date().getTime();
      const timeSinceRefresh = now - lastRefreshTime;
      
      const shouldRefresh = timeSinceRefresh > forceThreshold;
      console.log(`⏰ Entry ${entryId} last refreshed ${Math.floor(timeSinceRefresh / 60000)}min ago - ${shouldRefresh ? 'should refresh' : 'still fresh'}`);
      
      return shouldRefresh;
    } catch (error) {
      console.error('❌ Failed to check refresh status:', error);
      return true; // Default to refresh on error
    }
  }

  /**
   * Mark devotionals list as refreshed
   */
  static async markDevotionalsRefreshed(): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.saveRefreshTimestamps({ devotionals: timestamp });
    console.log(`✅ Devotionals list marked as refreshed at ${timestamp}`);
  }

  /**
   * Mark bookmarks as refreshed
   */
  static async markBookmarksRefreshed(): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.saveRefreshTimestamps({ bookmarks: timestamp });
    console.log(`✅ Bookmarks marked as refreshed at ${timestamp}`);
  }

  // ============================================
  // THEME MANAGEMENT (DEDICATED STORAGE)
  // ============================================

  /**
   * Get theme ID with instant access
   * Uses dedicated storage for maximum speed and reliability
   */
  static async getTheme(): Promise<string> {
    try {
      // Try dedicated theme storage first (fastest)
      const theme = await AsyncStorage.getItem(THEME_KEY);
      if (theme) {
        console.log('✅ Theme loaded from dedicated storage:', theme);
        return theme;
      }
      
      // Fallback to preferences
      const prefs = await this.getPreferences();
      const themeId = prefs.themeId || DEFAULT_PREFERENCES.themeId;
      
      // Save to dedicated storage for next time
      await AsyncStorage.setItem(THEME_KEY, themeId);
      console.log('✅ Theme loaded from preferences and cached:', themeId);
      
      return themeId;
    } catch (error) {
      console.error('❌ Failed to load theme:', error);
      return DEFAULT_PREFERENCES.themeId;
    }
  }

  /**
   * Save theme with triple storage for maximum reliability
   * 1. Dedicated theme storage (instant access)
   * 2. Preferences (backup)
   * 3. In-memory (runtime)
   */
  static async saveTheme(themeId: string): Promise<void> {
    try {
      // Save to all storage locations
      const saveOperations = [
        // 1. Dedicated theme storage (fastest)
        AsyncStorage.setItem(THEME_KEY, themeId),
        // 2. Update preferences (backup)
        this.savePreferences({ themeId }),
      ];
      
      await Promise.all(saveOperations);
      
      console.log('✅ Theme saved to all storage locations:', themeId);
    } catch (error) {
      console.error('❌ Failed to save theme:', error);
      throw error;
    }
  }

  /**
   * Get font size with instant access
   */
  static async getFontSize(): Promise<number> {
    try {
      const fontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
      if (fontSize) {
        return parseInt(fontSize, 10);
      }
      
      const prefs = await this.getPreferences();
      const size = prefs.fontSize || DEFAULT_PREFERENCES.fontSize;
      
      await AsyncStorage.setItem(FONT_SIZE_KEY, size.toString());
      return size;
    } catch (error) {
      console.error('❌ Failed to load font size:', error);
      return DEFAULT_PREFERENCES.fontSize;
    }
  }

  /**
   * Save font size with dual storage
   */
  static async saveFontSize(fontSize: number): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(FONT_SIZE_KEY, fontSize.toString()),
        this.savePreferences({ fontSize }),
      ]);
      
      console.log('✅ Font size saved:', fontSize);
    } catch (error) {
      console.error('❌ Failed to save font size:', error);
      throw error;
    }
  }

  // ============================================
  // PREFERENCES MANAGEMENT
  // ============================================

  /**
   * Save user preferences
   */
  static async savePreferences(prefs: Partial<DevotionalPreferences>): Promise<void> {
    try {
      const currentPrefs = await this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...prefs };
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updatedPrefs));
      console.log('✅ Preferences saved:', Object.keys(prefs));
    } catch (error) {
      console.error('❌ Failed to save preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<DevotionalPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (prefsJson) {
        const prefs = JSON.parse(prefsJson);
        return { ...DEFAULT_PREFERENCES, ...prefs };
      }
    } catch (error) {
      console.error('❌ Failed to load preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save last viewed devotional
   */
  static async saveLastViewed(
    devotionalId: number,
    dayNumber: number,
    entryId: number
  ): Promise<void> {
    const lastViewed = {
      devotionalId,
      dayNumber,
      entryId,
      timestamp: new Date().toISOString(),
    };

    const prefs = await this.getPreferences();
    
    const updatedHistory = [
      lastViewed,
      ...prefs.viewingHistory.filter(
        item => !(item.devotionalId === devotionalId && item.dayNumber === dayNumber)
      ),
    ].slice(0, 50);

    await this.savePreferences({
      lastViewed,
      viewingHistory: updatedHistory,
    });

    console.log(`✅ Saved last viewed: Devotional ${devotionalId}, Day ${dayNumber}`);
  }

  /**
   * Save app setting
   */
  static async saveAppSetting(
    key: keyof DevotionalPreferences['appSettings'],
    value: boolean | number
  ): Promise<void> {
    const prefs = await this.getPreferences();
    await this.savePreferences({
      appSettings: {
        ...prefs.appSettings,
        [key]: value,
      },
    });
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  /**
   * Get cache
   */
  static async getCache(): Promise<DevotionalCache> {
    try {
      const cacheJson = await AsyncStorage.getItem(CACHE_KEY);
      if (cacheJson) {
        const cache = JSON.parse(cacheJson);
        
        const lastUpdated = new Date(cache.metadata.lastUpdated);
        const now = new Date();
        const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > CACHE_EXPIRY_DAYS) {
          console.log('⚠️ Cache expired, clearing...');
          await this.clearCache();
          return createEmptyCache();
        }
        
        return cache;
      }
    } catch (error) {
      console.error('❌ Failed to load cache:', error);
    }
    return createEmptyCache();
  }

  /**
   * Save cache
   */
  static async saveCache(cache: DevotionalCache): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('❌ Failed to save cache:', error);
      throw error;
    }
  }

  /**
   * Save devotional entry to cache
   */
  static async saveEntry(entry: DevotionalEntry): Promise<void> {
    try {
      const cache = await this.getCache();
      
      cache.entries[entry.id.toString()] = entry;
      
      const indexKey = `${entry.devotional_id}:${entry.day_number}`;
      cache.dayIndex[indexKey] = entry.id;
      
      cache.metadata.lastUpdated = new Date().toISOString();
      cache.metadata.lastRefresh = new Date().toISOString();
      cache.metadata.totalEntries = Object.keys(cache.entries).length;
      
      await this.saveCache(cache);
      
      // Mark entry as refreshed
      await this.markEntryRefreshed(entry.id);
      
      console.log(`✅ Cached entry: Devotional ${entry.devotional_id}, Day ${entry.day_number}`);
    } catch (error) {
      console.error('❌ Failed to save entry:', error);
    }
  }

  /**
   * Save multiple entries at once
   */
  static async saveEntries(entries: DevotionalEntry[]): Promise<void> {
    try {
      const cache = await this.getCache();
      
      for (const entry of entries) {
        cache.entries[entry.id.toString()] = entry;
        const indexKey = `${entry.devotional_id}:${entry.day_number}`;
        cache.dayIndex[indexKey] = entry.id;
      }
      
      cache.metadata.lastUpdated = new Date().toISOString();
      cache.metadata.lastRefresh = new Date().toISOString();
      cache.metadata.totalEntries = Object.keys(cache.entries).length;
      
      await this.saveCache(cache);
      
      // Mark all entries as refreshed
      const timestamp = new Date().toISOString();
      const refreshTimestamps = await this.getRefreshTimestamps();
      const updatedEntryTimestamps = { ...refreshTimestamps.entries };
      
      for (const entry of entries) {
        updatedEntryTimestamps[entry.id.toString()] = timestamp;
      }
      
      await this.saveRefreshTimestamps({
        entries: updatedEntryTimestamps,
        lastAutoRefresh: timestamp,
      });
      
      console.log(`✅ Cached ${entries.length} entries`);
    } catch (error) {
      console.error('❌ Failed to save entries:', error);
    }
  }

  /**
   * Get cached entry by devotional ID and day number
   */
  static async getEntry(devotionalId: number, dayNumber: number): Promise<DevotionalEntry | null> {
    try {
      const cache = await this.getCache();
      const indexKey = `${devotionalId}:${dayNumber}`;
      const entryId = cache.dayIndex[indexKey];
      
      if (entryId) {
        const entry = cache.entries[entryId.toString()];
        if (entry) {
          console.log(`✅ Retrieved cached entry: Devotional ${devotionalId}, Day ${dayNumber}`);
          return entry;
        }
      }
      
      console.log(`⚠️ Entry not in cache: Devotional ${devotionalId}, Day ${dayNumber}`);
      return null;
    } catch (error) {
      console.error('❌ Failed to get entry:', error);
      return null;
    }
  }

  /**
   * Clear specific entry from cache (used when backend returns 404)
   */
  static async clearEntry(devotionalId: number, dayNumber: number): Promise<void> {
    try {
      const cache = await this.getCache();
      const indexKey = `${devotionalId}:${dayNumber}`;
      const entryId = cache.dayIndex[indexKey];
      
      if (entryId) {
        // Remove entry from cache
        delete cache.entries[entryId.toString()];
        delete cache.dayIndex[indexKey];
        
        // Update metadata
        cache.metadata.lastUpdated = new Date().toISOString();
        cache.metadata.totalEntries = Object.keys(cache.entries).length;
        
        await this.saveCache(cache);
        
        // Clear refresh timestamp
        const timestamps = await this.getRefreshTimestamps();
        delete timestamps.entries[entryId.toString()];
        await this.saveRefreshTimestamps(timestamps);
        
        console.log(`🗑️ Cleared cache for: Devotional ${devotionalId}, Day ${dayNumber}`);
      }
    } catch (error) {
      console.error('❌ Failed to clear entry:', error);
    }
  }

  /**
   * Get entry by entry ID
   */
  static async getEntryById(entryId: number): Promise<DevotionalEntry | null> {
    try {
      const cache = await this.getCache();
      const entry = cache.entries[entryId.toString()];
      
      if (entry) {
        console.log(`✅ Retrieved cached entry by ID: ${entryId}`);
        return entry;
      }
      
      console.log(`⚠️ Entry not in cache: ${entryId}`);
      return null;
    } catch (error) {
      console.error('❌ Failed to get entry by ID:', error);
      return null;
    }
  }

  /**
   * Check if entry is cached and fresh
   */
  static async hasEntry(devotionalId: number, dayNumber: number): Promise<boolean> {
    const entry = await this.getEntry(devotionalId, dayNumber);
    return entry !== null;
  }

  /**
   * Check if entry is cached and fresh (not needing refresh)
   */
  static async hasEntryAndFresh(devotionalId: number, dayNumber: number): Promise<boolean> {
    const entry = await this.getEntry(devotionalId, dayNumber);
    if (!entry) return false;
    
    const needsRefresh = await this.shouldRefreshEntry(entry.id);
    return !needsRefresh;
  }

  /**
   * Save devotional metadata
   */
  static async saveDevotional(devotionalId: number, devotionalData: any): Promise<void> {
    try {
      const cache = await this.getCache();
      cache.devotionals[devotionalId.toString()] = devotionalData;
      cache.metadata.lastRefresh = new Date().toISOString();
      await this.saveCache(cache);
      console.log(`✅ Cached devotional: ${devotionalId}`);
    } catch (error) {
      console.error('❌ Failed to save devotional:', error);
    }
  }

  /**
   * Get cached devotional metadata
   */
  static async getDevotional(devotionalId: number): Promise<any | null> {
    try {
      const cache = await this.getCache();
      return cache.devotionals[devotionalId.toString()] || null;
    } catch (error) {
      console.error('❌ Failed to get devotional:', error);
      return null;
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Clear all cached entries
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(REFRESH_TIMESTAMPS_KEY);
      console.log('✅ Cache and refresh timestamps cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  /**
   * Clear all preferences (but keep theme!)
   */
  static async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      console.log('✅ Preferences cleared');
    } catch (error) {
      console.error('❌ Failed to clear preferences:', error);
    }
  }

  /**
   * Clear all data (cache + preferences + theme + timestamps)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        PREFERENCES_KEY, 
        CACHE_KEY, 
        THEME_KEY, 
        FONT_SIZE_KEY,
        REFRESH_TIMESTAMPS_KEY
      ]);
      console.log('✅ All devotional data cleared');
    } catch (error) {
      console.error('❌ Failed to clear all data:', error);
    }
  }

  /**
   * Get storage info
   */
  static async getStorageInfo(): Promise<{
    preferencesSize: number;
    cacheSize: number;
    themeSize: number;
    refreshTimestampsSize: number;
    totalSize: number;
    cachedEntries: number;
    cachedDevotionals: number;
    lastAutoRefresh: string | null;
  }> {
    try {
      const [prefs, cache, theme, timestamps] = await Promise.all([
        AsyncStorage.getItem(PREFERENCES_KEY),
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(REFRESH_TIMESTAMPS_KEY),
      ]);

      const preferencesSize = prefs ? prefs.length : 0;
      const cacheSize = cache ? cache.length : 0;
      const themeSize = theme ? theme.length : 0;
      const refreshTimestampsSize = timestamps ? timestamps.length : 0;
      const totalSize = preferencesSize + cacheSize + themeSize + refreshTimestampsSize;

      const cacheData = cache ? JSON.parse(cache) : createEmptyCache();
      const timestampData = timestamps ? JSON.parse(timestamps) : createEmptyRefreshTimestamps();
      const cachedEntries = Object.keys(cacheData.entries).length;
      const cachedDevotionals = Object.keys(cacheData.devotionals).length;

      return {
        preferencesSize,
        cacheSize,
        themeSize,
        refreshTimestampsSize,
        totalSize,
        cachedEntries,
        cachedDevotionals,
        lastAutoRefresh: timestampData.lastAutoRefresh,
      };
    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
      return {
        preferencesSize: 0,
        cacheSize: 0,
        themeSize: 0,
        refreshTimestampsSize: 0,
        totalSize: 0,
        cachedEntries: 0,
        cachedDevotionals: 0,
        lastAutoRefresh: null,
      };
    }
  }

  /**
   * Check if cache has any data
   */
  static async hasCache(): Promise<boolean> {
    const cache = await this.getCache();
    return Object.keys(cache.entries).length > 0;
  }

  /**
   * Get cache statistics with refresh info
   */
  static async getCacheStats(): Promise<{
    totalEntries: number;
    oldestEntry: string | null;
    newestEntry: string | null;
    cacheAge: number;
    lastRefresh: string | null;
    refreshAge: number;
  }> {
    try {
      const cache = await this.getCache();
      const entries = Object.values(cache.entries);
      
      const totalEntries = entries.length;
      const lastUpdated = new Date(cache.metadata.lastUpdated);
      const lastRefresh = cache.metadata.lastRefresh ? new Date(cache.metadata.lastRefresh) : null;
      const now = new Date();
      
      const cacheAge = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      const refreshAge = lastRefresh ? (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24) : -1;
      
      let oldestEntry: string | null = null;
      let newestEntry: string | null = null;
      
      if (entries.length > 0) {
        const sorted = entries
          .filter(e => e.date)
          .sort((a, b) => 
            new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
          );
        
        if (sorted.length > 0) {
          oldestEntry = sorted[0].date || null;
          newestEntry = sorted[sorted.length - 1].date || null;
        }
      }
      
      return {
        totalEntries,
        oldestEntry,
        newestEntry,
        cacheAge: Math.floor(cacheAge),
        lastRefresh: cache.metadata.lastRefresh || null,
        refreshAge: Math.floor(refreshAge),
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        oldestEntry: null,
        newestEntry: null,
        cacheAge: 0,
        lastRefresh: null,
        refreshAge: -1,
      };
    }
  }

  /**
   * Sync theme and font size to dedicated storage
   * Call this on app start to ensure consistency
   */
  static async syncUISettings(): Promise<void> {
    try {
      const prefs = await this.getPreferences();
      
      await Promise.all([
        AsyncStorage.setItem(THEME_KEY, prefs.themeId),
        AsyncStorage.setItem(FONT_SIZE_KEY, prefs.fontSize.toString()),
      ]);
      
      console.log('✅ UI settings synced to dedicated storage');
    } catch (error) {
      console.error('❌ Failed to sync UI settings:', error);
    }
  }

  /**
   * Force refresh all cached data
   */
  static async forceRefreshAll(): Promise<void> {
    try {
      // Clear refresh timestamps to force refresh
      await AsyncStorage.removeItem(REFRESH_TIMESTAMPS_KEY);
      console.log('✅ Forced refresh - all timestamps cleared');
    } catch (error) {
      console.error('❌ Failed to force refresh:', error);
    }
  }

  /**
   * Get entries that need refreshing
   */
  static async getStaleEntries(thresholdMs = REFRESH_CONFIG.FORCE_REFRESH_THRESHOLD): Promise<number[]> {
    try {
      const timestamps = await this.getRefreshTimestamps();
      const now = new Date().getTime();
      const staleEntryIds: number[] = [];
      
      // Check all cached entries
      const cache = await this.getCache();
      
      for (const entryIdStr of Object.keys(cache.entries)) {
        const entryId = parseInt(entryIdStr, 10);
        const lastRefresh = timestamps.entries[entryIdStr];
        
        if (!lastRefresh) {
          staleEntryIds.push(entryId);
          continue;
        }
        
        const lastRefreshTime = new Date(lastRefresh).getTime();
        const timeSinceRefresh = now - lastRefreshTime;
        
        if (timeSinceRefresh > thresholdMs) {
          staleEntryIds.push(entryId);
        }
      }
      
      return staleEntryIds;
    } catch (error) {
      console.error('❌ Failed to get stale entries:', error);
      return [];
    }
  }
}