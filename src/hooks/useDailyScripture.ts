import { useState, useCallback, useEffect } from 'react';
import { dailyScriptureApi, DailyScripture } from '../api/dailyScripture';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'daily_scripture_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDailyScripture = (refreshTrigger?: number) => {
  const [scripture, setScripture] = useState<DailyScripture | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToCache = async (data: DailyScripture) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save scripture to cache:', error);
    }
  };

  const loadFromCache = async (): Promise<DailyScripture | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        if (now - cacheData.timestamp < CACHE_DURATION) {
          return cacheData.data;
        }
      }
    } catch (error) {
      console.error('Failed to load scripture from cache:', error);
    }
    return null;
  };

  const loadToday = useCallback(async (forceFetch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Try cache first unless force fetch
      if (!forceFetch) {
        const cachedData = await loadFromCache();
        if (cachedData) {
          setScripture(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      // Fetch from API
      const data = await dailyScriptureApi.getToday();
      setScripture(data);
      // Save to cache
      if (data) {
        await saveToCache(data);
      }
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load scripture';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dailyScriptureApi.getByDate(date);
      setScripture(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load scripture';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount and when refreshTrigger changes
  useEffect(() => {
    loadToday(true); // Force fetch on refresh
  }, [loadToday, refreshTrigger]);

  return {
    scripture,
    isLoading,
    error,
    loadToday,
    loadByDate,
  };
};
