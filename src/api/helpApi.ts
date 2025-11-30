import client from './client';

const helpApi = {
  submitFeedback: async (data: {
    full_name: string;
    email: string;
    message: string;
  }) => {
    const response = await client.post('/mobile/feedback/submit', data);
    return response.data;
  },
};

export default helpApi;
