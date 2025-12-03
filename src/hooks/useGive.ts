import { useState, useCallback } from 'react';
import { usePaystack } from 'react-native-paystack-webview';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export interface GiveFormData {
  giftType: string;
  amount: string;
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
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (Number(amount) < 1) {
      newErrors.amount = 'Minimum amount is 1';
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

  const handlePayment = useCallback(() => {
    popup.checkout({
      email: "user@example.com", // Replace with user email or get from user data
      amount: Number(amount) * 100, // Paystack expects amount in kobo (cents)
      reference: `TXN_${Date.now()}`, // Unique transaction reference
    //   currency: "NGN",
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
        handlePaystackSuccess();
      },
      onCancel: () => {
        handlePaystackCancel();
      },
      onError: () => {
        handlePaystackCancel();
      },
    });
  }, [amount, giftType, popup]);

  const submitGive = async () => {
    if (!validateForm()) {
      return;
    }

    setShowPaystack(true);
  };

  const handlePaystackSuccess = () => {
    setShowPaystack(false);
    setIsSubmitting(false);
    
    // Show success message
    showSuccessToast('Payment Successful', 'Your gift has been processed successfully');
    
    // Clear form
    setGiftType('');
    setAmount('');
    setErrors({ giftType: '', amount: '' });
  };

  const handlePaystackCancel = () => {
    setShowPaystack(false);
    setIsSubmitting(false);
    showErrorToast('Payment Cancelled', 'You have cancelled the payment');
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
    handlePaystackSuccess,
    handlePaystackCancel,
    handlePayment,
  };
};
