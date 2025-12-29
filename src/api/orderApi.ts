import client from './client';

export const orderApi = {
  getAllOrders: () => {
    return client.get('/mobile/orders');
  },

  getOrder: (id: string) => {
    return client.get(`/mobile/orders/${id}`);
  },
};
