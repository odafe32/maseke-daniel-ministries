import { create } from 'zustand';
import { LiveStream } from '@/src/api/liveApi';

interface LiveStore {
  activeLiveStream: LiveStream | null;
  setActiveLiveStream: (stream: LiveStream | null) => void;
}

export const useLiveStore = create<LiveStore>((set) => ({
  activeLiveStream: null,
  setActiveLiveStream: (stream) => set({ activeLiveStream: stream }),
}));
