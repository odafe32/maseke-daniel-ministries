import { z } from 'zod';

const env = z.object({
  API_URL: z.string().url().default('http://10.147.87.156:8000/api'),
  APP_ENV: z.string().default('development'),
});

export const { API_URL, APP_ENV } = env.parse(process.env);