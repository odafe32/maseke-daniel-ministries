import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getLiveComments, 
    postLiveComment, 
    updateLiveComment, 
    deleteLiveComment, 
    CreateCommentPayload, 
    UpdateCommentPayload 
} from '@/src/api/liveCommentApi';

export const useLiveComments = (liveStreamId: number | null, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Fetch comments with 3s polling
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['liveComments', liveStreamId],
    queryFn: () => getLiveComments(liveStreamId!),
    enabled: enabled && !!liveStreamId,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  const postComment = useMutation({
    mutationFn: ({ liveStreamId, payload }: { liveStreamId: number; payload: CreateCommentPayload }) =>
      postLiveComment(liveStreamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveComments', liveStreamId] });
    },
  });

  const updateComment = useMutation({
    mutationFn: ({ liveStreamId, commentId, payload }: { liveStreamId: number; commentId: number; payload: UpdateCommentPayload }) =>
      updateLiveComment(liveStreamId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveComments', liveStreamId] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: ({ liveStreamId, commentId }: { liveStreamId: number; commentId: number }) =>
      deleteLiveComment(liveStreamId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveComments', liveStreamId] });
    },
  });

  return {
    comments: data?.data?.data || [],
    isLoading,
    error,
    refetch,
    postComment: postComment.mutate,
    updateComment: updateComment.mutate,
    deleteComment: deleteComment.mutate,
    isPostingComment: postComment.isPending,
    isUpdatingComment: updateComment.isPending,
    isDeletingComment: deleteComment.isPending,
  };
};