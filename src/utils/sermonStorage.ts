import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineSermon {
  id: string;
  title: string;
  localAudioPath?: string;
  localVideoPath?: string;
  downloadedAt: string;
}

const OFFLINE_SERMONS_KEY = 'offline_sermons';

export class SermonStorage {
  static async saveOfflineSermon(sermon: OfflineSermon): Promise<void> {
    try {
      const existing = await this.getAllOfflineSermons();
      const filtered = existing.filter(s => s.id !== sermon.id);
      const updated = [...filtered, sermon];
      await AsyncStorage.setItem(OFFLINE_SERMONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save offline sermon:', error);
    }
  }

  static async getAllOfflineSermons(): Promise<OfflineSermon[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_SERMONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline sermons:', error);
      return [];
    }
  }

  static async getOfflineSermon(id: string): Promise<OfflineSermon | null> {
    try {
      const sermons = await this.getAllOfflineSermons();
      return sermons.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Failed to get offline sermon:', error);
      return null;
    }
  }

  static async removeOfflineSermon(id: string): Promise<void> {
    try {
      const existing = await this.getAllOfflineSermons();
      const filtered = existing.filter(s => s.id !== id);
      await AsyncStorage.setItem(OFFLINE_SERMONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove offline sermon:', error);
    }
  }

  static async isSermonOffline(id: string): Promise<boolean> {
    try {
      const sermon = await this.getOfflineSermon(id);
      return sermon !== null;
    } catch (error) {
      return false;
    }
  }
}
