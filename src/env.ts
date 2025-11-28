import { z } from 'zod';

const env = z.object({
  API_URL: z.string().url(),
  APP_ENV: z.string(),
});

export const { API_URL, APP_ENV } = env.parse(process.env);
