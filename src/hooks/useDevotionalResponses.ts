import { useEffect } from 'react';
import { useDevotionalResponsesStore } from '../stores/devotionalResponsesStore';

export const useDevotionalResponses = () => {
  const store = useDevotionalResponsesStore();

  return {
    // State
    responses: store.responses,
    recentResponses: store.recentResponses,
    selectedResponse: store.selectedResponse,

    // Loading states
    isLoadingResponses: store.isLoadingResponses,
    isLoadingRecent: store.isLoadingRecent,
    isLoadingEntry: store.isLoadingEntry,

    // Error state
    error: store.error,

    // Actions
    fetchResponses: store.fetchResponses,
    fetchRecentResponses: store.fetchRecentResponses,
    fetchResponseForEntry: store.fetchResponseForEntry,
    clearError: store.clearError,
    clearSelectedResponse: store.clearSelectedResponse,

    // Computed values
    hasResponses: store.responses.length > 0,
    hasRecentResponses: store.recentResponses.length > 0,
    submittedCount: store.responses.filter(r => r.submitted).length,
    draftCount: store.responses.filter(r => !r.submitted).length,
  };
};
