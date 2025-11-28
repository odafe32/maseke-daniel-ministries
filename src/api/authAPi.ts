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

export const otpLogin = async (email: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/otp-login', { email });
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

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/forgot-password', { email });
  return response.data;
};

export const verifyOtpPassword = async (email: string, otp: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/verify-otp-password', { email, otp });
  return response.data;
};

export const resetPassword = async (email: string, password: string, password_confirmation: string): Promise<{ message: string }> => {
  const response = await client.post('/mobile/auth/reset-password', { email, password, password_confirmation });
  return response.data;
};

export const verifyOtpLogin = async (email: string, otp: string): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>('/mobile/auth/verify-otp-login', { email, otp });
  return response.data;
};
