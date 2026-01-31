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
  isUpdatingResponse: boolean;
  isDeletingResponse: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchResponses: (submitted?: boolean, limit?: number) => Promise<void>;
  fetchRecentResponses: (limit?: number) => Promise<void>;
  fetchResponseForEntry: (entryId: number) => Promise<DevotionalResponse | null>;
  updateResponse: (id: number, data: { heart_response?: string; takeaway_response?: string; submitted?: boolean }) => Promise<void>;
  deleteResponse: (id: number) => Promise<void>;
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
  isUpdatingResponse: false,
  isDeletingResponse: false,

  error: null,

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

  updateResponse: async (id: number, data: { heart_response?: string; takeaway_response?: string; submitted?: boolean }) => {
    set({ isUpdatingResponse: true, error: null });

    try {
      const updatedResponse = await devotionalResponsesApi.updateResponse(id, data);

      set((state) => ({
        responses: state.responses.map((response) =>
          response.id === id ? updatedResponse : response
        ),
        recentResponses: state.recentResponses.map((response) =>
          response.id === id ? updatedResponse : response
        ),
        selectedResponse: state.selectedResponse?.id === id ? updatedResponse : state.selectedResponse,
        isUpdatingResponse: false,
      }));
    } catch (error: any) {
      console.error('Failed to update response:', error);
      set({
        isUpdatingResponse: false,
        error: error.response?.data?.message || 'Failed to update response',
      });
    }
  },

  deleteResponse: async (id: number) => {
    set({ isDeletingResponse: true, error: null });

    try {
      await devotionalResponsesApi.deleteResponse(id);

      set((state) => ({
        responses: state.responses.filter((response) => response.id !== id),
        recentResponses: state.recentResponses.filter((response) => response.id !== id),
        selectedResponse: state.selectedResponse?.id === id ? null : state.selectedResponse,
        isDeletingResponse: false,
      }));
    } catch (error: any) {
      console.error('Failed to delete response:', error);
      set({
        isDeletingResponse: false,
        error: error.response?.data?.message || 'Failed to delete response',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelectedResponse: () => {
    set({ selectedResponse: null });
  },
}));
