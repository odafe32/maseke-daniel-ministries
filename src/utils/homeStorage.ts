import AsyncStorage from '@react-native-async-storage/async-storage';
import { quickActions } from '../constants/data';

export interface HomeUserData {
  full_name: string;
  avatar_url?: string;
  last_updated: string;
}

export interface HomeData {
  user: HomeUserData | null;
  quickActions: typeof quickActions;
  last_synced: string;
}

const HOME_DATA_KEY = 'home_data';

export class HomeStorage {
  // Save complete home data to local storage
  static async saveHomeData(homeData: HomeData): Promise<void> {
    try {
      const dataToSave = {
        ...homeData,
        last_synced: new Date().toISOString(),
      };
      await AsyncStorage.setItem(HOME_DATA_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save home data:', error);
      throw error;
    }
  }

  // Load home data from local storage
  static async getHomeData(): Promise<HomeData | null> {
    try {
      const data = await AsyncStorage.getItem(HOME_DATA_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to load home data:', error);
      return null;
    }
  }

  // Save user data only
  static async saveUserData(userData: HomeUserData): Promise<void> {
    try {
      const existingData = await this.getHomeData();
      const homeData: HomeData = {
        user: userData,
        quickActions: existingData?.quickActions || quickActions,
        last_synced: new Date().toISOString(),
      };
      await this.saveHomeData(homeData);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  // Get user data only
  static async getUserData(): Promise<HomeUserData | null> {
    try {
      const homeData = await this.getHomeData();
      return homeData?.user || null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Check if home data exists
  static async hasHomeData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(HOME_DATA_KEY);
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  // Clear home data (useful for logout or reset)
  static async clearHomeData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HOME_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear home data:', error);
      throw error;
    }
  }

  // Get last sync time
  static async getLastSyncTime(): Promise<string | null> {
    try {
      const homeData = await this.getHomeData();
      return homeData?.last_synced || null;
    } catch (error) {
      return null;
    }
  }

  // Check if data is stale (older than specified hours)
  static async isDataStale(hoursThreshold: number = 24): Promise<boolean> {
    try {
      const lastSync = await this.getLastSyncTime();
      if (!lastSync) return true;

      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

      return hoursDiff > hoursThreshold;
    } catch (error) {
      return true;
    }
  }
}
