import client from './client';

export interface SystemPopup {
  id: string;
  type: 'text' | 'image';
  title?: string;
  text?: string;
  image?: string;
  action_button_title: string;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'inactive';
}

export interface SystemPopupResponse {
  message: string;
  data: SystemPopup | null;
}

export interface MarkViewedResponse {
  message: string;
  data: {
    id: string;
    user_id: string;
    seen_at: string;
  } | null;
}

export const getActivePopup = async (): Promise<SystemPopupResponse> => {
  const response = await client.get<SystemPopupResponse>('/mobile/system-popup/active');
  return response.data;
};

export const markPopupAsViewed = async (): Promise<MarkViewedResponse> => {
  const response = await client.post<MarkViewedResponse>('/mobile/system-popup/mark-viewed');
  return response.data;
};
