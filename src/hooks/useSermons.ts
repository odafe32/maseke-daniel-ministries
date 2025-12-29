import { useState, useCallback } from 'react';
import { sermonApi, SermonTape, SermonCategory } from '../api/sermonApi';

export const useSermonCategories = () => {
  const [categories, setCategories] = useState<SermonCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoriesData = await sermonApi.getCategories();
      setCategories(categoriesData);
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
  } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sermonApi.getTapes(params);
      
      if (params.refresh || params.page === 1) {
        setTapes(response.data);
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
