import { useState } from 'react';
import { prayerRequestApi, PrayerRequestData } from '../api/prayerRequestApi';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const usePrayerRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      message: '',
    };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
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

  const submitPrayerRequest = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data: PrayerRequestData = {
        email: email.trim(),
        message: message.trim(),
      };

      const response = await prayerRequestApi.submitPrayerRequest(data);

      if (response.success) {
        showSuccessToast('Success', 'Your prayer request has been submitted successfully');
        // Clear form
        setEmail('');
        setMessage('');
        setErrors({ email: '', message: '' });
      } else {
        showErrorToast('Error', response.message || 'Failed to submit prayer request');
      }
    } catch (error: any) {
      console.error('Prayer request submission error:', error);

      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors;
        setErrors({
          email: backendErrors.email?.[0] || '',
          message: backendErrors.message?.[0] || '',
        });
      } else {
        showErrorToast('Error', error.response?.data?.message || 'Failed to submit prayer request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    clearError('email');
  };

  const handleMessageChange = (text: string) => {
    setMessage(text);
    clearError('message');
  };

  return {
    email,
    message,
    isSubmitting,
    errors,
    handleEmailChange,
    handleMessageChange,
    submitPrayerRequest,
  };
};
