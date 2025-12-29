import { useState, useRef } from 'react';
import { usePaystack } from 'react-native-paystack-webview';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { givingApi } from '../api/givingApi';

export interface GiveFormData {
  giftType: string;
  amount: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export const useGive = () => {
  const [giftType, setGiftType] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [errors, setErrors] = useState({
    giftType: '',
    amount: '',
  });

  const paymentDetails = useRef({
    reference: '',
    amount: 0,
    email: '',
  });

  const { popup } = usePaystack();

  const giftTypeOptions = [
    { label: 'Donation', value: 'donation' },
    { label: 'Offering', value: 'offering' },
    { label: 'Tithe', value: 'tithe' },
    { label: 'Gift', value: 'gift' },
  ];

  const validateForm = () => {
    const newErrors = {
      giftType: '',
      amount: '',
    };
    let isValid = true;

    if (!giftType.trim()) {
      newErrors.giftType = 'Please select a gift type';
      isValid = false;
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
      isValid = false;
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const submitGive = async () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    console.log('submitGive: Starting payment initialization');
    try {
      setIsSubmitting(true);

      console.log('submitGive: Calling initializePayment API', { amount: Number(amount), type: giftType });
      const response = await givingApi.initializePayment(Number(amount), giftType);
      console.log('submitGive: API response:', response.data);

      if (response.data?.status === 'success') {
        const { authorization_url, access_code, reference, amount: amount, email } = response.data.data;
        console.log('submitGive: Payment initialized successfully', { authorization_url, access_code, reference, amount: amount, email });

        paymentDetails.current = {
          reference,
          amount: amount,
          email,
        };

        console.log('submitGive: Initializing Paystack checkout');
        await initializePaystack(access_code, reference, amount, email);
      } else {
        console.log('submitGive: Payment initialization failed', response.data);
        throw new Error(response.data?.message || 'Failed to initialize payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to initialize payment';
      console.log('submitGive: Error occurred:', message, err);
      showErrorToast('Payment Failed', message);
    } finally {
      setIsSubmitting(false);
      console.log('submitGive: Process completed');
    }
  };

  const initializePaystack = async (access_code: string, reference: string, amount: number, email: string) => {
    console.log('initializePaystack: Starting Paystack checkout', { access_code, reference, amount, email });
    popup.checkout({
      email: email,
      amount: Number(amount), // Amount already in kobo from backend
      reference: reference,
      // currency: "NGN",
      metadata: {
        custom_fields: [
          {
            display_name: "Gift Type",
            variable_name: "gift_type",
            value: giftType,
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
      setIsSubmitting(true);

      console.log('handlePaystackSuccess: Verifying payment with reference:', paymentDetails.current.reference);
      const response = await givingApi.verifyPayment(paymentDetails.current.reference);
      console.log('handlePaystackSuccess: Verification response:', response.data);

      if (response.data?.status === 'success') {
        const { giving_id, status, amount, type, reference } = response.data.data;

        console.log('Payment verified successfully', { giving_id, status, amount, type, reference });

        setShowPaystack(false);

        // Show success message
        showSuccessToast('Payment Successful', `Your ${type.charAt(0).toUpperCase() + type.slice(1)} has been received`);

        // Clear form
        setGiftType('');
        setAmount('');
        setErrors({ giftType: '', amount: '' });
      } else {
        console.log('handlePaystackSuccess: Verification failed', response.data);
        throw new Error(response.data?.message || 'Payment verification failed');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Payment verification failed';
      console.log('handlePaystackSuccess: Error occurred:', message, err);
      showErrorToast('Verification Failed', message);
    } finally {
      setIsSubmitting(false);
      console.log('handlePaystackSuccess: Process completed');
    }
  };

  const handlePaystackCancel = async (reference: string) => {
    console.log('handlePaystackCancel: Starting payment cancellation for reference:', reference);
    try {
      setIsSubmitting(true);

      console.log('handlePaystackCancel: Calling cancelPayment API');
      const response = await givingApi.cancelPayment(reference);
      console.log('handlePaystackCancel: Cancellation response:', response.data);

      if (response.data?.status === 'success') {
        const { giving_id, status, reference: cancelledRef } = response.data.data;

        console.log('Payment cancelled successfully', { giving_id, status, reference: cancelledRef });

        setShowPaystack(false);
        showErrorToast('Payment Cancelled', 'You have cancelled the payment');
      } else {
        console.log('handlePaystackCancel: Cancellation failed', response.data);
        throw new Error(response.data?.message || 'Failed to cancel payment');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message = apiErr?.response?.data?.message || apiErr?.response?.data?.error || 'Failed to cancel payment';
      console.log('handlePaystackCancel: Error occurred:', message, err);
      showErrorToast('Cancellation Failed', message);
    } finally {
      setIsSubmitting(false);
      console.log('handlePaystackCancel: Process completed');
    }
  };

  const handleGiftTypeChange = (value: string) => {
    setGiftType(value);
    clearError('giftType');
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setAmount(numericText);
    clearError('amount');
  };

  return {
    giftType,
    amount,
    isSubmitting,
    errors,
    giftTypeOptions,
    showPaystack,
    handleGiftTypeChange,
    handleAmountChange,
    submitGive,
  };
};
