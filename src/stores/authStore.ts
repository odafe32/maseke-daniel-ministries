import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../env';
import client from '../api/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  status: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  stayLoggedIn: boolean;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  stayLoggedIn: true, // Default to true for backward compatibility

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setStayLoggedIn: (stayLoggedIn) => set({ stayLoggedIn }),

  async login(email: string, password: string) {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mobile/auth/login`, { email, password });
      const { token, user } = response.data;

      const { stayLoggedIn } = get();
      
      if (stayLoggedIn) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
      }

      set({ token, user, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  async register(email: string, fullName: string) {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mobile/auth/register`, { email, full_name: fullName });
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  async logout() {
    // Save token before clearing state
    const { token: currentToken } = get();

    // Always clear local storage first, regardless of API call
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    set({ token: null, user: null, error: null });

    // Try to call logout API with the saved token
    if (currentToken) {
      try {
        await client.post('/mobile/auth/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        console.log('Logout API call successful');
      } catch (error) {
        console.warn('Logout API call failed, but local logout completed successfully');
      }
    }
  },

  async fetchUser() {
    const { token } = get();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      if (error.response?.status === 401) {
        get().logout();
      }
      set({ error: error.response?.data?.message || 'Failed to fetch user', isLoading: false });
    }
  },

  async loadStoredAuth() {
    try {
      const stayLoggedInStr = await AsyncStorage.getItem('stayLoggedIn');
      const stayLoggedIn = stayLoggedInStr ? JSON.parse(stayLoggedInStr) : true; // Default to true for backward compatibility

      set({ stayLoggedIn });

      if (stayLoggedIn) {
        const token = await AsyncStorage.getItem('authToken');
        const userStr = await AsyncStorage.getItem('authUser');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({ token, user });
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    }
  },

  async forgotPassword(email: string) {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mobile/auth/forgot-password`, { email });
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Forgot password failed', isLoading: false });
      throw error;
    }
  },
}));
