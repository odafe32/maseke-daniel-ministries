import { useState } from 'react';
import { prayerRequestApi, PrayerRequestData } from '../api/prayerRequestApi';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const usePrayerRequest = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

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
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      };

      const response = await prayerRequestApi.submitPrayerRequest(data);

      if (response.success) {
        showSuccessToast('Success', 'Your prayer request has been submitted successfully');
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
        setErrors({ name: '', email: '', message: '' });
      } else {
        showErrorToast('Error', response.message || 'Failed to submit prayer request');
      }
    } catch (error: unknown) {
      console.error('Prayer request submission error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        
        if (axiosError.response?.data?.errors) {
          // Handle validation errors from backend
          const backendErrors = axiosError.response.data.errors;
          setErrors({
            name: backendErrors.name?.[0] || '',
            email: backendErrors.email?.[0] || '',
            message: backendErrors.message?.[0] || '',
          });
        } else {
          showErrorToast('Error', axiosError.response?.data?.message || 'Failed to submit prayer request');
        }
      } else {
        showErrorToast('Error', 'Failed to submit prayer request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    clearError('name');
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
    name,
    email,
    message,
    isSubmitting,
    errors,
    handleNameChange,
    handleEmailChange,
    handleMessageChange,
    submitPrayerRequest,
  };
};
