import React, { useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { PrayerRequest } from "@/src/screens/Home/Profile/PrayerRequest";
import Toast from 'react-native-toast-message';
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function PrayerRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [titleError, setTitleError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showSuccessToast = () => {
    Toast.show({
      type: 'success',
      text1: "Success",
      text2: "Your prayer request has been submitted successfully!",
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  const handlePrayerRequest = async () => {
    let hasError = false;
    
    // Validate title
    if (!title.trim()) {
      setTitleError("Please enter a title for your prayer request");
      hasError = true;
    } else {
      setTitleError("");
    }
    
    // Validate message
    if (!message.trim()) {
      setMessageError("Please enter your prayer request");
      hasError = true;
    } else {
      setMessageError("");
    }
    
    // If there are errors, don't submit
    if (hasError) {
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success toast
      showSuccessToast();
      
      // Clear form and errors
      setTitle("");
      setMessage("");
      setTitleError("");
      setMessageError("");
    } catch (error) {
      // Handle error (show error toast)
      Toast.show({
        type: 'error',
        text1: "Error",
        text2: "Failed to submit prayer request. Please try again.",
        position: 'bottom',
        visibilityTime: 4000,
      });
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Clear form and errors
    setTitle("");
    setMessage("");
    setTitleError("");
    setMessageError("");
    
    // Navigate back
    router.back();
  };

  const handleBack = () => {
    // Clear form and errors and navigate back
    setTitle("");
    setMessage("");
    setTitleError("");
    setMessageError("");
    router.back();
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    // Clear error when user starts typing
    if (titleError) {
      setTitleError("");
    }
  };

  const handleMessageChange = (text: string) => {
    setMessage(text);
    // Clear error when user starts typing
    if (messageError) {
      setMessageError("");
    }
  };

  return (
    <AuthPageWrapper>
      <PrayerRequest
        onBack={handleBack}
        title={title}
        message={message}
        onTitleChange={handleTitleChange}
        onMessageChange={handleMessageChange}
        onSubmit={handlePrayerRequest}
        onCancel={handleCancel}
        titleError={titleError}
        messageError={messageError}
        isLoading={isLoading}
      />
    </AuthPageWrapper>
  );
}