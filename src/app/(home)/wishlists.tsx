import React, { useState } from "react";
import { Wishlist } from "@/src/screens";
import { useRouter } from "expo-router";
import { wishListData } from "@/src/constants/data";

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
    <Wishlist
      wishListData={wishListData}
      onBack={handleBack}
      loading={loading}
    />
  );
}