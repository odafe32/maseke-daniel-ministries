import client from './client';

export const profileApi = {
  getProfile: () => client.get('/mobile/profile'),
  updateProfile: (data: any) => client.put('/mobile/profile', data),
  updateAvatar: (data: { avatar: string }) => client.post('/mobile/profile/avatar', data),
  changePassword: (data: { old_password: string; password: string; password_confirmation: string }) =>
    client.post('/mobile/profile/change-password', data),
};
