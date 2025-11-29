import { useAuthStore } from '../stores/authStore';

export const useUser = () => {
  const { user, token, isLoading, error } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token && !!user,
  };
};
