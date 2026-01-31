import { create } from 'zustand';
import { scriptureInteractionApi, ScriptureStats, ScriptureComment } from '../api/scriptureInteractionApi';

interface ScriptureInteractionsState {
  // Data
  stats: Record<number, ScriptureStats>;
  comments: Record<number, ScriptureComment[]>;

  // Loading states
  isLoadingStats: Record<number, boolean>;
  isLoadingComments: Record<number, boolean>;
  isLiking: Record<number, boolean>;
  isCommenting: Record<number, boolean>;
  isSharing: Record<number, boolean>;

  // Error states
  error: string | null;

  // Actions
  loadStats: (entryId: number) => Promise<void>;
  loadComments: (entryId: number) => Promise<void>;
  toggleLike: (entryId: number) => Promise<void>;
  addComment: (entryId: number, text: string, authorName?: string) => Promise<void>;
  toggleCommentLike: (entryId: number, commentId: number) => Promise<void>;
  recordShare: (entryId: number, platform?: string) => Promise<void>;
  clearError: () => void;
}

export const useScriptureInteractionsStore = create<ScriptureInteractionsState>((set, get) => ({
  // Initial state
  stats: {},
  comments: {},
  isLoadingStats: {},
  isLoadingComments: {},
  isLiking: {},
  isCommenting: {},
  isSharing: {},
  error: null,

  /**
   * Load interaction stats for a scripture
   */
  loadStats: async (entryId: number) => {
    set((state) => ({
      isLoadingStats: { ...state.isLoadingStats, [entryId]: true },
      error: null,
    }));

    try {
      const data = await scriptureInteractionApi.getStats(entryId);
      set((state) => ({
        stats: { ...state.stats, [entryId]: data },
        isLoadingStats: { ...state.isLoadingStats, [entryId]: false },
      }));
    } catch (error: any) {
      console.error('Failed to load scripture stats:', error);
      set((state) => ({
        isLoadingStats: { ...state.isLoadingStats, [entryId]: false },
        error: error.response?.data?.message || 'Failed to load stats',
      }));
    }
  },

  /**
   * Load comments for a scripture
   */
  loadComments: async (entryId: number) => {
    set((state) => ({
      isLoadingComments: { ...state.isLoadingComments, [entryId]: true },
      error: null,
    }));

    try {
      const data = await scriptureInteractionApi.getComments(entryId);
      set((state) => ({
        comments: { ...state.comments, [entryId]: data },
        isLoadingComments: { ...state.isLoadingComments, [entryId]: false },
      }));
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      set((state) => ({
        isLoadingComments: { ...state.isLoadingComments, [entryId]: false },
        error: error.response?.data?.message || 'Failed to load comments',
      }));
    }
  },

  /**
   * Toggle like on a scripture
   */
  toggleLike: async (entryId: number) => {
    const state = get();
    if (state.isLiking[entryId]) return;

    set((state) => ({
      isLiking: { ...state.isLiking, [entryId]: true },
      error: null,
    }));

    try {
      const response = await scriptureInteractionApi.toggleLike(entryId);
      
      set((state) => ({
        stats: {
          ...state.stats,
          [entryId]: {
            ...state.stats[entryId],
            liked: response.liked,
            likes: response.like_count,
          },
        },
        isLiking: { ...state.isLiking, [entryId]: false },
      }));
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
      set((state) => ({
        isLiking: { ...state.isLiking, [entryId]: false },
        error: error.response?.data?.message || 'Failed to like scripture',
      }));
    }
  },

  /**
   * Add a comment to a scripture
   */
  addComment: async (entryId: number, text: string, authorName?: string) => {
    const state = get();
    if (state.isCommenting[entryId]) return;

    set((state) => ({
      isCommenting: { ...state.isCommenting, [entryId]: true },
      error: null,
    }));

    try {
      const newComment = await scriptureInteractionApi.addComment(entryId, text, authorName);
      
      set((state) => ({
        comments: {
          ...state.comments,
          [entryId]: [newComment, ...(state.comments[entryId] || [])],
        },
        stats: {
          ...state.stats,
          [entryId]: {
            ...state.stats[entryId],
            comments: (state.stats[entryId]?.comments || 0) + 1,
          },
        },
        isCommenting: { ...state.isCommenting, [entryId]: false },
      }));
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      set((state) => ({
        isCommenting: { ...state.isCommenting, [entryId]: false },
        error: error.response?.data?.message || 'Failed to add comment',
      }));
    }
  },

  /**
   * Toggle like on a comment
   */
  toggleCommentLike: async (entryId: number, commentId: number) => {
    try {
      const response = await scriptureInteractionApi.toggleCommentLike(commentId);
      
      set((state) => ({
        comments: {
          ...state.comments,
          [entryId]: (state.comments[entryId] || []).map((comment) =>
            comment.id === commentId
              ? { ...comment, liked: response.liked, likes: response.likes }
              : comment
          ),
        },
      }));
    } catch (error: any) {
      console.error('Failed to toggle comment like:', error);
      set({
        error: error.response?.data?.message || 'Failed to like comment',
      });
    }
  },

  /**
   * Record a share
   */
  recordShare: async (entryId: number, platform?: string) => {
    const state = get();
    if (state.isSharing[entryId]) return;

    set((state) => ({
      isSharing: { ...state.isSharing, [entryId]: true },
      error: null,
    }));

    try {
      const response = await scriptureInteractionApi.recordShare(entryId, platform);
      
      set((state) => ({
        stats: {
          ...state.stats,
          [entryId]: {
            ...state.stats[entryId],
            shares: response.share_count,
          },
        },
        isSharing: { ...state.isSharing, [entryId]: false },
      }));
    } catch (error: any) {
      console.error('Failed to record share:', error);
      set((state) => ({
        isSharing: { ...state.isSharing, [entryId]: false },
        error: error.response?.data?.message || 'Failed to record share',
      }));
    }
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));
