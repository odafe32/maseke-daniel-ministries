import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '@/src/utils/types';

const ORDERS_CACHE_KEY = '@orders_cache';

interface OrderState {
  // Data
  orders: Order[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Error states
  error: string | null;

  // Actions
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Order operations
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  clearOrders: () => void;
  
  // Persistence
  loadCachedOrders: () => Promise<void>;
  saveOrdersToCache: () => Promise<void>;
  clearOrdersCache: () => Promise<void>;
}

export const orderStore = create<OrderState>((set, get) => ({
  // Initial state
  orders: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  // Set orders
  setOrders: (orders: Order[]) => {
    set({ orders });
    
    // Save to cache
    get().saveOrdersToCache().catch(err => 
      console.error('Failed to save orders to cache:', err)
    );
  },

  // Loading states
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  // Add order
  addOrder: (order: Order) => {
    set(state => ({
      orders: [order, ...state.orders]
    }));

    // Save to cache
    get().saveOrdersToCache().catch(err => 
      console.error('Failed to save orders after adding:', err)
    );
  },

  // Update order
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    set(state => ({
      orders: state.orders.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    }));

    // Save to cache
    get().saveOrdersToCache().catch(err => 
      console.error('Failed to save orders after updating:', err)
    );
  },

  // Remove order
  removeOrder: (orderId: string) => {
    set(state => ({
      orders: state.orders.filter(order => order.id !== orderId)
    }));

    // Save to cache
    get().saveOrdersToCache().catch(err => 
      console.error('Failed to save orders after removal:', err)
    );
  },

  // Clear orders
  clearOrders: () => {
    set({ orders: [] });
    
    // Clear cache
    get().clearOrdersCache().catch(err => 
      console.error('Failed to clear orders cache:', err)
    );
  },

  // Load cached orders from AsyncStorage
  loadCachedOrders: async () => {
    try {
      const cached = await AsyncStorage.getItem(ORDERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.orders) {
          set({ orders: parsed.orders });
        }
      }
    } catch (error) {
      console.error('Failed to load cached orders:', error);
    }
  },

  // Save orders to AsyncStorage
  saveOrdersToCache: async () => {
    try {
      const { orders } = get();
      await AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify({
        orders,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save orders to cache:', error);
    }
  },

  // Clear orders cache
  clearOrdersCache: async () => {
    try {
      await AsyncStorage.removeItem(ORDERS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear orders cache:', error);
    }
  },
}));