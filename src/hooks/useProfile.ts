import { useState } from 'react';
import client from '../api/client';
import { useAuthStore } from '../stores/authStore';

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
    avatar?: any; // File object or blob
    password?: string;
  }) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await client.put('/mobile/profile', data);
      const { user } = response.data;
      setUser(user);
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

  const getProfile = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await client.get('/mobile/profile');
      const { user } = response.data;
      setUser(user);
      return user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setIsFetching(false);
    }
  };

  return {
    updateProfile,
    getProfile,
    isUpdating,
    isFetching,
    error,
  };
};
