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
    staleTime: 1000 * 60 * 5, 
    refetchInterval: 1000 * 30,
  });

  useEffect(() => {
    setActiveLiveStream(query.data || null);
  }, [query.data, setActiveLiveStream]);

  return query;
};
