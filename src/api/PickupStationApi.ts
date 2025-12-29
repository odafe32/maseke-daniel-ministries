import client from './client';
import { PickupStation } from '@/src/constants/data';

export const pickupStationApi = {
  /**
   * Get all pickup stations with pagination support
   * @param params Optional parameters for pagination
   * @returns Promise with pickup stations data
   */
  getAllPickupStations: (params?: {
    page?: number;
    per_page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const url = `/mobile/pickup-stations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    return client.get<{
      data: PickupStation[];
      current_page: number;
      total: number;
      per_page: number;
      last_page: number;
    }>(url);
  }
};
