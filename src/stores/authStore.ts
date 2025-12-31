import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { API_URL } from '../env';
import client from '../api/client';
import { useSettingsStore } from './settingsStore';

const LAST_SYNCED_PUSH_TOKEN_KEY = 'lastSyncedPushToken';

interface User {
  id: string;
  email: string;
  full_name: string;
  status: string;
  phone_number?: string;
  address?: string;
  avatar?: string;
  avatar_url?: string;
  avatar_base64?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  stayLoggedIn: boolean;
  pushToken: string | null;
  lastSyncedPushToken: string | null;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  setPushToken: (pushToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendPushToken: (pushToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  stayLoggedIn: true, 
  pushToken: null,
  lastSyncedPushToken: null,

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setStayLoggedIn: (stayLoggedIn) => set({ stayLoggedIn }),
  setPushToken: (pushToken) => set({ pushToken }),

  async login(email: string, password: string) {
    set({ isLoading: true, error: null });
    try {
      const { pushToken } = get();
      const response = await axios.post(`${API_URL}/mobile/auth/login`, {
        email,
        password,
        push_token: pushToken,
      });
      const { token, user } = response.data;

      const { stayLoggedIn } = get();
      
      if (stayLoggedIn) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
      }

      set({ token, user, isLoading: false });

      if (pushToken) {
        get().sendPushToken(pushToken);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      set({ error: message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  async sendPushToken(pushToken: string) {
    const { token, lastSyncedPushToken } = get();
    if (!token || !pushToken) return;

    if (lastSyncedPushToken === pushToken) {
      return;
    }

    try {
      await axios.post(`${API_URL}/mobile/auth/push-token`, { 
        push_token: pushToken,
        platform: Platform.OS 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ lastSyncedPushToken: pushToken });
      await AsyncStorage.setItem(LAST_SYNCED_PUSH_TOKEN_KEY, pushToken);
      console.log('Push token sent to backend');
    } catch (error) {
      console.error('Failed to send push token:', error);
    }
  },

  async register(email: string, fullName: string) {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/mobile/auth/register`, { email, full_name: fullName });
      set({ isLoading: false });
      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      set({ error: message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  async logout() {
    const { token: currentToken } = get();

    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    await AsyncStorage.removeItem(LAST_SYNCED_PUSH_TOKEN_KEY);
    set({ token: null, user: null, error: null, lastSyncedPushToken: null });

    // Clear settings store
    await useSettingsStore.getState().clearSettings();

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
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        get().logout();
      }
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      set({ error: message || 'Failed to fetch user', isLoading: false });
    }
  },

  async loadStoredAuth() {
    try {
      const stayLoggedInStr = await AsyncStorage.getItem('stayLoggedIn');
      const stayLoggedIn = stayLoggedInStr ? JSON.parse(stayLoggedInStr) : true;

      set({ stayLoggedIn });

      if (stayLoggedIn) {
        const token = await AsyncStorage.getItem('authToken');
        const userStr = await AsyncStorage.getItem('authUser');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({ token, user });
        }
      }

      const lastSyncedPushToken = await AsyncStorage.getItem(LAST_SYNCED_PUSH_TOKEN_KEY);
      if (lastSyncedPushToken) {
        set({ lastSyncedPushToken });
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
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      set({ error: message || 'Forgot password failed', isLoading: false });
      throw error;
    }
  },
}));
