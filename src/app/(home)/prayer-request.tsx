import React, { useState, useRef, useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { PrayerRequest } from "@/src/screens/Home/Profile/PrayerRequest";
import Toast from 'react-native-toast-message';
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";

export default function PrayerRequestPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [titleError, setTitleError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
    wrapperRef.current?.reverseAnimate(() => router.back());
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

  if (loading) {
    return (
      <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={180} height={28} style={{ marginBottom: 30, marginTop: 20 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} style={{ marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton width="48%" height={48} style={{ borderRadius: 8 }} />
            <Skeleton width="48%" height={48} style={{ borderRadius: 8 }} />
          </View>
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
});