import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getLiveStream } from '@/src/api/liveApi';
import { useLiveStore } from '@/src/stores/liveStore';
import { LiveStream } from '@/src/api/liveApi';

export const useLiveStatus = () => {
  const { setActiveLiveStream } = useLiveStore();

  const query = useQuery<LiveStream | null>({
    queryKey: ['liveStatus'],
    queryFn: getLiveStream,
    staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
    refetchInterval: 1000 * 60 * 3, // 5 minute polling instead of 30 seconds
    refetchIntervalInBackground: false, // Don't poll when app is in background
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  useEffect(() => {
    setActiveLiveStream(query.data || null);
  }, [query.data, setActiveLiveStream]);

  return query;
};
