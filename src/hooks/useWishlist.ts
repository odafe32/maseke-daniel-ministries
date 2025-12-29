import { useState, useEffect } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { wishlistStore } from '../stores/wishlistStore';
import { IWishlist } from '../constants/data';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const useWishlist = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<IWishlist[]>([]);
  const [loadingWishlists, setLoadingWishlists] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeWishlist = async () => {
      await fetchWishlist(false);
    };

    initializeWishlist();
  }, []);

  // Fetch wishlist with caching
  const fetchWishlist = async (refresh: boolean = false) => {
    console.log('fetchWishlist called:', { refresh });
    
    // Set loading state first
    if (refresh) {
      console.log('Setting refreshing state');
      setIsRefreshing(true);
    } else {
      console.log('Setting fetching state');
      setIsFetching(true);
    }
    setError(null);

    // Check cache first (unless refreshing)
    if (!refresh) {
      console.log('Checking cache...');
      const cached = wishlistStore.getState().getCachedWishlist();
      if (cached) {
        console.log('Found cached wishlist:', { itemsCount: cached.items.length });
        setWishlistItems(cached.items);
        setIsFetching(false);
        setIsRefreshing(false);
        return {
          items: cached.items,
          fromCache: true,
        };
      } else {
        console.log('No cached wishlist found');
      }
    } else {
      console.log('Skipping cache check due to refresh flag');
    }

    try {
      console.log('Making API call to fetch wishlist...');
      const response = await wishlistApi.getAllWishlists();
      console.log('API response received:', { success: response.data.success, dataLength: response.data.data?.length });

      if (response.data.success) {
        const itemsData = response.data.data;
        console.log('Processing wishlist data:', { itemsCount: itemsData.length });

        // Update state
        setWishlistItems(itemsData);

        // Store in cache
        console.log('Storing items in cache');
        wishlistStore.getState().setCachedWishlist(itemsData);

        return {
          items: itemsData,
          fromCache: false,
        };
      } else {
        console.log('API returned failure:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch wishlist');
      }
    } catch (err: unknown) {
      console.error('Fetch wishlist error:', (err as ApiError).response?.data);

      let errorMessage = 'Failed to fetch wishlist';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }

      console.log('Setting error state:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      console.log('Clearing loading states');
      setIsFetching(false);
      setIsRefreshing(false);
    }
  };

  // Refresh wishlist
  const refresh = async () => {
    return await fetchWishlist(true);
  };

  // Clear cache
  const clearCache = () => {
    wishlistStore.getState().clearCache();
  };

  // Invalidate cache
  const invalidateCache = () => {
    wishlistStore.getState().invalidateCache();
  };

  // Get cached wishlist without fetching
  const getCachedWishlist = () => {
    return wishlistStore.getState().getWishlistFromCache();
  };

  // Wishlist operations
  const handleWishlistAction = async (productId: string, action: 'add' | 'remove') => {
    // Add to loading state
    setLoadingWishlists(prev => new Set(prev).add(productId));

    try {
      if (action === 'add') {
        await wishlistApi.addToWishlist(productId);
      } else {
        await wishlistApi.removeFromWishlist(productId);
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Wishlist action error:', err);

      let errorMessage = 'Failed to update wishlist';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }

      return { success: false, error: errorMessage };
    } finally {
      // Remove from loading state
      setLoadingWishlists(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return {
    // Data
    wishlistItems,

    // Loading states
    isLoading: isFetching || isRefreshing,
    error,
    loadingWishlists: Array.from(loadingWishlists),

    // Actions
    fetchWishlist,
    refresh,
    clearCache,
    invalidateCache,
    getCachedWishlist,
    handleWishlistAction,
  };
};
