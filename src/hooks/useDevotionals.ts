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
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const mergeLikeStatus = useCallback((status: LikeStatus) => {
    setEntry((prev) => (prev ? { ...prev, liked: status.liked, like_count: status.like_count } : prev));
  }, []);

  const loadTodayEntry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await devotionApi.getTodayEntry();
      setEntry(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load today's devotional";
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

  const loadEntryByDay = useCallback(async (devotionalId: number | string, dayNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await devotionApi.getEntryByDay(devotionalId, dayNumber);
      setEntry(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load entry';
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

  const refreshLikeStatus = useCallback(async () => {
    if (!entry) return;
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
      throw err;
    }
  }, [entry, mergeLikeStatus]);

  const toggleLike = useCallback(
    async (like?: boolean) => {
      if (!entry) return;
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
        throw err;
      } finally {
        setIsLiking(false);
      }
    },
    [entry, mergeLikeStatus]
  );

  const submitResponse = useCallback(
    async (payload: SubmitResponsePayload): Promise<DevotionalReflection> => {
      if (!entry) throw new Error('No devotional entry selected');
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
        throw err;
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
    isSubmittingResponse,
    loadTodayEntry,
    loadEntryByDay,
    refreshLikeStatus,
    toggleLike,
    submitResponse,
  };
};