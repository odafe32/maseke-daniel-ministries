import { useEffect, useState, useCallback } from 'react';
import { pickupStationApi } from '@/src/api/PickupStationApi';
import { cartApi } from '@/src/api/cartApi';
import { orderPaymentApi } from '@/src/api/orderPaymentApi';
import { paymentStore } from '@/src/stores/store/paymentStore';
import { PickupStation } from '@/src/constants/data';
import { usePaystack } from 'react-native-paystack-webview';
import { showSuccessToast , showErrorToast } from "@/src/utils/toast";
import { useRouter } from 'expo-router';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const usePayment = () => {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedPickupStationId, setSelectedPickupStationId] = useState<string | null>(
    paymentStore.getState().selectedPickupStationId
  );
  const [paymentDetails, setPaymentDetails] = useState({
    reference: '',
    amount: 0,
    email: '',
  });

  const { popup } = usePaystack();
  const router = useRouter();
  
  const fetchPickupStations = useCallback(async () => {
    try {
      setError(null);
      const response = await pickupStationApi.getAllPickupStations({ per_page: 100 });
      const stations: PickupStation[] = response.data.data || [];
      paymentStore.getState().setPickupStations(stations);
      return stations;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to load pickup stations';
      setError(new Error(message));
      throw err;
    }
  }, []);

  const fetchCartTotal = useCallback(async () => {
    try {
      setError(null);
      const response = await cartApi.getAllCart();
      if (response.data?.success) {
        const total = Number(response.data.cart_total ?? 0);
        paymentStore.getState().setCartTotal(total);
        return total;
      }
      throw new Error(response.data?.message || 'Failed to load cart');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to load cart';
      setError(new Error(message));
      throw err;
    }
  }, []);

  const selectPickupStation = useCallback((id: string | null) => {
    setSelectedPickupStationId(id);
    paymentStore.getState().setSelectedPickupStationId(id);
  }, []);

  // Initialize from cache then fetch if empty
  useEffect(() => {
    const init = async () => {
      await paymentStore.getState().loadCache();

      const state = paymentStore.getState();
      const needsStations = (state.pickupStations?.length ?? 0) === 0;
      const needsCartTotal = typeof state.cartTotal !== 'number' || state.cartTotal <= 0;

      try {
        setLoading(true);
        setError(null);
        if (needsStations) {
          await fetchPickupStations();
        }
        if (needsCartTotal) {
          await fetchCartTotal();
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchCartTotal, fetchPickupStations]);

  const makePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await orderPaymentApi.initializePayment();
      
      if (response.data?.status === 'success') {
        const { authorization_url, access_code, reference, amount, email } = response.data.data;
        
        setPaymentDetails({
          reference,
          amount,
          email,
        });
        
        await initializePaystack(access_code, reference, amount, email);
      } else {
        throw new Error(response.data?.message || 'Failed to initialize payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to initialize payment';
      setError(new Error(message));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePaystack = async (access_code:string, reference: string, amount:number, email:string) => {
    popup.checkout({
      email: email,
      amount: Number(amount) * 100, // Paystack expects amount in kobo (cents)
      reference: reference, // Unique transaction reference
      // currency: "NGN",
      metadata: {
        custom_fields: [
          {
            display_name: "Order Payment",
            variable_name: "order_payment",
            value: "Order",
          },
        ],
      },
      onSuccess: () => {
        handlePaystackSuccess();
      },
      onCancel: () => {
        handlePaystackCancel(reference);
      },
      onError: () => {
        handlePaystackCancel(reference);
      },
    });
  };

  const handlePaystackSuccess = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await orderPaymentApi.verifyPayment(
        paymentDetails.reference,
        selectedPickupStationId || undefined
      );
      
      if (response.data?.status === 'success') {
        const { order_id, payment_id, status, amount, is_pickup, pickup_code } = response.data.data;
        
        console.log('Payment verified successfully', { order_id, payment_id, status, amount, is_pickup, pickup_code });
        handlePaymentSuccess();
      } else {
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Payment verification failed';
      setError(new Error(message));
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackCancel = async (reference: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await orderPaymentApi.cancelPayment(reference);
      
      if (response.data?.status === 'success') {
        const { order_id, payment_id, status } = response.data.data;
        
        // Payment cancelled successfully - you might want to show a message or redirect
        handlePaymentCancel();
        console.log('Payment cancelled successfully', { order_id, payment_id, status });
      } else {
        throw new Error(response.data?.message || 'Failed to cancel payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to cancel payment';
      setError(new Error(message));
      console.error('Payment cancellation error:', message);
    } finally {
      setIsProcessing(false);
    }
  }

  const handlePaymentSuccess = async () => {
    showSuccessToast('Payment completed successfully!');
    await paymentStore.getState().clearCache();
    router.push('/(home)/store');
  }

  const handlePaymentCancel = async () => {
    showErrorToast('Payment was cancelled');
    await paymentStore.getState().clearCache();
    router.push('/(home)/cart');
  }

  return {
    // Data
    isProcessing,
    pickupStations: paymentStore.getState().pickupStations,
    cartTotal: paymentStore.getState().cartTotal,
    selectedPickupStationId: selectedPickupStationId,

    // UI
    loading,
    error,

    // Actions
    fetchPickupStations,
    fetchCartTotal,
    selectPickupStation,
    makePayment,
  };
};
