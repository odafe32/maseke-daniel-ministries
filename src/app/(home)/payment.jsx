import React, { useCallback, useRef, useState } from "react";
import { PaymentUI } from "@/src/screens/Home/Store/Payment/Payment";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { cartItemsData } from "@/src/constants/data";
import Toast from 'react-native-toast-message';

export default function PaymentPage() {
  const router = useRouter();
  const wrapperRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total amount from cart items
  const getTotalAmount = useCallback(() => {
    return cartItemsData.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, []);

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    
    // Show processing toast
    Toast.show({
      type: 'info',
      text1: 'Processing Payment',
      text2: 'Please wait while we process your payment ...',
      position: 'top',
    });
    
    // Simulate payment processing for 5 seconds
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Payment Successful',
        text2: 'Your payment has been processed successfully!',
      position: 'top',
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        handlePaymentSuccess();
      }, 1500);
    }, 5000);
  };

  const handlePaymentSuccess = () => {
    // Navigate back to store or to a success page
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <PaymentUI
        totalAmount={getTotalAmount()}
        onBack={handleBack}
        onPayNow={handlePayNow}
        isProcessing={isProcessing}
      />
    </AuthPageWrapper>
  );
}