import React, { useState } from "react";
import { Wishlist } from "@/src/screens";
import { useRouter } from "expo-router";
import { wishListData } from "@/src/constants/data";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthPageWrapper>
      <Wishlist
        wishListData={wishListData}
        onBack={handleBack}
        loading={loading}
      />
    </AuthPageWrapper>
  );
}