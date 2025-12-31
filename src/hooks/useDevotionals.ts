import { useState, useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import {
  devotionApi,
  DevotionalSummary,
  DevotionalDetail,
  DevotionalEntry,
  LikeStatus,
  SubmitResponsePayload,
  DevotionalReflection,
  DevotionalBookmark,
} from '../api/devotionApi';
import { 
  DevotionalStorage, 
  DevotionalPreferences, 
  DEFAULT_PREFERENCES 
} from '../utils/DevotionalStorage';

// Helper function to check if a date is in the future
const isFutureDate = (dateString: string): boolean => {
  try {
    const entryDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return entryDate > today;
  } catch {
    return false;
  }
};

export const useDevotionalList = () => {
  const [devotionals, setDevotionals] = useState<DevotionalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevotionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await devotionApi.getDevotionals();
      setDevotionals(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load devotionals';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { devotionals, isLoading, error, loadDevotionals };
};

export const useDevotionalDetail = () => {
  const [devotional, setDevotional] = useState<DevotionalDetail | null>(null);
  const [entries, setEntries] = useState<DevotionalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevotional = useCallback(async (devotionalId: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cached = await DevotionalStorage.getDevotional(Number(devotionalId));
      if (cached) {
        console.log('📦 Using cached devotional data');
        setDevotional(cached);
        setEntries(cached.entries || []);
        setIsLoading(false);
        return;
      }

      console.log('🌐 Fetching devotional from API');
      const data = await devotionApi.getDevotional(devotionalId);
      
      await DevotionalStorage.saveDevotional(Number(devotionalId), data);
      
      if (data.entries && data.entries.length > 0) {
        await DevotionalStorage.saveEntries(data.entries);
      }
      
      setDevotional(data);
      setEntries(data.entries || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load devotional';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { devotional, entries, isLoading, error, loadDevotional };
};

export const useDevotionalEntry = () => {
  const [entry, setEntry] = useState<DevotionalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const mergeLikeStatus = useCallback((status: LikeStatus) => {
    setEntry((prev) => {
      if (!prev) return null;
      return { 
        ...prev, 
        liked: status.liked, 
        like_count: status.like_count 
      };
    });
  }, []);

  const loadTodayEntry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsCached(false);
    
    try {
      console.log('🌐 Fetching today\'s entry from API');
      const data = await devotionApi.getTodayEntry();
      
      if (!data) {
        setEntry(null);
        return null;
      }
      
      const entryWithDefaults: DevotionalEntry = {
        ...data,
        bookmarked: data.bookmarked ?? false,
        liked: data.liked ?? false,
        like_count: data.like_count ?? 0,
        viewed: data.viewed ?? false,
      };
      
      await DevotionalStorage.saveEntry(entryWithDefaults);
      
      if (entryWithDefaults.devotional_id && entryWithDefaults.day_number) {
        await DevotionalStorage.saveLastViewed(
          entryWithDefaults.devotional_id,
          entryWithDefaults.day_number,
          entryWithDefaults.id
        );
      }
      
      setEntry(entryWithDefaults);
      return entryWithDefaults;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load today's devotional";
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      setEntry(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadEntryByDay = useCallback(async (devotionalId: number | string, dayNumber: number) => {
    setIsLoading(true);
    setError(null);
    setIsCached(false);
    
    try {
      // Try to get from cache first
      const cachedEntry = await DevotionalStorage.getEntry(Number(devotionalId), dayNumber);
      
      if (cachedEntry) {
        console.log(`📦 Using cached entry: Devotional ${devotionalId}, Day ${dayNumber}`);
        
        // ===== CRITICAL FIX: VALIDATE DATE EVEN FOR CACHED ENTRIES =====
        if (cachedEntry.date && isFutureDate(cachedEntry.date)) {
          const entryDate = new Date(cachedEntry.date + 'T00:00:00');
          const message = `This devotional is not available yet. Please check back on ${entryDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`;
          
          console.log('🔒 CACHED entry is in the future - blocking access');
          
          // Throw 403 error to match backend behavior
          const error: any = new Error(message);
          error.response = {
            status: 403,
            data: { message }
          };
          throw error;
        }
        // ===== END CRITICAL FIX =====
        
        // ===== NEW: ALWAYS FETCH FRESH RESPONSE STATUS =====
        // We use cached content but get fresh interaction status from API
        console.log('🔄 Fetching fresh response status for cached entry...');
        try {
          const freshEntry = await devotionApi.getEntryByDay(devotionalId, dayNumber);
          
          // Use cached content but with fresh status flags
          const entryWithFreshStatus: DevotionalEntry = {
            ...cachedEntry,
            bookmarked: freshEntry.bookmarked ?? false,
            liked: freshEntry.liked ?? false,
            like_count: freshEntry.like_count ?? 0,
            viewed: freshEntry.viewed ?? false,
            has_submitted_response: freshEntry.has_submitted_response ?? false, // ← CRITICAL!
          };
          
          console.log(`✅ Fresh status applied: viewed=${entryWithFreshStatus.viewed}, submitted=${entryWithFreshStatus.has_submitted_response}`);
          
          // Update cache with fresh status
          await DevotionalStorage.saveEntry(entryWithFreshStatus);
          
          setEntry(entryWithFreshStatus);
          setIsCached(true);
          setIsLoading(false);
          
          await DevotionalStorage.saveLastViewed(
            Number(devotionalId),
            dayNumber,
            entryWithFreshStatus.id
          );
          
          return entryWithFreshStatus;
        } catch (apiError: any) {
          // If API fails (network error, etc), fall back to cached entry
          // but warn that status might be stale
          console.warn('⚠️ Failed to fetch fresh status, using cached data:', apiError.message);
          
          const entryWithDefaults: DevotionalEntry = {
            ...cachedEntry,
            bookmarked: cachedEntry.bookmarked ?? false,
            liked: cachedEntry.liked ?? false,
            like_count: cachedEntry.like_count ?? 0,
            viewed: cachedEntry.viewed ?? false,
            has_submitted_response: cachedEntry.has_submitted_response ?? false,
          };
          
          setEntry(entryWithDefaults);
          setIsCached(true);
          setIsLoading(false);
          
          await DevotionalStorage.saveLastViewed(
            Number(devotionalId),
            dayNumber,
            entryWithDefaults.id
          );
          
          return entryWithDefaults;
        }
        // ===== END NEW CODE =====
      }
      
      // Fetch from API if not cached
      console.log(`🌐 Fetching entry from API: Devotional ${devotionalId}, Day ${dayNumber}`);
      const data = await devotionApi.getEntryByDay(devotionalId, dayNumber);
      
      if (!data) {
        setEntry(null);
        return null;
      }
      
      const entryWithDefaults: DevotionalEntry = {
        ...data,
        bookmarked: data.bookmarked ?? false,
        liked: data.liked ?? false,
        like_count: data.like_count ?? 0,
        viewed: data.viewed ?? false,
      };
      
      await DevotionalStorage.saveEntry(entryWithDefaults);
      
      await DevotionalStorage.saveLastViewed(
        Number(devotionalId),
        dayNumber,
        entryWithDefaults.id
      );
      
      setEntry(entryWithDefaults);
      return entryWithDefaults;
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Unable to load entry';
      setError(message);
      
      // Re-throw the error so the component can handle it (especially 403s)
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLikeStatus = useCallback(async () => {
    if (!entry) return null;
    try {
      const status = await devotionApi.getLikeStatus(entry.id);
      mergeLikeStatus(status);
      
      const updatedEntry = { ...entry, liked: status.liked, like_count: status.like_count };
      await DevotionalStorage.saveEntry(updatedEntry);
      
      return status;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch like status';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      return null;
    }
  }, [entry, mergeLikeStatus]);

  const toggleLike = useCallback(
    async (like?: boolean) => {
      if (!entry) {
        console.warn('Cannot toggle like: No entry loaded');
        return null;
      }
      
      setIsLiking(true);
      try {
        const status = await devotionApi.toggleLike(entry.id, like);
        mergeLikeStatus(status);
        
        const updatedEntry = { ...entry, liked: status.liked, like_count: status.like_count };
        await DevotionalStorage.saveEntry(updatedEntry);
        
        return status;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update like';
        setError(message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
        return null;
      } finally {
        setIsLiking(false);
      }
    },
    [entry, mergeLikeStatus]
  );

  const submitResponse = useCallback(
    async (payload: SubmitResponsePayload): Promise<DevotionalReflection | null> => {
      if (!entry) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No devotional entry selected',
        });
        return null;
      }
      
      setIsSubmittingResponse(true);
      try {
        const response = await devotionApi.submitResponse(entry.id, payload);
        
        const updatedEntry = { ...entry, has_submitted_response: true };
        await DevotionalStorage.saveEntry(updatedEntry);
        setEntry(updatedEntry);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Your reflection has been saved',
        });
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to submit response';
        setError(message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
        return null;
      } finally {
        setIsSubmittingResponse(false);
      }
    },
    [entry]
  );

  return {
    entry,
    setEntry,
    isLoading,
    error,
    isLiking,
    isSubmittingResponse,
    isCached,
    loadTodayEntry,
    loadEntryByDay,
    refreshLikeStatus,
    toggleLike,
    submitResponse,
  };
};

export const useDevotionalBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<DevotionalBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await devotionApi.getBookmarks();
      setBookmarks(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load bookmarks';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { bookmarks, isLoading, error, loadBookmarks };
};

export const useDevotionalPreferences = () => {
  const [preferences, setPreferences] = useState<DevotionalPreferences>(DEFAULT_PREFERENCES);
  const [themeId, setThemeId] = useState<string>(DEFAULT_PREFERENCES.themeId);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_PREFERENCES.fontSize);
  const [isLoading, setIsLoading] = useState(true);

  // Load all preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        // Load theme and fontSize from dedicated storage (instant)
        const [loadedTheme, loadedFontSize, prefs] = await Promise.all([
          DevotionalStorage.getTheme(),
          DevotionalStorage.getFontSize(),
          DevotionalStorage.getPreferences(),
        ]);
        
        // Set individual states for instant UI updates
        setThemeId(loadedTheme);
        setFontSize(loadedFontSize);
        
        // Set full preferences
        setPreferences({
          ...prefs,
          themeId: loadedTheme, // Ensure theme from dedicated storage
          fontSize: loadedFontSize, // Ensure font size from dedicated storage
        });
        
        console.log('✅ Preferences loaded:', {
          theme: loadedTheme,
          fontSize: loadedFontSize,
        });
      } catch (error) {
        console.error('❌ Failed to load preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
        setThemeId(DEFAULT_PREFERENCES.themeId);
        setFontSize(DEFAULT_PREFERENCES.fontSize);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrefs();
  }, []);

  /**
   * Save theme with instant state update
   * Uses dedicated storage for maximum reliability
   */
  const saveTheme = useCallback(async (newThemeId: string) => {
    try {
      // Update state immediately for instant UI change
      setThemeId(newThemeId);
      setPreferences((prev) => ({ ...prev, themeId: newThemeId }));
      
      // Save to storage (async, doesn't block UI)
      await DevotionalStorage.saveTheme(newThemeId);
      
      console.log('✅ Theme saved and applied:', newThemeId);
    } catch (error) {
      console.error('❌ Failed to save theme:', error);
      // Revert state on error
      const prefs = await DevotionalStorage.getPreferences();
      setThemeId(prefs.themeId);
      setPreferences((prev) => ({ ...prev, themeId: prefs.themeId }));
      throw error;
    }
  }, []);

  /**
   * Save font size with instant state update
   */
  const saveFontSize = useCallback(async (newFontSize: number) => {
    try {
      // Update state immediately
      setFontSize(newFontSize);
      setPreferences((prev) => ({ ...prev, fontSize: newFontSize }));
      
      // Save to storage
      await DevotionalStorage.saveFontSize(newFontSize);
      
      console.log('✅ Font size saved and applied:', newFontSize);
    } catch (error) {
      console.error('❌ Failed to save font size:', error);
      // Revert state on error
      const prefs = await DevotionalStorage.getPreferences();
      setFontSize(prefs.fontSize);
      setPreferences((prev) => ({ ...prev, fontSize: prefs.fontSize }));
      throw error;
    }
  }, []);

  /**
   * Save app setting
   */
  const saveAppSetting = useCallback(async (key: string, value: boolean) => {
    try {
      await DevotionalStorage.saveAppSetting(key as any, value);
      setPreferences((prev) => ({
        ...prev,
        appSettings: { ...prev.appSettings, [key]: value },
      }));
      
      console.log(`✅ App setting saved: ${key} = ${value}`);
    } catch (error) {
      console.error('❌ Failed to save app setting:', error);
      throw error;
    }
  }, []);

  /**
   * Reload all preferences from storage
   */
  const reloadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedTheme, loadedFontSize, prefs] = await Promise.all([
        DevotionalStorage.getTheme(),
        DevotionalStorage.getFontSize(),
        DevotionalStorage.getPreferences(),
      ]);
      
      setThemeId(loadedTheme);
      setFontSize(loadedFontSize);
      setPreferences({
        ...prefs,
        themeId: loadedTheme,
        fontSize: loadedFontSize,
      });
      
      console.log('✅ Preferences reloaded');
    } catch (error) {
      console.error('❌ Failed to reload preferences:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    preferences,
    themeId, 
    fontSize, 
    isLoading,
    saveTheme,
    saveFontSize,
    saveAppSetting,
    reloadPreferences,
  };
};

