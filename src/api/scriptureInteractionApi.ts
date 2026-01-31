import client from './client';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ScriptureStats {
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
}

export interface ScriptureComment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  created_at: string;
}

export interface LikeResponse {
  liked: boolean;
  like_count: number;
}

export interface CommentLikeResponse {
  liked: boolean;
  likes: number;
}

export interface ShareResponse {
  share_count: number;
}

export const scriptureInteractionApi = {
  /**
   * Toggle like on a scripture (devotional entry)
   */
  async toggleLike(entryId: number): Promise<LikeResponse> {
    const response = await client.post<ApiResponse<LikeResponse>>(
      `/mobile/scripture/entries/${entryId}/like`
    );
    return response.data.data;
  },

  /**
   * Get interaction stats for a scripture
   */
  async getStats(entryId: number): Promise<ScriptureStats> {
    const response = await client.get<ApiResponse<ScriptureStats>>(
      `/mobile/scripture/entries/${entryId}/stats`
    );
    return response.data.data;
  },

  /**
   * Get all comments for a scripture
   */
  async getComments(entryId: number): Promise<ScriptureComment[]> {
    const response = await client.get<ApiResponse<ScriptureComment[]>>(
      `/mobile/scripture/entries/${entryId}/comments`
    );
    return response.data.data;
  },

  /**
   * Add a comment to a scripture
   */
  async addComment(entryId: number, comment: string, authorName?: string): Promise<ScriptureComment> {
    const response = await client.post<ApiResponse<ScriptureComment>>(
      `/mobile/scripture/entries/${entryId}/comments`,
      {
        comment,
        author_name: authorName,
      }
    );
    return response.data.data;
  },

  /**
   * Toggle like on a comment
   */
  async toggleCommentLike(commentId: number): Promise<CommentLikeResponse> {
    const response = await client.post<ApiResponse<CommentLikeResponse>>(
      `/mobile/scripture/comments/${commentId}/like`
    );
    return response.data.data;
  },

  /**
   * Record a share
   */
  async recordShare(entryId: number, platform?: string): Promise<ShareResponse> {
    const response = await client.post<ApiResponse<ShareResponse>>(
      `/mobile/scripture/entries/${entryId}/share`,
      {
        platform,
      }
    );
    return response.data.data;
  },
};
