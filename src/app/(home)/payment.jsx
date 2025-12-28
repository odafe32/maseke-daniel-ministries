import React, { useRef, useState } from "react";
import { PaymentUI } from "@/src/screens/Home/Store/Payment/Payment";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { usePayment } from "@/src/hooks/store/usePayment";
import { showInfoToast } from "@/src/utils/toast";
import { PaystackProvider } from 'react-native-paystack-webview';

export default function PaymentPage() {
  const router = useRouter();
  const wrapperRef = useRef(null);

  // Payment data hook
  const {
    isProcessing,
    pickupStations,
    cartTotal,
    selectedPickupStationId,
    loading,
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

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <PaystackProvider
        publicKey="pk_test_c37160decf98d151a7ef957d11c7567374e6ba62"
      >
        <PaymentUI
          pickupStations={pickupStations}
          selectedPickupStationId={selectedPickupStationId}
          onSelectPickupStation={selectPickupStation}
          totalCartAmount={cartTotal}
          onBack={handleBack}
          onPayNow={handlePayNow}
          isProcessing={isProcessing}
          isLoadingStations={loading}
        />
      </PaystackProvider>
    </AuthPageWrapper>
  );
}