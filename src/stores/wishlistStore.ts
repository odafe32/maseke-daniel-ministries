import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IWishlist } from '@/src/utils/types';

const WISHLIST_CACHE_KEY = '@wishlist_cache';

interface CachedWishlistData {
  items: IWishlist[];
  timestamp: number;
  expiresAt: number;
}

interface WishlistState {
  // Data
  cachedWishlist: CachedWishlistData | null;
  cacheExpiryMinutes: number;

  // Loading states
  isLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  getCachedWishlist: () => CachedWishlistData | null;
  setCachedWishlist: (items: IWishlist[]) => void;
  isCacheValid: (cacheData: CachedWishlistData) => boolean;
  clearCache: () => void;
  clearError: () => void;
  loadCachedWishlist: () => Promise<void>;
  saveCachedWishlist: () => Promise<void>;
  invalidateCache: () => void;
  getWishlistFromCache: () => IWishlist[] | null;
}

export const wishlistStore = create<WishlistState>((set, get) => ({
  // Initial state
  cachedWishlist: null,
  cacheExpiryMinutes: 15, // Cache expires after 15 minutes

  isLoading: false,
  error: null,

  // Check if cache is still valid
  isCacheValid: (cacheData: CachedWishlistData): boolean => {
    return Date.now() < cacheData.expiresAt;
  },

  // Get cached wishlist
  getCachedWishlist: (): CachedWishlistData | null => {
    const cached = get().cachedWishlist;

    if (!cached) return null;

    if (!get().isCacheValid(cached)) {
      // Remove expired cache
      set({ cachedWishlist: null });
      return null;
    }

    return cached;
  },

  // Set cached wishlist
  setCachedWishlist: (items: IWishlist[]) => {
    const timestamp = Date.now();
    const expiresAt = timestamp + (get().cacheExpiryMinutes * 60 * 1000);

    const cacheData: CachedWishlistData = {
      items,
      timestamp,
      expiresAt
    };

    set({ cachedWishlist: cacheData });

    // Save to AsyncStorage
    get().saveCachedWishlist().catch(err =>
      console.error('Failed to save cached wishlist:', err)
    );
  },

  // Get wishlist from cache (convenience method for hooks)
  getWishlistFromCache: () => {
    const cached = get().getCachedWishlist();
    if (!cached) return null;

    return cached.items;
  },

  // Clear all cache
  clearCache: () => {
    set({ cachedWishlist: null });
    AsyncStorage.removeItem(WISHLIST_CACHE_KEY).catch(err =>
      console.error('Failed to clear wishlist cache:', err)
    );
  },

  // Invalidate cache
  invalidateCache: () => {
    set({ cachedWishlist: null });

    // Persist changes
    get().saveCachedWishlist().catch(err =>
      console.error('Failed to save after cache invalidation:', err)
    );
  },

  // Load cached wishlist from AsyncStorage
  loadCachedWishlist: async () => {
    try {
      const stored = await AsyncStorage.getItem(WISHLIST_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedWishlistData;

        // Check if cache is still valid
        if (get().isCacheValid(parsed)) {
          set({ cachedWishlist: parsed });
        } else {
          set({ cachedWishlist: null });
        }
      }
    } catch (error) {
      console.error('Failed to load cached wishlist:', error);
    }
  },

  // Save cached wishlist to AsyncStorage
  saveCachedWishlist: async () => {
    try {
      const { cachedWishlist } = get();
      if (cachedWishlist) {
        await AsyncStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(cachedWishlist));
      }
    } catch (error) {
      console.error('Failed to save cached wishlist:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
