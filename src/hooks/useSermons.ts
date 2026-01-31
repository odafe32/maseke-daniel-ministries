import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sermonApi, SermonTape, SermonCategory } from '../api/sermonApi';

// Cache keys
const CATEGORIES_CACHE_KEY = 'sermon_categories_cache';
const TAPES_CACHE_KEY = 'sermon_tapes_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CacheData<T> {
  data: T;
  timestamp: number;
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp }: CacheData<T> = JSON.parse(cached);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const setCachedData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch {
    // Silently fail if caching fails
  }
};

// Function to clear cache (useful for debugging or forced refresh)
export const clearSermonCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([CATEGORIES_CACHE_KEY, TAPES_CACHE_KEY]);
  } catch {
    // Silently fail if cache clearing fails
  }
};

export const useSermonCategories = () => {
  const [categories, setCategories] = useState<SermonCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedCategories = await getCachedData<SermonCategory[]>(CATEGORIES_CACHE_KEY);
        if (cachedCategories) {
          setCategories(cachedCategories);
          setIsLoading(false);
          return;
        }
      }

      // Fetch from backend
      const categoriesData = await sermonApi.getCategories();
      setCategories(categoriesData);
      
      // Cache the data
      await setCachedData(CATEGORIES_CACHE_KEY, categoriesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    loadCategories
  };
};

export const useSermonTapes = () => {
  const [tapes, setTapes] = useState<SermonTape[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTapes = useCallback(async (params: {
    series_id?: string;
    category_id?: string;
    media_type?: 'audio' | 'video';
    search?: string;
    per_page?: number;
    page?: number;
    refresh?: boolean;
    forceRefresh?: boolean; // New parameter for bypassing cache
  } = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For initial load (no params or just refresh), try cache first
      const isInitialLoad = !params.series_id && !params.category_id && 
                           !params.media_type && !params.search && 
                           !params.page && !params.per_page;
      
      if (isInitialLoad && !params.forceRefresh) {
        const cachedTapes = await getCachedData<SermonTape[]>(TAPES_CACHE_KEY);
        if (cachedTapes) {
          setTapes(cachedTapes);
          setHasMore(false); // We don't store pagination in cache, assume no more for now
          setIsLoading(false);
          return;
        }
      }

      // Fetch from backend
      const response = await sermonApi.getTapes(params);
      
      if (params.refresh || params.page === 1) {
        setTapes(response.data);
        
        // Cache only initial loads (no filters)
        if (isInitialLoad) {
          await setCachedData(TAPES_CACHE_KEY, response.data);
        }
      } else {
        setTapes(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.has_more);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sermons';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreTapes = useCallback(async (params: {
    series_id?: string;
    category_id?: string;
    media_type?: 'audio' | 'video';
    search?: string;
    per_page?: number;
  } = {}) => {
    if (!hasMore) return;
    
    const currentPage = Math.ceil(tapes.length / 20) + 1;
    await loadTapes({ ...params, page: currentPage });
  }, [hasMore, tapes.length, loadTapes]);

  const getStreamUrl = useCallback(async (tapeId: string, type: 'audio' | 'video' | 'download') => {
    return await sermonApi.streamTapeMedia(tapeId, type);
  }, []);

  return {
    tapes,
    isLoading,
    hasMore,
    error,
    loadTapes,
    loadMoreTapes,
    getStreamUrl
  };
};

// Hook for single sermon tape
export const useSermonTape = () => {
  const [tape, setTape] = useState<SermonTape | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTape = useCallback(async (id: string) => {
    console.log('loadTape called with id:', id);
    setIsLoading(true);
    setError(null);
    try {
      const tapeData = await sermonApi.getTape(id);
      console.log('API response for loadTape:', tapeData);
      setTape(tapeData);
    } catch (err: unknown) {
      console.error('useSermonTape: Full error object:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sermon';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likeTape = useCallback(async (tapeId: string) => {
    setIsLiking(true);
    try {
      const result = await sermonApi.toggleLike(tapeId);
      if (tape && tape.id === tapeId) {
        setTape({
          ...tape,
          is_liked: result.liked,
          likes_count: result.likes_count
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update like';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLiking(false);
    }
  }, [tape]);

  const downloadTape = useCallback(async (tapeId: string) => {
    setIsDownloading(true);
    try {
      await sermonApi.trackDownload(tapeId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track download';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const getStreamUrl = useCallback(async (tapeId: string, type: 'audio' | 'video' | 'download') => {
    return await sermonApi.streamTapeMedia(tapeId, type);
  }, []);

  return {
    tape,
    isLoading,
    isLiking,
    isDownloading,
    error,
    loadTape,
    likeTape,
    downloadTape,
    getStreamUrl
  };
};
