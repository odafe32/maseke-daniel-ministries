import { useState } from 'react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export interface GiveFormData {
  giftType: string;
  amount: string;
}

export const useGive = () => {
  const [giftType, setGiftType] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    giftType: '',
    amount: '',
  });

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

  const submitGive = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      showSuccessToast('Payment Successful', 'Your gift has been processed successfully');
      
      // Clear form
      setGiftType('');
      setAmount('');
      setErrors({ giftType: '', amount: '' });
      
    } catch (error: any) {
      console.error('Give submission error:', error);
      showErrorToast('Payment Failed', 'An error occurred while processing your payment');
    } finally {
      setIsSubmitting(false);
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
    handleGiftTypeChange,
    handleAmountChange,
    submitGive,
  };
};
