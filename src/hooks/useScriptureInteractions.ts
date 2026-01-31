import { useState, useEffect, useCallback } from 'react';
import { scriptureInteractionApi, ScriptureStats, ScriptureComment } from '../api/scriptureInteractionApi';
import Toast from 'react-native-toast-message';

export const useScriptureInteractions = (entryId?: number) => {
  const [stats, setStats] = useState<ScriptureStats>({
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
  });
  const [comments, setComments] = useState<ScriptureComment[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Load interaction stats
   */
  const loadStats = useCallback(async () => {
    if (!entryId) return;

    setIsLoadingStats(true);
    try {
      const data = await scriptureInteractionApi.getStats(entryId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load scripture stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [entryId]);

  /**
   * Load comments
   */
  const loadComments = useCallback(async () => {
    if (!entryId) return;

    setIsLoadingComments(true);
    try {
      const data = await scriptureInteractionApi.getComments(entryId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load comments',
      });
    } finally {
      setIsLoadingComments(false);
    }
  }, [entryId]);

  /**
   * Toggle like on scripture
   */
  const toggleLike = useCallback(async () => {
    if (!entryId || isLiking) return;

    setIsLiking(true);
    try {
      const response = await scriptureInteractionApi.toggleLike(entryId);
      setStats(prev => ({
        ...prev,
        liked: response.liked,
        likes: response.like_count,
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to like scripture',
      });
    } finally {
      setIsLiking(false);
    }
  }, [entryId, isLiking]);

  /**
   * Add a comment
   */
  const addComment = useCallback(async (text: string, authorName?: string) => {
    if (!entryId || isCommenting) return;

    setIsCommenting(true);
    try {
      const newComment = await scriptureInteractionApi.addComment(entryId, text, authorName);
      setComments(prev => [newComment, ...prev]);
      setStats(prev => ({
        ...prev,
        comments: prev.comments + 1,
      }));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Comment added',
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add comment',
      });
    } finally {
      setIsCommenting(false);
    }
  }, [entryId, isCommenting]);

  /**
   * Toggle like on a comment
   */
  const toggleCommentLike = useCallback(async (commentId: number) => {
    try {
      const response = await scriptureInteractionApi.toggleCommentLike(commentId);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, liked: response.liked, likes: response.likes }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to like comment',
      });
    }
  }, []);

  /**
   * Record a share
   */
  const recordShare = useCallback(async (platform?: string) => {
    if (!entryId || isSharing) return;

    setIsSharing(true);
    try {
      const response = await scriptureInteractionApi.recordShare(entryId, platform);
      setStats(prev => ({
        ...prev,
        shares: response.share_count,
      }));
    } catch (error) {
      console.error('Failed to record share:', error);
    } finally {
      setIsSharing(false);
    }
  }, [entryId, isSharing]);

  /**
   * Load stats and comments on mount
   */
  useEffect(() => {
    if (entryId) {
      loadStats();
    }
  }, [entryId, loadStats]);

  return {
    // State
    stats,
    comments,
    isLoadingStats,
    isLoadingComments,
    isLiking,
    isCommenting,
    isSharing,

    // Actions
    loadStats,
    loadComments,
    toggleLike,
    addComment,
    toggleCommentLike,
    recordShare,
  };
};
