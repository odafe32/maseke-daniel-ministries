import client from './client';

const adsApi = {
  getAds: async () => {
    const response = await client.get('/mobile/ads');
    return response.data;
  },
};

export default adsApi;
