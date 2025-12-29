import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreProduct } from '@/src/constants/data';

const PRODUCTS_CACHE_KEY = '@store_products_cache';
const CART_COUNT_KEY = '@store_cart_count';

interface ProductFilters {
  search?: string;
  sort_by?: string;
  page?: number;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface CachedProductData {
  products: StoreProduct[];
  pagination: PaginationData;
  filters: ProductFilters;
  timestamp: number;
  expiresAt: number;
}

interface StoreState {
  // Data
  cachedProducts: Record<string, CachedProductData>;
  currentFilters: ProductFilters;
  cacheExpiryMinutes: number;
  cartCount: number;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error states
  error: string | null;

  // Actions
  getCachedProducts: (filters: ProductFilters) => CachedProductData | null;
  setCachedProducts: (filters: ProductFilters, products: StoreProduct[], pagination: PaginationData) => void;
  isCacheValid: (cacheData: CachedProductData) => boolean;
  generateCacheKey: (filters: ProductFilters) => string;
  clearCache: () => void;
  clearError: () => void;
  setCurrentFilters: (filters: ProductFilters) => void;
  loadCachedProducts: () => Promise<void>;
  saveCachedProducts: () => Promise<void>;
  invalidateCache: (filters?: ProductFilters) => void;
  getProductsFromCache: (filters: ProductFilters) => { products: StoreProduct[]; pagination: PaginationData } | null;
  setCartCount: (count: number) => void;
  getCartCount: () => number;
}

export const storeStore = create<StoreState>((set, get) => ({
  // Initial state
  cachedProducts: {},
  currentFilters: {},
  cacheExpiryMinutes: 15, // Cache expires after 15 minutes
  cartCount: 0,

  isLoading: false,
  isRefreshing: false,
  error: null,

  // Generate cache key based on filters
  generateCacheKey: (filters: ProductFilters): string => {
    const keyParts = [];
    if (filters.search) keyParts.push(`search:${filters.search}`);
    if (filters.sort_by) keyParts.push(`sort_by:${filters.sort_by}`);
    if (filters.page) keyParts.push(`page:${filters.page}`);
    
    return keyParts.length > 0 ? keyParts.join('|') : 'default';
  },

  // Check if cache is still valid
  isCacheValid: (cacheData: CachedProductData): boolean => {
    return Date.now() < cacheData.expiresAt;
  },

  // Get cached products for specific filters
  getCachedProducts: (filters: ProductFilters): CachedProductData | null => {
    const cacheKey = get().generateCacheKey(filters);
    const cached = get().cachedProducts[cacheKey];
    
    if (!cached) return null;
    
    if (!get().isCacheValid(cached)) {
      // Remove expired cache
      set(state => {
        const newCached = { ...state.cachedProducts };
        delete newCached[cacheKey];
        return { cachedProducts: newCached };
      });
      return null;
    }
    
    return cached;
  },

  // Set cached products for specific filters
  setCachedProducts: (filters: ProductFilters, products: StoreProduct[], pagination: PaginationData) => {
    const cacheKey = get().generateCacheKey(filters);
    const timestamp = Date.now();
    const expiresAt = timestamp + (get().cacheExpiryMinutes * 60 * 1000);
    
    const cacheData: CachedProductData = {
      products,
      pagination,
      filters,
      timestamp,
      expiresAt
    };
    
    set(state => ({
      cachedProducts: {
        ...state.cachedProducts,
        [cacheKey]: cacheData
      }
    }));
    
    // Save to AsyncStorage
    get().saveCachedProducts().catch(err => 
      console.error('Failed to save cached products:', err)
    );
  },

  // Get products from cache (convenience method for hooks)
  getProductsFromCache: (filters: ProductFilters) => {
    const cached = get().getCachedProducts(filters);
    if (!cached) return null;
    
    return {
      products: cached.products,
      pagination: cached.pagination
    };
  },

  // Set current filters
  setCurrentFilters: (filters: ProductFilters) => {
    set({ currentFilters: filters });
  },

  // Clear all cache
  clearCache: () => {
    set({ cachedProducts: {} });
    AsyncStorage.removeItem(PRODUCTS_CACHE_KEY).catch(err => 
      console.error('Failed to clear products cache:', err)
    );
  },

  // Invalidate specific cache or all cache
  invalidateCache: (filters?: ProductFilters) => {
    if (filters) {
      const cacheKey = get().generateCacheKey(filters);
      set(state => {
        const newCached = { ...state.cachedProducts };
        delete newCached[cacheKey];
        return { cachedProducts: newCached };
      });
    } else {
      set({ cachedProducts: {} });
    }
    
    // Persist changes
    get().saveCachedProducts().catch(err => 
      console.error('Failed to save after cache invalidation:', err)
    );
  },

  // Load cached products from AsyncStorage
  loadCachedProducts: async () => {
    try {
      const stored = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CachedProductData>;
        
        // Filter out expired cache entries
        const validCache: Record<string, CachedProductData> = {};
        Object.entries(parsed).forEach(([key, cacheData]) => {
          if (get().isCacheValid(cacheData)) {
            validCache[key] = cacheData;
          }
        });
        
        set({ cachedProducts: validCache });
      }

      // Load cached cart count
      const cartCountStored = await AsyncStorage.getItem(CART_COUNT_KEY);
      if (cartCountStored) {
        set({ cartCount: parseInt(cartCountStored, 10) });
      }
    } catch (error) {
      console.error('Failed to load cached products:', error);
    }
  },

  // Save cached products to AsyncStorage
  saveCachedProducts: async () => {
    try {
      const { cachedProducts } = get();
      await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cachedProducts));
    } catch (error) {
      console.error('Failed to save cached products:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set cart count
  setCartCount: (count: number) => {
    set({ cartCount: count });
    AsyncStorage.setItem(CART_COUNT_KEY, count.toString()).catch(err => 
      console.error('Failed to save cart count:', err)
    );
  },

  // Get cart count
  getCartCount: () => {
    return get().cartCount;
  },
}));
