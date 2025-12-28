import { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { wishlistApi } from '../../api/wishlistApi';
import { cartApi } from '../../api/cartApi';
import { storeStore } from '../../stores/store';
import { cartStore } from '../../stores/store/cartStore';
import { StoreProduct } from '../../constants/data';

interface ProductFilters {
  search?: string;
  sort_by?: string;
  page?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const useStore = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingWishlists, setLoadingWishlists] = useState<Set<string>>(new Set());
  const [loadingCart, setLoadingCart] = useState<Set<string>>(new Set());
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const initializeStore = async () => {
        const cachedCartCount = storeStore.getState().getCartCount();
        if (cachedCartCount > 0) {
          setCartCount(cachedCartCount);
        }
        await fetchProducts({}, false);
        await fetchCartCount();
    };
    
    initializeStore();
  }, []);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const response = await cartApi.getCartCount();
      if (response.data.success) {
        setCartCount(response.data.data.cart_count);
        // Store in cache
        storeStore.getState().setCartCount(response.data.data.cart_count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  // Fetch products with caching
  const fetchProducts = async (filters: ProductFilters = {}, refresh: boolean = false) => {
    const filtersToUse = { ...currentFilters, ...filters };
    
    // Set loading state first
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsFetching(true);
    }
    setError(null);
    
    // Check cache first (unless refreshing)
    if (!refresh) {
      const cached = storeStore.getState().getCachedProducts(filtersToUse);
      if (cached) {
        setProducts(cached.products);
        setPagination(cached.pagination);
        setCurrentFilters(filtersToUse);
        setIsFetching(false);
        setIsRefreshing(false);
        return {
          products: cached.products,
          pagination: cached.pagination,
          fromCache: true,
        };
      }
    }

    try {
      const response = await productApi.getAllProducts(filtersToUse);
      
      if (response.data.success) {
        const productsData = response.data.data;
        const paginationData = response.data.pagination;

        // Update state
        setProducts(productsData);
        setPagination(paginationData);
        setCurrentFilters(filtersToUse);

        // Store in cache
        storeStore.getState().setCachedProducts(filtersToUse, productsData, paginationData);

        return {
          products: productsData,
          pagination: paginationData,
          fromCache: false,
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err: unknown) {
      console.error('Fetch products error:', (err as ApiError).response?.data);
      
      let errorMessage = 'Failed to fetch products';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  };

  // Refresh current products
  const refresh = async () => {
    await fetchCartCount();
    return await fetchProducts(currentFilters, true);
  };

  // Apply filters
  const applyFilters = async (filters: ProductFilters) => {
    setCurrentFilters({...currentFilters, ...filters});
    return await fetchProducts({ ...filters });
  };

  // Clear cache
  const clearCache = () => {
    storeStore.getState().clearCache();
  };

  // Invalidate specific cache
  const invalidateCache = (filters?: ProductFilters) => {
    storeStore.getState().invalidateCache(filters);
  };

  // Get cached products without fetching
  const getCachedProducts = (filters: ProductFilters = {}) => {
    return storeStore.getState().getProductsFromCache(filters);
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

  // Cart operations
  const handleCartAction = async (productId: string, quantity: number = 1) => {
    // Add to loading state
    setLoadingCart(prev => new Set(prev).add(productId));

    try {
      await cartApi.addToCart(productId, quantity);

      // Clear cart cache to ensure fresh data
      await cartStore.getState().clearCartCache();

      // Refresh cart count after adding item
      await fetchCartCount();

      return { success: true };
    } catch (err: unknown) {
      console.error('Cart action error:', err);
      
      let errorMessage = 'Failed to add to cart';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      // Remove from loading state
      setLoadingCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return {
    // Data
    products,
    pagination,
    currentFilters,
    setCurrentFilters,
    searchQuery,
    setSearchQuery,

    // Loading states
    isLoading: isFetching || isRefreshing,
    error,
    loadingWishlists: Array.from(loadingWishlists),
    loadingCart: Array.from(loadingCart),
    cartCount,
    
    fetchProducts,
    refresh,
    applyFilters,
    clearCache,
    invalidateCache,
    getCachedProducts,
    handleWishlistAction,
    handleCartAction,
    fetchCartCount,
  };
};
