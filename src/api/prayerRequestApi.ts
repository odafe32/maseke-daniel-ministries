import client from './client';

export interface PrayerRequestData {
  name: string;
  email: string;
  message: string;
}

export interface PrayerRequestResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    submitted_at: string;
  };
  errors?: Record<string, string[]>;
}

export const prayerRequestApi = {
  submitPrayerRequest: async (data: PrayerRequestData): Promise<PrayerRequestResponse> => {
    const response = await client.post('/mobile/prayer-request/submit', data);
    return response.data;
  },
};
