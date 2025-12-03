import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { Give } from "@/src/screens/Home/Give";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";
import { useGive } from "@/src/hooks/useGive";
import { PaystackProvider } from 'react-native-paystack-webview';

export default function GivePage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
          <Skeleton width="100%" height={50} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={48} style={{ borderRadius: 8 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <PaystackProvider
        publicKey="pk_test_c37160decf98d151a7ef957d11c7567374e6ba62"
      >
        <GivePageContent onBack={handleBack} />
      </PaystackProvider>
    </AuthPageWrapper>
  );
}

function GivePageContent({ onBack }: { onBack: () => void }) {
  const { 
    giftType,
    amount,
    errors,
    isSubmitting, 
    giftTypeOptions,
    showPaystack,
    handleGiftTypeChange,
    handleAmountChange,
    submitGive,
    handlePayment,
  } = useGive();

  return (
    <Give
        onBack={onBack}
        giftType={giftType}
        amount={amount}
        onGiftTypeChange={handleGiftTypeChange}
        onAmountChange={handleAmountChange}
        onSubmit={submitGive}
        giftTypeOptions={giftTypeOptions}
        giftTypeError={errors.giftType}
        amountError={errors.amount}
        isLoading={isSubmitting}
        showPaystack={showPaystack}
        onPayment={handlePayment}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
});