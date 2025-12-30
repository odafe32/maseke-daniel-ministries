import { useEffect, useState, useCallback, useRef } from 'react';
import { pickupStationApi } from '@/src/api/PickupStationApi';
import { cartApi } from '@/src/api/cartApi';
import { orderPaymentApi } from '@/src/api/orderPaymentApi';
import { paymentStore } from '@/src/stores/store/paymentStore';
import { cartStore } from '@/src/stores/store/cartStore';
import { storeStore } from '@/src/stores/store/storeStore';
import { orderStore } from '@/src/stores/orderStore';
import { PickupStation } from '@/src/utils/types';
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
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isLoadingCartTotal, setIsLoadingCartTotal] = useState(false);
  const [selectedPickupStationId, setSelectedPickupStationId] = useState<string | null>(
    paymentStore.getState().selectedPickupStationId
  );
  const paymentDetails = useRef({
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
      setIsLoadingCartTotal(true);
      setError(null);
      const response = await cartApi.getAllCart();
      if (response.data?.success) {
        const total = Number(response.data.cart_total ?? 0);
        setCartTotal(total);
        return total;
      }
      throw new Error(response.data?.message || 'Failed to load cart');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to load cart';
      setError(new Error(message));
      throw err;
    } finally {
      setIsLoadingCartTotal(false);
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

      try {
        setLoading(true);
        setError(null);
        if (needsStations) {
          await fetchPickupStations();
        }
        // Always fetch cart total on mount
        await fetchCartTotal();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchCartTotal, fetchPickupStations]);

  const makePayment = async () => {
    console.log('makePayment: Starting payment initialization');
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('makePayment: Calling initializePayment API');
      const response = await orderPaymentApi.initializePayment();
      console.log('makePayment: API response:', response.data);
      
      if (response.data?.status === 'success') {
        const { authorization_url, access_code, reference, amount, email } = response.data.data;
        console.log('makePayment: Payment initialized successfully', { authorization_url, access_code, reference, amount, email });
        
        paymentDetails.current = {
          reference,
          amount,
          email,
        };
        
        console.log('makePayment: Initializing Paystack checkout');
        await initializePaystack(access_code, reference, amount, email);
      } else {
        console.log('makePayment: Payment initialization failed', response.data);
        throw new Error(response.data?.message || 'Failed to initialize payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to initialize payment';
      console.log('makePayment: Error occurred:', message, err);
      setError(new Error(message));
      throw err;
    } finally {
      setIsProcessing(false);
      console.log('makePayment: Process completed');
    }
  };

  const initializePaystack = async (access_code:string, reference: string, amount:number, email:string) => {
    console.log('initializePaystack: Starting Paystack checkout', { access_code, reference, amount, email });
    popup.checkout({
      email: email,
      amount: Number(amount), // Paystack expects amount in kobo (cents)
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
        console.log('initializePaystack: Paystack payment successful');
        handlePaystackSuccess();
      },
      onCancel: () => {
        console.log('initializePaystack: Paystack payment cancelled');
        handlePaystackCancel(reference);
      },
      onError: () => {
        console.log('initializePaystack: Paystack payment error');
        handlePaystackCancel(reference);
      },
    });
  };

  const handlePaystackSuccess = async () => {
    console.log('handlePaystackSuccess: Starting payment verification');
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('handlePaystackSuccess: Verifying payment with reference:', paymentDetails.current.reference);
      const response = await orderPaymentApi.verifyPayment(
        paymentDetails.current.reference,
        selectedPickupStationId || undefined
      );
      console.log('handlePaystackSuccess: Verification response:', response.data);
      
      if (response.data?.status === 'success') {
        const { order_id, payment_id, status, amount, is_pickup, pickup_code } = response.data.data;
        
        console.log('Payment verified successfully', { order_id, payment_id, status, amount, is_pickup, pickup_code });
        handlePaymentSuccess();
      } else {
        console.log('handlePaystackSuccess: Verification failed', response.data);
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Payment verification failed';
      console.log('handlePaystackSuccess: Error occurred:', message, err);
      setError(new Error(message));
      throw err;
    } finally {
      setIsProcessing(false);
      console.log('handlePaystackSuccess: Process completed');
    }
  };

  const handlePaystackCancel = async (reference: string) => {
    console.log('handlePaystackCancel: Starting payment cancellation for reference:', reference);
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log('handlePaystackCancel: Calling cancelPayment API');
      const response = await orderPaymentApi.cancelPayment(reference);
      console.log('handlePaystackCancel: Cancellation response:', response.data);
      
      if (response.data?.status === 'success') {
        const { order_id, payment_id, status } = response.data.data;
        
        // Payment cancelled successfully - you might want to show a message or redirect
        handlePaymentCancel();
        console.log('Payment cancelled successfully', { order_id, payment_id, status });
      } else {
        console.log('handlePaystackCancel: Cancellation failed', response.data);
        throw new Error(response.data?.message || 'Failed to cancel payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to cancel payment';
      console.log('handlePaystackCancel: Error occurred:', message, err);
      setError(new Error(message));
      console.error('Payment cancellation error:', message);
    } finally {
      setIsProcessing(false);
      console.log('handlePaystackCancel: Process completed');
    }
  }

  const handlePaymentSuccess = async () => {
    showSuccessToast('Payment completed successfully!');
    await paymentStore.getState().clearCache();
    await cartStore.getState().clearCartCache();
    await storeStore.getState().clearCache();
    await orderStore.getState().clearOrdersCache();
    router.dismissAll();
    router.push('/(home)/home');
    router.push('/(home)/orders');
  }

  const handlePaymentCancel = async () => {
    showErrorToast('Payment was cancelled');
    await paymentStore.getState().clearCache();
    await cartStore.getState().clearCartCache();
    await storeStore.getState().clearCache();
    await orderStore.getState().clearOrdersCache();
    router.dismissAll();
    router.push('/(home)/home');
    router.push('/(home)/store');
    router.push('/(home)/cart');
  }

  return {
    // Data
    isProcessing,
    pickupStations: paymentStore.getState().pickupStations,
    cartTotal,
    selectedPickupStationId: selectedPickupStationId,
    isLoadingCartTotal,

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
