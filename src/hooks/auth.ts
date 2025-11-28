import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPassword, login, LoginResponse } from '../api/authAPi';
import { useAuthStore } from '../stores/authStore';

export const useCreatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken, setUser } = useAuthStore();

  const mutate = async (email: string, password: string, confirmPassword: string): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createPassword(email, password, confirmPassword);
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create account';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken, setUser } = useAuthStore();

  const mutate = async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      // Store in Zustand and AsyncStorage
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
};
