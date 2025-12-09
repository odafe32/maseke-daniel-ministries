import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { PrayerRequest } from "@/src/screens/Home/Profile/PrayerRequest";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";
import { usePrayerRequest } from "@/src/hooks/usePrayerRequest";

export default function PrayerRequestPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const { 
    name,
    email,
    message, 
    errors,
    isSubmitting, 
    handleNameChange,
    handleEmailChange,
    handleMessageChange,
    submitPrayerRequest 
  } = usePrayerRequest();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    // Navigate back
    router.back();
  };

  const handleBack = () => {
    // Navigate back
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  if (loading) {
    return (
      <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={180} height={28} style={{ marginBottom: 30, marginTop: 20 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={120} style={{ marginBottom: 20 }} />
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
        name={name}
        email={email}
        message={message}
        onNameChange={handleNameChange}
        onEmailChange={handleEmailChange}
        onMessageChange={handleMessageChange}
        onSubmit={submitPrayerRequest}
        onCancel={handleCancel}
        nameError={errors.name}
        emailError={errors.email}
        messageError={errors.message}
        isLoading={isSubmitting}
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