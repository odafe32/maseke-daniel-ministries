import React from 'react';
import { Live } from '@/src/screens/Home/Live';
import { useRouter } from 'expo-router';
import { useLiveStatus } from '@/src/hooks/useLiveStatus';

export default function LivePage() {
  const router = useRouter();
  const { data: liveStream } = useLiveStatus();

  return <Live onBack={() => router.back()} liveStream={liveStream} />;
}