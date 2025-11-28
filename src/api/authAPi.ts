import client from './client';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    status: string;
  };
}

export const register = async (email: string, fullName: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/register', { email, full_name: fullName });
  return response.data;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>('/mobile/auth/login', { email, password });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/verify-otp', { email, otp });
  return response.data;
};

export const createPassword = async (email: string, password: string, password_confirmation: string): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>('/mobile/auth/create-password', { email, password, password_confirmation });
  return response.data;
};
