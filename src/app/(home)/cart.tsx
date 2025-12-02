import React, { useState, useCallback, useRef } from "react";
import { CartUI } from "@/src/screens/Home/Store/Cart/Cart";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { CartItem, cartItemsData } from "@/src/constants/data";

export default function CartPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Cart state management
  const [cartItems, setCartItems] = useState<CartItem[]>(cartItemsData);

  // Cart operations
  const increaseQuantity = useCallback((itemId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((itemId: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const getTotalAmount = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleCheckout = () => {
    router.push('/payment');
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
      />
    </AuthPageWrapper>
  );
}