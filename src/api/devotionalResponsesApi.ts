import client from './client';

export interface DevotionalResponseEntry {
  id: number;
  title: string;
  day_number: number;
  date: string;
  devotional_id: number;
  devotional_title: string;
}

export interface DevotionalResponse {
  id: number;
  devotional_entry_id: number;
  heart_response: string | null;
  takeaway_response: string | null;
  submitted: boolean;
  viewed: boolean;
  created_at: string;
  updated_at: string;
  entry: DevotionalResponseEntry | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const devotionalResponsesApi = {
  /**
   * Get all responses for the authenticated user
   * @param submitted - Filter by submitted status (optional)
   * @param limit - Maximum number of responses to return (default: 50, max: 100)
   */
  async getResponses(submitted?: boolean, limit: number = 50): Promise<DevotionalResponse[]> {
    const params = new URLSearchParams();
    if (submitted !== undefined) {
      params.append('submitted', String(submitted));
    }
    params.append('limit', String(Math.min(limit, 100)));

    const response = await client.get<ApiResponse<DevotionalResponse[]>>(
      `/mobile/devotional-responses?${params.toString()}`
    );
    return response.data.data;
  },

  /**
   * Get user's response for a specific devotional entry
   * @param entryId - The devotional entry ID
   */
  async getResponseForEntry(entryId: number): Promise<DevotionalResponse | null> {
    try {
      const response = await client.get<ApiResponse<DevotionalResponse>>(
        `/mobile/devotional-responses/entry/${entryId}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get recent submitted responses
   * @param limit - Maximum number of responses to return (default: 10, max: 50)
   */
  async getRecentResponses(limit: number = 10): Promise<DevotionalResponse[]> {
    const response = await client.get<ApiResponse<DevotionalResponse[]>>(
      `/mobile/devotional-responses/recent?limit=${Math.min(limit, 50)}`
    );
    return response.data.data;
  },

  /**
   * Update a devotional response
   * @param id - The response ID to update
   * @param data - The updated response data
   */
  async updateResponse(id: number, data: {
    heart_response?: string;
    takeaway_response?: string;
    submitted?: boolean;
  }): Promise<DevotionalResponse> {
    const response = await client.put<ApiResponse<DevotionalResponse>>(
      `/mobile/devotional-responses/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a devotional response
   * @param id - The response ID to delete
   */
  async deleteResponse(id: number): Promise<void> {
    await client.delete(`/mobile/devotional-responses/${id}`);
  },
};
