import client from './client';

export const wishlistApi = {
  getAllWishlists: (params?: {
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/mobile/wishlist${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    return client.get(url);
  },

  addToWishlist: (productId: string) => {
    return client.post('/mobile/wishlist/add', {
      product_id: productId,
    });
  },

  removeFromWishlist: (productId: string) => {
    return client.delete('/mobile/wishlist/remove', {
      data: {
        product_id: productId,
      },
    });
  },
};
