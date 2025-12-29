import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SermonTape } from '@/src/api/sermonApi';
import { SermonStorage } from '@/src/utils/sermonStorage';
import { cacheDirectory, createDownloadResumable } from 'expo-file-system/legacy';

// Use SermonTape as Sermon
type Sermon = SermonTape;

interface DownloadProgress {
  sermonId: string;
  sermonTitle: string;
  progress: number;
  totalBytes: number;
  writtenBytes: number;
}

interface SermonStore {
  currentSermon: Sermon | null;
  sermonHistory: Sermon[];
  isLoading: boolean;
  error: string | null;
  downloadProgress: DownloadProgress | null;

  setCurrentSermon: (sermon: Sermon) => void;
  addToHistory: (sermon: Sermon) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadStoredData: () => Promise<void>;
  
  // Offline download methods
  downloadSermonForOffline: (sermonId: string, sermonTitle: string, mediaUrl: string, isAudio: boolean) => Promise<boolean>;
  setDownloadProgress: (progress: DownloadProgress | null) => void;
  isSermonAvailableOffline: (sermonId: string) => Promise<boolean>;
  getOfflineSermonPath: (sermonId: string) => Promise<string | null>;
}

export const useSermonStore = create<SermonStore>((set) => ({
  currentSermon: null,
  sermonHistory: [],
  isLoading: false,
  error: null,
  downloadProgress: null,

  setCurrentSermon: (sermon) => set({ currentSermon: sermon }),

  addToHistory: (sermon) => set((state) => {
    const existing = state.sermonHistory.find(s => s.id === sermon.id);
    if (!existing) {
      const newHistory = [sermon, ...state.sermonHistory.slice(0, 9)]; // Keep last 10
      AsyncStorage.setItem('sermonHistory', JSON.stringify(newHistory));
      return { sermonHistory: newHistory };
    }
    return state;
  }),

  clearHistory: () => {
    AsyncStorage.removeItem('sermonHistory');
    set({ sermonHistory: [] });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  loadStoredData: async () => {
    try {
      const historyStr = await AsyncStorage.getItem('sermonHistory');
      if (historyStr) {
        const sermonHistory = JSON.parse(historyStr);
        set({ sermonHistory });
      }
    } catch (error) {
      console.error('Failed to load stored sermon data:', error);
    }
  },

  // Offline download implementation
  downloadSermonForOffline: async (sermonId: string, sermonTitle: string, mediaUrl: string, isAudio: boolean) => {
    try {
      const extension = isAudio ? 'mp3' : 'mp4';
      const filename = `offline_sermon_${sermonId}.${extension}`;
      const fileUri = cacheDirectory + filename;

      const downloadResumable = createDownloadResumable(
        mediaUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          set({
            downloadProgress: {
              sermonId,
              sermonTitle,
              progress: Math.round(progress * 100),
              totalBytes: downloadProgress.totalBytesExpectedToWrite,
              writtenBytes: downloadProgress.totalBytesWritten,
            }
          });
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        // Save to offline storage
        await SermonStorage.saveOfflineSermon({
          id: sermonId,
          title: sermonTitle,
          localAudioPath: isAudio ? fileUri : undefined,
          localVideoPath: !isAudio ? fileUri : undefined,
          downloadedAt: new Date().toISOString(),
        });
        
        set({ downloadProgress: null });
        return true;
      }
      
      set({ downloadProgress: null });
      return false;
    } catch (error) {
      console.error('Offline download failed:', error);
      set({ downloadProgress: null });
      return false;
    }
  },

  setDownloadProgress: (progress) => set({ downloadProgress: progress }),

  isSermonAvailableOffline: async (sermonId: string) => {
    return await SermonStorage.isSermonOffline(sermonId);
  },

  getOfflineSermonPath: async (sermonId: string) => {
    const sermon = await SermonStorage.getOfflineSermon(sermonId);
    if (sermon) {
      return sermon.localAudioPath || sermon.localVideoPath || null;
    }
    return null;
  },
}));
