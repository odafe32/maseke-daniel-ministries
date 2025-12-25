import client from './client';

export interface LiveComment {
  id: number;
  message: string;
  reply_to_id?: number;
  is_edited: boolean;
  can_edit: boolean;
  can_delete: boolean;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  replyTo?: {
    id: number;
    message: string;
    user: { name: string; };
  };
}

export interface CreateCommentPayload {
  message: string;
  reply_to_id?: number;
}

export interface UpdateCommentPayload {
  message: string;
}

export const getLiveComments = async (liveStreamId: number) => {
  const response = await client.get(`/mobile/live/${liveStreamId}/comments`);
  return response.data;
};

export const postLiveComment = async (liveStreamId: number, payload: CreateCommentPayload) => {
  const response = await client.post(`/mobile/live/${liveStreamId}/comments`, payload);
  return response.data;
};

export const updateLiveComment = async (liveStreamId: number, commentId: number, payload: UpdateCommentPayload) => {
  const response = await client.put(`/mobile/live/${liveStreamId}/comments/${commentId}`, payload);
  return response.data;
};

export const deleteLiveComment = async (liveStreamId: number, commentId: number) => {
  const response = await client.delete(`/mobile/live/${liveStreamId}/comments/${commentId}`);
  return response.data;
};