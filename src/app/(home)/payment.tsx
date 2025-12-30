import React, { useRef, useState } from "react";
import { PaymentUI } from "@/src/screens/Home/Store/Payment/Payment";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { usePayment } from "@/src/hooks/store/usePayment";
import { showInfoToast } from "@/src/utils/toast";
import { PaystackProvider } from 'react-native-paystack-webview';
import Constants from 'expo-constants';

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
        publicKey={Constants.expoConfig?.extra?.paystackPublicKey}
      >
        <PaymentPageContent onBack={handleBack} />
      </PaystackProvider>
    </AuthPageWrapper>
  );
}

function PaymentPageContent({ onBack }: { onBack: () => void }) {
  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

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
    fetchPickupStations,
    fetchCartTotal,
  } = usePayment();

  const handlePayNow = async () => {
    if (!selectedPickupStationId) {
      showInfoToast('Select Pickup Station', 'Please select a pickup station to proceed.');
      return;
    }
    await makePayment();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPickupStations(),
        fetchCartTotal(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PaymentUI
      pickupStations={pickupStations}
      selectedPickupStationId={selectedPickupStationId}
      onSelectPickupStation={selectPickupStation}
      totalCartAmount={cartTotal}
      onBack={onBack}
      onPayNow={handlePayNow}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      isProcessing={isProcessing}
      isLoadingStations={loading}
      isLoadingCartTotal={isLoadingCartTotal}
    />
  );
}