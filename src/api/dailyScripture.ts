import api from './client';

export interface DailyScripture {
  id: number;
  date: string;
  scripture: string;
  verse: string;
  reference: string | null;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  user_interaction: {
    has_liked: boolean;
  };
}

export const dailyScriptureApi = {
  /**
   * Get today's scripture
   */
  getToday: async (): Promise<DailyScripture | null> => {
    try {
      const response = await api.get('/mobile/daily-scripture/today');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get scripture for a specific date
   */
  getByDate: async (date: string): Promise<DailyScripture | null> => {
    try {
      const response = await api.get(`/mobile/daily-scripture/date/${date}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
