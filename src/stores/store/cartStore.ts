import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '@/src/utils/types'

const CART_CACHE_KEY = '@cart_cache';

interface CartState {
  // Data
  cartItems: CartItem[];
  cartTotal: number;

  // Loading states
  isLoading: boolean;
  isUpdatingQuantity: boolean;
  isRemovingItem: boolean;

  // Error states
  error: string | null;

  // Loading item IDs
  updatingItems: Set<string>;
  removingItems: Set<string>;

  // Actions
  setCartItems: (items: CartItem[], total: number) => void;
  setLoading: (loading: boolean) => void;
  setUpdatingQuantity: (loading: boolean) => void;
  setRemovingItem: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Item-specific loading states
  setUpdatingItem: (itemId: string, loading: boolean) => void;
  setRemovingItemLoading: (itemId: string, loading: boolean) => void;
  
  // Cart operations
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  
  // Persistence
  loadCachedCart: () => Promise<void>;
  saveCartToCache: () => Promise<void>;
  clearCartCache: () => Promise<void>;
}

export const cartStore = create<CartState>((set, get) => ({
  // Initial state
  cartItems: [],
  cartTotal: 0,
  isLoading: false,
  isUpdatingQuantity: false,
  isRemovingItem: false,
  error: null,
  updatingItems: new Set(),
  removingItems: new Set(),

  // Set cart items
  setCartItems: (items: CartItem[], total: number) => {
    set({ 
      cartItems: items, 
      cartTotal: total 
    });
    
    // Save to cache
    get().saveCartToCache().catch(err => 
      console.error('Failed to save cart to cache:', err)
    );
  },

  // Loading states
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setUpdatingQuantity: (loading: boolean) => set({ isUpdatingQuantity: loading }),
  setRemovingItem: (loading: boolean) => set({ isRemovingItem: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  // Item-specific loading states
  setUpdatingItem: (itemId: string, loading: boolean) => {
    set(state => {
      const newUpdatingItems = new Set(state.updatingItems);
      if (loading) {
        newUpdatingItems.add(itemId);
      } else {
        newUpdatingItems.delete(itemId);
      }
      return { updatingItems: newUpdatingItems };
    });
  },

  setRemovingItemLoading: (itemId: string, loading: boolean) => {
    set(state => {
      const newRemovingItems = new Set(state.removingItems);
      if (loading) {
        newRemovingItems.add(itemId);
      } else {
        newRemovingItems.delete(itemId);
      }
      return { removingItems: newRemovingItems };
    });
  },

  // Update item quantity locally
  updateItemQuantity: (itemId: string, newQuantity: number) => {
    set(state => {
      const updatedItems = state.cartItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity
          };
        }
        return item;
      });
      
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        cartItems: updatedItems,
        cartTotal: newTotal
      };
    });

    // Save to cache
    get().saveCartToCache().catch(err => 
      console.error('Failed to save cart after quantity update:', err)
    );
  },

  // Remove item locally
  removeItem: (itemId: string) => {
    set(state => {
      const updatedItems = state.cartItems.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      return {
        cartItems: updatedItems,
        cartTotal: newTotal
      };
    });

    // Save to cache
    get().saveCartToCache().catch(err => 
      console.error('Failed to save cart after item removal:', err)
    );
  },

  // Clear cart
  clearCart: () => {
    set({ 
      cartItems: [], 
      cartTotal: 0 
    });
    
    // Clear cache
    get().clearCartCache().catch(err => 
      console.error('Failed to clear cart cache:', err)
    );
  },

  // Load cached cart from AsyncStorage
  loadCachedCart: async () => {
    try {
      const cached = await AsyncStorage.getItem(CART_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.items && parsed.total) {
          set({ 
            cartItems: parsed.items, 
            cartTotal: parsed.total 
          });
        }
      }
    } catch (error) {
      console.error('Failed to load cached cart:', error);
    }
  },

  // Save cart to AsyncStorage
  saveCartToCache: async () => {
    try {
      const { cartItems, cartTotal } = get();
      await AsyncStorage.setItem(CART_CACHE_KEY, JSON.stringify({
        items: cartItems,
        total: cartTotal,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save cart to cache:', error);
    }
  },

  // Clear cart cache
  clearCartCache: async () => {
    try {
      await AsyncStorage.removeItem(CART_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cart cache:', error);
    }
  },
}));
