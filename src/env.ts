import { z } from 'zod';

const env = z.object({
  API_URL: z.string().url().default('http://192.168.0.113:8000/api'),
  APP_ENV: z.string().default('development'),
});

export const { API_URL, APP_ENV } = env.parse(process.env);