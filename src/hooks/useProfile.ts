import { useState } from 'react';
import { profileApi } from '../api/profileApi';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const updateProfile = async (data: {
    full_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    password?: string;
  }) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await profileApi.updateProfile(data);
      const { user } = response.data;
      setUser(user);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      return user;
    } catch (err: any) {
      console.error('Update profile error:', err.response?.data);
      const errors = err.response?.data?.errors;
      let errorMessage = 'Failed to update profile';
      if (errors) {
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0] || errorMessage;
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAvatar = async (avatar: { avatar: string }) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await profileApi.updateAvatar(avatar);
      if (response.data.success) {
        const { user } = response.data;
        setUser(user);
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
        return true;
      }else{
        return false;
      }
    } catch (err: any) {
      console.error('Update avatar error:', err.response?.data);
      const errors = err.response?.data?.errors;
      let errorMessage = 'Failed to update avatar';
      if (errors) {
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0] || errorMessage;
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const getProfile = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await profileApi.getProfile();
      const { user } = response.data;
      setUser(user);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setIsFetching(false);
    }
  };

  const changePassword = async (data: {
    old_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await profileApi.changePassword(data);
      return response.data;
    } catch (err: any) {
      console.error('Change password error:', err.response?.data);
      const errors = err.response?.data?.errors;
      let errorMessage = 'Failed to change password';
      if (errors) {
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0] || errorMessage;
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    updateAvatar,
    getProfile,
    changePassword,
    isUpdating,
    isFetching,
    error,
  };
};
