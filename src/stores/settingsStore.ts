import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface SettingsState {
  notifications: boolean;
  sermonAlerts: boolean;
  devotionalReminders: boolean;
  stayLoggedIn: boolean;
  setSetting: (key: keyof Omit<SettingsState, 'setSetting' | 'loadSettings'>, value: boolean) => void;
  loadSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS = {
  notifications: true,
  sermonAlerts: true,
  devotionalReminders: true,
  stayLoggedIn: true,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  setSetting: async (key, value) => {
    try {
      await AsyncStorage.setItem(`setting_${key}`, JSON.stringify(value));
      set({ [key]: value });
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
    }
  },

  loadSettings: async () => {
    try {
      const settings = await Promise.all(
        Object.keys(DEFAULT_SETTINGS).map(async (key) => {
          const storedValue = await AsyncStorage.getItem(`setting_${key}`);
          return {
            key,
            value: storedValue ? JSON.parse(storedValue) : DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS],
          };
        })
      );

      const newSettings = settings.reduce((acc, { key, value }) => {
        acc[key as keyof Omit<SettingsState, 'setSetting' | 'loadSettings'>] = value;
        return acc;
      }, {} as Partial<SettingsState>);

      set(newSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
}));
