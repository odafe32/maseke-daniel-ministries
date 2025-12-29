import client from './client';

export interface SermonCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: string;
  order: number;
  series_count?: number;
}

export interface SermonSeries {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  preacher?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  year?: number;
  tags?: string[];
  status: string;
  order: number;
  category?: SermonCategory;
  tapes_count?: number;
  total_duration?: number;
  tapes?: SermonTape[];
}

export interface SermonTape {
  id: string;
  series_id: string;
  title: string;
  description?: string;
  preacher?: string;
  media_type: 'video' | 'mp3' | 'both';
  video_url?: string;
  audio_url?: string;
  video_embed_url?: string;
  video_stream_url?: string;
  audio_stream_url?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  duration?: number;
  sermon_date?: string;
  tags?: string[];
  scripture_reference?: string;
  status: string;
  video_status?: string;
  order: number;
  views: number;
  downloads: number;
  series?: SermonSeries;
  is_liked?: boolean;
  likes_count?: number;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const sermonApi = {
  // Get all sermon categories
  getCategories: async (): Promise<SermonCategory[]> => {
    const response = await client.get('/mobile/sermons/categories');
    return response.data.data;
  },

  getSeries: async (params?: {
    category_id?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<SermonSeries>> => {
    const response = await client.get('/mobile/sermons/series', { params });
    return response.data;
  },

  getSeriesById: async (id: string): Promise<SermonSeries> => {
    const response = await client.get(`/mobile/sermons/series/${id}`);
    return response.data.data;
  },

  getTapes: async (params?: {
    series_id?: string;
    category_id?: string;
    media_type?: 'audio' | 'video';
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<SermonTape>> => {
    const response = await client.get('/mobile/sermons/tapes', { params });
    return response.data;
  },

  getTape: async (id: string): Promise<SermonTape> => {
    const response = await client.get(`/mobile/sermons/tapes/${id}`);
    return response.data.data;
  },

  getTapeStreamUrl: async (id: string, type: 'audio' | 'video'): Promise<string> => {
    const response = await client.get(`/mobile/sermons/tapes/${id}/stream-url?type=${type}`);
    return response.data.data;
  },

  streamTapeMedia: async (id: string, type: 'audio' | 'video' | 'download'): Promise<string> => {
    const response = await client.get(`/mobile/sermons/tapes/${id}/stream`, {
      params: { type },
      responseType: 'text' 
    });
    return response.data; 
  },

  toggleLike: async (tapeId: string): Promise<{
    liked: boolean;
    likes_count: number;
  }> => {
    const response = await client.post(`/mobile/sermons/tapes/${tapeId}/like`);
    return response.data.data;
  },

  getLikedTapes: async (params?: {
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<SermonTape>> => {
    const response = await client.get('/mobile/sermons/liked', { params });
    return response.data;
  },

  trackDownload: async (tapeId: string): Promise<ApiResponse<null>> => {
    const response = await client.post(`/mobile/sermons/tapes/${tapeId}/download`);
    return response.data;
  }
};