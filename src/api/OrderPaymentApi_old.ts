import client from './client';

export const orderPaymentApi = {
  /**
   * Initialize payment and create order
   * POST /mobile/payments/initialize
   */
  initializePayment: () => {
    return client.post('/mobile/payments/initialize');
  },

  /**
   * Verify payment
   * GET /mobile/payments/verify
   * @param reference - Payment transaction reference
   * @param pickupStationId - Required if delivery type is pickup
   */
  verifyPayment: (reference: string, pickupStationId?: string) => {
    const queryParams = new URLSearchParams();
    queryParams.append('reference', reference);
    
    if (pickupStationId) {
      queryParams.append('pickup_station_id', pickupStationId);
    }
    
    return client.get(`/mobile/payments/verify?${queryParams.toString()}`);
  },

  /**
   * Cancel payment
   * POST /mobile/payments/cancel
   * @param reference - Payment transaction reference
   */
  cancelPayment: (reference: string) => {
    return client.post('/mobile/payments/cancel', {
      reference,
    });
  },
};
