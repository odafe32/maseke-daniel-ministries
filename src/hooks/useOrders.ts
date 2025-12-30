import { useState, useEffect } from 'react';
import { orderApi } from '@/src/api/orderApi';
import { orderStore } from '@/src/stores/orderStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderItem, OrderStatus } from '@/src/utils/types';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'past'>('all');

  useEffect(() => {
    const initializeOrders = async () => {
      // First load cached data
      await orderStore.getState().loadCachedOrders();

      console.log("Loading from store");
      
      // Only fetch from API if no cached data exists
      const cachedData = await AsyncStorage.getItem('@orders_cache');
      if (!cachedData) {
        await fetchOrders();
      } else {
        // If cached data exists, just set loading to false
        setIsLoading(false);
      }
    };
    
    initializeOrders();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await orderApi.getAllOrders();
      
      console.log("response:", response);

      if (response.data.success) {
        const orders = response.data.data;
        console.log("orders:", orders);
        
        // Update store with fresh data
        orderStore.getState().setOrders(orders);
      } else {
        
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err: unknown) {
      console.error('Fetch orders error:', (err as ApiError).response?.data);
      
      let errorMessage = 'Failed to fetch orders';
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

  // Refresh orders
  const refresh = async () => {
    orderStore.getState().setRefreshing(true);
    try {
      await fetchOrders();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      orderStore.getState().setRefreshing(false);
    }
  };

  // Get filtered orders based on active filter
  const getFilteredOrders = () => {
    const orders = orderStore.getState().orders;
    if (activeFilter === 'ongoing') {
      return orders.filter(order => ['pending', 'paid', 'processing', 'shipped', 'ready_for_pickup'].includes(order.status));
    }else if (activeFilter === 'past') {
      return orders.filter(order => ['completed', 'cancelled', 'refunded'].includes(order.status));
    }else{
      return orders;
    }
  };

  // Get order by ID
  const getOrderById = (orderId: string) => {
    const orders = orderStore.getState().orders;
    return orders.find(order => order.id === orderId);
  };

  // Get orders count
  const getOrdersCount = () => {
    return orderStore.getState().orders.length;
  };

  // Get orders count by status
  const getOrdersCountByStatus = (status: OrderStatus) => {
    const orders = orderStore.getState().orders;
    return orders.filter(order => order.status === status).length;
  };

  // Get loading states
  const getIsRefreshing = () => {
    return orderStore.getState().isRefreshing;
  };

  // Clear error
  const clearError = () => {
    setError(null);
    orderStore.getState().clearError();
  };

  // Clear cache and fetch fresh data
  const clearCacheAndRefresh = async () => {
    await orderStore.getState().clearOrdersCache();
    await fetchOrders();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get display date for order (createdDate or fallback)
  const getDisplayDate = (order: Order) => {
    return order.createdDate ? formatDate(order.createdDate) : 'Unknown date';
  };

  // Get order number for display (use ID as fallback since API doesn't provide orderNumber)
  const getOrderNumber = (order: Order) => {
    return `#${order.id.slice(-8)}`; // Use last 8 characters of ID as order number
  };

  // Get product image from order item
  const getProductImage = (item: OrderItem) => {
    if (item?.product?.image) {
      return { uri: item.product.image };
    }
    // Fallback to a placeholder - check if placeholder exists
    try {
      return require('@/src/assets/images/placeholder.png');
    } catch {
      // If placeholder doesn't exist, return a default object
      return { uri: 'https://via.placeholder.com/60x60/f5f5f5/cccccc?text=No+Image' };
    }
  };

  // Get product title from order item
  const getProductTitle = (item: OrderItem) => {
    return item?.product?.title !== null && item?.product?.title !== undefined ? item.product.title : 'Unknown Product';
  };

  return {
    // Data
    orders: orderStore.getState().orders,
    filteredOrders: getFilteredOrders(),
    
    // Loading states
    isLoading,
    isRefreshing: getIsRefreshing(),
    error,
    
    // Filter state
    activeFilter,
    
    // Actions
    fetchOrders,
    refresh,
    setActiveFilter,
    getOrderById,
    getOrdersCount,
    getOrdersCountByStatus,
    clearError,
    clearCacheAndRefresh,
    
    // Helper functions
    formatDate,
    getDisplayDate,
    getOrderNumber,
    getProductImage,
    getProductTitle,
  };
};