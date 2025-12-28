import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PickupStation } from '@/src/constants/data';

const PAYMENT_CACHE_KEY = '@payment_cache_v1';

interface PaymentCacheShape {
  pickupStations: PickupStation[];
  selectedPickupStationId: string | null;
  timestamp: number;
}

interface PaymentState {
  // Data
  pickupStations: PickupStation[];
  selectedPickupStationId: string | null;

  // UI/Error
  isLoading: boolean;
  error: string | null;

  // Actions
  setPickupStations: (stations: PickupStation[]) => void;
  setSelectedPickupStationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Persistence
  loadCache: () => Promise<void>;
  saveCache: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const paymentStore = create<PaymentState>((set, get) => ({
  // Initial
  pickupStations: [],
  selectedPickupStationId: null,
  isLoading: false,
  error: null,

  setPickupStations: (stations: PickupStation[]) => {
    set({ pickupStations: stations });
    get().saveCache().catch((e) => console.error('paymentStore: save stations failed', e));
  },
  setSelectedPickupStationId: (id: string | null) => {
    set({ selectedPickupStationId: id });
    get().saveCache().catch((e) => console.error('paymentStore: save selected station failed', e));
  },
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),

  loadCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(PAYMENT_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PaymentCacheShape;
        set({
          pickupStations: parsed.pickupStations || [],
          selectedPickupStationId: parsed.selectedPickupStationId ?? null,
        });
      }
    } catch (e) {
      console.error('paymentStore: load cache failed', e);
    }
  },

  saveCache: async () => {
    try {
      const { pickupStations, selectedPickupStationId } = get();
      const payload: PaymentCacheShape = {
        pickupStations,
        selectedPickupStationId,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(PAYMENT_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('paymentStore: save cache failed', e);
    }
  },

  clearCache: async () => {
    try {
      await AsyncStorage.removeItem(PAYMENT_CACHE_KEY);
      set({ pickupStations: [], selectedPickupStationId: null });
    } catch (e) {
      console.error('paymentStore: clear cache failed', e);
    }
  },
}));

