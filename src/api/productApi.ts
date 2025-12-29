import client from './client';

export const productApi = {
  getAllProducts: (params?: {
    search?: string;
    sort_by?: string;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/mobile/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    return client.get(url);
  },

  getProduct: (id: string) => {
    return client.get(`/mobile/products/${id}`);
  },
};
