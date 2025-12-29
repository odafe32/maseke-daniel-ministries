import { useState } from 'react';
import { profileApi } from '../api/profileApi';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

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
    avatar?: string; 
    password?: string;
  }) => {
    setIsUpdating(true);
    setError(null);
    try {
      let response;

      // Handle avatar update separately if avatar is provided
      if (data.avatar) {
        await profileApi.updateProfileAvatar(data.avatar);
        
        // Remove avatar from data for general profile update
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { avatar: _, ...profileData } = data;
        
        // Always get fresh profile data after avatar upload to ensure avatar_url is updated
        response = await profileApi.getProfile();
        
        // If there are other profile changes, update them as well
        if (Object.keys(profileData).length > 0) {
          await profileApi.updateProfile(profileData);
          // Get updated profile data again
          response = await profileApi.getProfile();
        }
      } else {
        // No avatar update, use general profile update
        response = await profileApi.updateProfile(data);
      }

      const { user } = response.data;
      setUser(user);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      return user;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Update profile error:', axiosError.response?.data);
      const responseData = axiosError.response?.data as ApiErrorResponse;
      const errors = responseData?.errors;
      let errorMessage = 'Failed to update profile';
      if (errors) {
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0] || errorMessage;
      } else {
        errorMessage = responseData?.message || errorMessage;
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
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      const responseData = axiosError.response?.data as ApiErrorResponse;
      setError(responseData?.message || 'Failed to fetch profile');
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
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Change password error:', axiosError.response?.data);
      const responseData = axiosError.response?.data as ApiErrorResponse;
      const errors = responseData?.errors;
      let errorMessage = 'Failed to change password';
      if (errors) {
        const firstField = Object.keys(errors)[0];
        errorMessage = errors[firstField][0] || errorMessage;
      } else {
        errorMessage = responseData?.message || errorMessage;
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
