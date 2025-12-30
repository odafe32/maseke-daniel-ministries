import client from './client';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DevotionalSummary {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration_days?: number;
  entries_count?: number;
}

export interface DevotionalEntry {
  id: number;
  devotional_id: number;
  devotional_title?: string;
  day_number: number;
  date?: string;
  title: string;
  content: string;
  video_url?: string | null;
  like_count: number;
  liked: boolean;
  bookmarked: boolean;
  total_days?: number;
  viewed?: boolean;
}

export interface BookmarkStatus {
  bookmarked: boolean;
  message?: string;
}

export interface DevotionalBookmark {
  id: number;
  bookmarked_at: string;
  entry: DevotionalEntry;
}

export interface DevotionalDetail extends Omit<DevotionalSummary, 'entries_count'> {
  entries: DevotionalEntry[];
}

export interface LikeStatus {
  liked: boolean;
  like_count: number;
}

export interface SubmitResponsePayload {
  heart_response?: string;
  takeaway_response?: string;
}

export interface DevotionalReflection {
  id: number;
  devotional_entry_id: number;
  user_id?: number | null;
  heart_response?: string | null;
  takeaway_response?: string | null;
  viewed?: boolean;
  created_at: string;
  updated_at: string;
}

export const devotionApi = {
  /** Fetch all devotionals available to the mobile app */
  async getDevotionals(): Promise<DevotionalSummary[]> {
    const response = await client.get<ApiResponse<DevotionalSummary[]>>('/mobile/devotionals');
    return response.data.data;
  },

  /** Fetch a specific devotional with all of its entries */
  async getDevotional(devotionalId: number | string): Promise<DevotionalDetail> {
    const response = await client.get<ApiResponse<DevotionalDetail>>(`/mobile/devotionals/${devotionalId}`);
    return response.data.data;
  },

  /** Fetch today's devotional entry (server falls back to latest when today is missing) */
  async getTodayEntry(): Promise<DevotionalEntry | null> {
    try {
      const response = await client.get<ApiResponse<DevotionalEntry | null>>('/mobile/devotionals/today');
      
      // Backend now returns 200 with null data when no entry exists
      if (!response.data.data) {
        console.log('No devotional entry available for today');
        return null;
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching today\'s devotional:', error);
      throw error;
    }
  },
  /** Fetch the entry for a devotional by day number */
  async getEntryByDay(devotionalId: number | string, dayNumber: number): Promise<DevotionalEntry> {
    const response = await client.get<ApiResponse<DevotionalEntry>>(
      `/mobile/devotionals/${devotionalId}/day/${dayNumber}`
    );
    return response.data.data;
  },

  /** Retrieve like status for an entry */
  async getLikeStatus(entryId: number | string): Promise<LikeStatus> {
    const response = await client.get<ApiResponse<LikeStatus>>(`/mobile/devotionals/entries/${entryId}/like-status`);
    return response.data.data;
  },

  /** Toggle like for an entry (optionally pass explicit like boolean) */
  async toggleLike(entryId: number | string, like?: boolean): Promise<LikeStatus> {
    const response = await client.post<ApiResponse<LikeStatus>>(
      `/mobile/devotionals/entries/${entryId}/like`,
      like === undefined ? undefined : { like }
    );
    return response.data.data;
  },

  /** Submit reflection responses for an entry */
  async submitResponse(entryId: number | string, payload: SubmitResponsePayload): Promise<DevotionalReflection> {
    const response = await client.post<ApiResponse<DevotionalReflection>>(
      `/mobile/devotionals/entries/${entryId}/responses`,
      payload
    );
    return response.data.data;
  },

  /** Mark a devotional entry as viewed */
  async markViewed(entryId: number | string): Promise<any> {
    const response = await client.post<ApiResponse<any>>(`/mobile/devotionals/entries/${entryId}/mark-viewed`);
    return response.data.data;
  },

  /** Toggle bookmark for a devotional entry */
  async toggleBookmark(entryId: number | string): Promise<BookmarkStatus> {
    const response = await client.post<ApiResponse<BookmarkStatus>>(
      `/mobile/devotionals/entries/${entryId}/bookmark`
    );
    // Extract the data from the nested response structure
    return response.data.data;
  },

  /** Get all bookmarked devotionals */
  async getBookmarks(): Promise<DevotionalBookmark[]> {
    const response = await client.get<ApiResponse<DevotionalBookmark[]>>('/mobile/devotionals/bookmarks');
    return response.data.data;
  },
};