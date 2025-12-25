import client from './client';

interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  avatar?: string;
  password?: string;
}

export const profileApi = {
  getProfile: () => client.get('/mobile/profile'),
  updateProfile: (data: ProfileUpdateData) => client.put('/mobile/profile', data),
  updateProfileAvatar: (avatarData: string) => client.post('/mobile/profile/avatar', { avatar: avatarData }),
  changePassword: (data: { old_password: string; password: string; password_confirmation: string }) =>
    client.post('/mobile/profile/change-password', data),
};
