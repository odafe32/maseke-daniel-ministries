import { create } from 'zustand';
import { DevotionalResponse, devotionalResponsesApi } from '../api/devotionalResponsesApi';

interface DevotionalResponsesState {
  // Data
  responses: DevotionalResponse[];
  recentResponses: DevotionalResponse[];
  selectedResponse: DevotionalResponse | null;

  // Loading states
  isLoadingResponses: boolean;
  isLoadingRecent: boolean;
  isLoadingEntry: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchResponses: (submitted?: boolean, limit?: number) => Promise<void>;
  fetchRecentResponses: (limit?: number) => Promise<void>;
  fetchResponseForEntry: (entryId: number) => Promise<DevotionalResponse | null>;
  clearError: () => void;
  clearSelectedResponse: () => void;
}

export const useDevotionalResponsesStore = create<DevotionalResponsesState>((set, get) => ({
  // Initial state
  responses: [],
  recentResponses: [],
  selectedResponse: null,

  isLoadingResponses: false,
  isLoadingRecent: false,
  isLoadingEntry: false,

  error: null,

  // Fetch all responses for the user
  fetchResponses: async (submitted?: boolean, limit: number = 50) => {
    set({ isLoadingResponses: true, error: null });

    try {
      const responses = await devotionalResponsesApi.getResponses(submitted, limit);
      set({
        responses,
        isLoadingResponses: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch responses:', error);
      set({
        isLoadingResponses: false,
        error: error.response?.data?.message || 'Failed to load responses',
      });
    }
  },

  // Fetch recent submitted responses
  fetchRecentResponses: async (limit: number = 10) => {
    set({ isLoadingRecent: true, error: null });

    try {
      const recentResponses = await devotionalResponsesApi.getRecentResponses(limit);
      set({
        recentResponses,
        isLoadingRecent: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch recent responses:', error);
      set({
        isLoadingRecent: false,
        error: error.response?.data?.message || 'Failed to load recent responses',
      });
    }
  },

  // Fetch response for a specific entry
  fetchResponseForEntry: async (entryId: number): Promise<DevotionalResponse | null> => {
    set({ isLoadingEntry: true, error: null });

    try {
      const response = await devotionalResponsesApi.getResponseForEntry(entryId);
      set({
        selectedResponse: response,
        isLoadingEntry: false,
      });
      return response;
    } catch (error: any) {
      console.error('Failed to fetch response for entry:', error);
      set({
        isLoadingEntry: false,
        error: error.response?.data?.message || 'Failed to load response',
      });
      return null;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear selected response
  clearSelectedResponse: () => {
    set({ selectedResponse: null });
  },
}));
