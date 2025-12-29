import client from './client';

export const cartApi = {
  getAllCart: (params?: {
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/mobile/cart${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    return client.get(url);
  },

  getCartCount: () => {
    return client.get('/mobile/cart/count');
  },

  addToCart: (productId: string, quantity: number = 1) => {
    return client.post('/mobile/cart/add', {
      product_id: productId,
      quantity: quantity,
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    return client.put('/mobile/cart/update', {
      product_id: productId,
      quantity: quantity,
    });
  },

  removeFromCart: (productId: string) => {
    return client.delete('/mobile/cart/remove', {
      data: {
        product_id: productId,
      },
    });
  },
};
