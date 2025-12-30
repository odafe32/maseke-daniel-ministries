import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import {
  devotionApi,
  DevotionalSummary,
  DevotionalDetail,
  DevotionalEntry,
  LikeStatus,
  SubmitResponsePayload,
  DevotionalReflection,
  BookmarkStatus,
  DevotionalBookmark,
} from '../api/devotionApi';

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
      const data = await devotionApi.getDevotional(devotionalId);
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
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const mergeLikeStatus = useCallback((status: LikeStatus) => {
    setEntry((prev) => {
      if (!prev) return null;
      return { ...prev, liked: status.liked, like_count: status.like_count };
    });
  }, []);

  const mergeBookmarkStatus = useCallback((status: BookmarkStatus) => {
    setEntry((prev) => {
      if (!prev) return null;
      return { ...prev, bookmarked: status.bookmarked };
    });
  }, []);

  const loadTodayEntry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await devotionApi.getTodayEntry();
      
      if (!data) {
        setEntry(null);
        return null;
      }
      
      // Ensure all required fields have default values
      const entryWithDefaults: DevotionalEntry = {
        ...data,
        bookmarked: data.bookmarked ?? false,
        liked: data.liked ?? false,
        like_count: data.like_count ?? 0,
        viewed: data.viewed ?? false,
      };
      
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
    try {
      const data = await devotionApi.getEntryByDay(devotionalId, dayNumber);
      
      if (!data) {
        setEntry(null);
        return null;
      }
      
      // Ensure all required fields have default values
      const entryWithDefaults: DevotionalEntry = {
        ...data,
        bookmarked: data.bookmarked ?? false,
        liked: data.liked ?? false,
        like_count: data.like_count ?? 0,
        viewed: data.viewed ?? false,
      };
      
      setEntry(entryWithDefaults);
      return entryWithDefaults;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load entry';
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

  const refreshLikeStatus = useCallback(async () => {
    if (!entry) return null;
    try {
      const status = await devotionApi.getLikeStatus(entry.id);
      mergeLikeStatus(status);
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

  const toggleBookmark = useCallback(
    async () => {
      if (!entry) {
        console.warn('Cannot toggle bookmark: No entry loaded');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No devotional entry loaded',
        });
        return null;
      }
      
      setIsBookmarking(true);
      try {
        const status = await devotionApi.toggleBookmark(entry.id);
        mergeBookmarkStatus(status);
        
        // Show success toast
        Toast.show({
          type: status.bookmarked ? 'success' : 'info',
          text1: status.bookmarked ? 'Bookmarked' : 'Bookmark Removed',
          text2: status.bookmarked ? 'Devotional saved to your bookmarks' : 'Devotional removed from bookmarks',
        });
        
        return status;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update bookmark';
        setError(message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
        return null;
      } finally {
        setIsBookmarking(false);
      }
    },
    [entry, mergeBookmarkStatus]
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
    isLoading,
    error,
    isLiking,
    isBookmarking,
    isSubmittingResponse,
    loadTodayEntry,
    loadEntryByDay,
    refreshLikeStatus,
    toggleLike,
    toggleBookmark,
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