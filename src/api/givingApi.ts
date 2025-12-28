import client from './client';

export const givingApi = {
  /**
   * Initialize payment and create giving record
   * POST /mobile/giving/initialize
   * @param amount - Giving amount
   * @param type - Giving type (tithe, offering, donation, building, mission)
   */
  initializePayment: (amount: number, type: string) => {
    return client.post('/mobile/giving/initialize', {
      amount,
      type,
    });
  },

  /**
   * Verify payment
   * POST /mobile/giving/verify
   * @param reference - Payment transaction reference
   */
  verifyPayment: (reference: string) => {
    return client.post('/mobile/giving/verify', {
      reference,
    });
  },

  /**
   * Cancel payment
   * POST /mobile/giving/cancel
   * @param reference - Payment transaction reference
   */
  cancelPayment: (reference: string) => {
    return client.post('/mobile/giving/cancel', {
      reference,
    });
  },
};
