import { useState } from 'react';
import helpApi from '../api/helpApi';
import { showSuccessToast } from '../utils/toast';

export const useHelp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      message: "",
    };

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!message.trim()) {
      newErrors.message = "Message is required.";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const submitFeedback = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await helpApi.submitFeedback({
        full_name: fullName.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      showSuccessToast('Success', 'Thank you for your feedback! We will get back to you soon.');
      setFullName("");
      setEmail("");
      setMessage("");
      setErrors({ fullName: "", email: "", message: "" });
    } catch (error: any) {
      console.error('Feedback submission failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit feedback. Please try again.';
      showSuccessToast('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullNameChange = (text: string) => {
    setFullName(text);
    clearError('fullName');
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
    // State
    fullName,
    email,
    message,
    isSubmitting,
    errors,

    // Handlers
    handleFullNameChange,
    handleEmailChange,
    handleMessageChange,
    submitFeedback,

    // Direct setters (if needed)
    setFullName,
    setEmail,
    setMessage,
  };
};
