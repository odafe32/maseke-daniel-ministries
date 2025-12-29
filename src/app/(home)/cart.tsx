import React, { useState, useRef } from "react";
import { CartUI } from "@/src/screens/Home/Store/Cart/Cart";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { showInfoToast } from "@/src/utils/toast";
import { useCart } from "@/src/hooks/store/useCart";

export default function CartPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Use cart hook
  const {
    cartItems,
    isLoading,
    updatingItemId,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getTotalAmount,
    refresh,
  } = useCart();

  // State for checkout loading
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showInfoToast("Cart Empty", "Your cart is empty. Add some items first.");
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // TODO: Implement actual checkout logic
      // For now, navigate to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Checkout error:', error);
      showInfoToast("Checkout Failed", "Failed to process your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <CartUI
        cartItems={cartItems}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        getTotalAmount={getTotalAmount}
        onBack={handleBack}
        onCheckout={handleCheckout}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        updatingItemId={updatingItemId}
        isCheckingOut={isCheckingOut}
      />
    </AuthPageWrapper>
  );
}