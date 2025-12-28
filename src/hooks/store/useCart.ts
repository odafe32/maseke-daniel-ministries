import { useState, useEffect } from 'react';
import { cartApi } from '../../api/cartApi';
import { cartStore } from '../../stores/store/cartStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    const initializeCart = async () => {
      // First load cached data
      await cartStore.getState().loadCachedCart();
      
      // Only fetch from API if no cached data exists
      const cachedData = await AsyncStorage.getItem('@cart_cache');
      if (!cachedData) {
        await fetchCart();
      } else {
        // If cached data exists, just set loading to false
        setIsLoading(false);
      }
    };
    
    initializeCart();
  }, []);

  // Fetch cart from API
  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await cartApi.getAllCart();
      
      if (response.data.success) {
        const cartItems = response.data.data;
        const cartTotal = response.data.cart_total;
        
        // Update store with fresh data
        cartStore.getState().setCartItems(cartItems, cartTotal);
      } else {
        throw new Error(response.data.message || 'Failed to fetch cart');
      }
    } catch (err: unknown) {
      console.error('Fetch cart error:', (err as ApiError).response?.data);
      
      let errorMessage = 'Failed to fetch cart';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cart
  const refresh = async () => {
    return await fetchCart();
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    // Set updating item ID
    setUpdatingItemId(itemId);

    try {
      const response = await cartApi.updateQuantity(itemId, quantity);
      
      if (response.data.success) {
        // Refresh cart to get fresh data from backend
        await fetchCart();
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update quantity');
      }
    } catch (err: unknown) {
      console.error('Update quantity error:', err);
      
      let errorMessage = 'Failed to update quantity';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      // Clear updating item ID
      setUpdatingItemId(null);
    }
  };

  // Increase quantity
  const increaseQuantity = async (itemId: string) => {
    const cart = cartStore.getState();
    const item = cart.cartItems.find(item => item.id === itemId);
    
    if (!item) {
      console.error('Item not found:', itemId);
      return { success: false, error: 'Item not found' };
    }

    const newQuantity = item.quantity + 1;
    return await updateQuantity(itemId, newQuantity);
  };

  // Decrease quantity
  const decreaseQuantity = async (itemId: string) => {
    const cart = cartStore.getState();
    const item = cart.cartItems.find(item => item.id === itemId);
    
    if (!item) {
      console.error('Item not found:', itemId);
      return { success: false, error: 'Item not found' };
    }

    if (item.quantity <= 1) {
      return { success: false, error: 'Quantity cannot be less than 1' };
    }

    const newQuantity = item.quantity - 1;
    return await updateQuantity(itemId, newQuantity);
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    // Set updating item ID
    setUpdatingItemId(itemId);

    try {
      const response = await cartApi.removeFromCart(itemId);
      
      if (response.data.success) {
        // Refresh cart to get fresh data from backend
        await fetchCart();
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to remove item');
      }
    } catch (err: unknown) {
      console.error('Remove from cart error:', err);
      
      let errorMessage = 'Failed to remove item';
      const apiError = err as ApiError;
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      // Clear updating item ID
      setUpdatingItemId(null);
    }
  };

  // Get total amount
  const getTotalAmount = () => {
    return cartStore.getState().cartTotal;
  };

  // Get cart items
  const getCartItems = () => {
    return cartStore.getState().cartItems;
  };

  // Get loading states
  const getUpdatingItems = () => {
    return Array.from(cartStore.getState().updatingItems);
  };

  const getRemovingItems = () => {
    return Array.from(cartStore.getState().removingItems);
  };

  // Clear error
  const clearError = () => {
    setError(null);
    cartStore.getState().clearError();
  };

  // Clear cache and fetch fresh data
  const clearCacheAndRefresh = async () => {
    await cartStore.getState().clearCartCache();
    await fetchCart();
  };

  return {
    // Data
    cartItems: getCartItems(),
    cartTotal: getTotalAmount(),
    
    // Loading states
    isLoading,
    error,
    updatingItems: getUpdatingItems(),
    removingItems: getRemovingItems(),
    updatingItemId,
    
    // Actions
    fetchCart,
    refresh,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getTotalAmount,
    clearError,
    clearCacheAndRefresh,
  };
};
