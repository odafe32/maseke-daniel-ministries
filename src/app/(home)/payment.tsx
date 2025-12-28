import React, { useRef, useState } from "react";
import { PaymentUI } from "@/src/screens/Home/Store/Payment/Payment";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { usePayment } from "@/src/hooks/store/usePayment";
import { showInfoToast } from "@/src/utils/toast";
import { PaystackProvider } from 'react-native-paystack-webview';

export default function PaymentPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <PaystackProvider
        publicKey="pk_test_c37160decf98d151a7ef957d11c7567374e6ba62"
      >
        <PaymentPageContent onBack={handleBack} />
      </PaystackProvider>
    </AuthPageWrapper>
  );
}

function PaymentPageContent({ onBack }: { onBack: () => void }) {
  // Payment data hook
  const {
    isProcessing,
    pickupStations,
    cartTotal,
    selectedPickupStationId,
    loading,
    isLoadingCartTotal,
    selectPickupStation,
    makePayment,
  } = usePayment();

  const handlePayNow = async () => {
    if (!selectedPickupStationId) {
      showInfoToast('Select Pickup Station', 'Please select a pickup station to proceed.');
      return;
    }
    await makePayment();
  };

  return (
    <PaymentUI
      pickupStations={pickupStations}
      selectedPickupStationId={selectedPickupStationId}
      onSelectPickupStation={selectPickupStation}
      totalCartAmount={cartTotal}
      onBack={onBack}
      onPayNow={handlePayNow}
      isProcessing={isProcessing}
      isLoadingStations={loading}
      isLoadingCartTotal={isLoadingCartTotal}
    />
  );
}