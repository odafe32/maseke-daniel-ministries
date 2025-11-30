import React, { useState, useRef } from "react";
import { Wishlist } from "@/src/screens";
import { useRouter } from "expo-router";
import { wishListData } from "@/src/constants/data";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";

export default function WishlistPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  return (
<AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Wishlist
        wishListData={wishListData}
        onBack={handleBack}
        loading={loading}
      />
    </AuthPageWrapper>
  );
}