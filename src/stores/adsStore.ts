import { create } from 'zustand';
import adsApi from '../api/adsApi';

interface Ad {
  id: string;
  title: string;
  display_duration: number;
  image: string;
}

interface AdsState {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  fetchAds: () => Promise<void>;
}

export const useAdsStore = create<AdsState>((set) => ({
  ads: [],
  loading: false,
  error: null,
  fetchAds: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adsApi.getAds();
      if (response.success) {
        set({ ads: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch ads', loading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch ads', loading: false });
    }
  },
}));
