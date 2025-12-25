import client from './client';

export interface LiveStream {
  id: number;
  title: string;
  description: string;
  stream_url: string;
  is_live: boolean;
  is_active?: boolean; // Optional for backward compatibility
  started_at: string;
}

export const getLiveStreams = async (): Promise<LiveStream[]> => {
  const response = await client.get('/mobile/live-streams');
  return response.data;
};

export const getLiveStream = async (): Promise<LiveStream | null> => {
  const response = await client.get('/mobile/live/status');
  return response.data.data;
};

export const getLiveStatus = async (): Promise<boolean> => {
  const response = await client.get('/mobile/live/status');
  return !!response.data.data;
};