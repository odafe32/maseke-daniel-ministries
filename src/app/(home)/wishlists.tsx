import React, { useRef, useState } from "react";
import { Wishlist } from "@/src/screens";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useWishlist } from "@/src/hooks/useWishlist";
import { showSuccessToast, showInfoToast } from "@/src/utils/toast";

export default function WishlistPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Use the real wishlist hook
  const {
    wishlistItems,
    isLoading,
    error,
    refresh,
    loadingWishlists,
    handleWishlistAction,
  } = useWishlist();

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const toggleWishlist = async (productId: string) => {
    try {
      // Call the hook to handle the API call (always remove since these are wishlist items)
      const result = await handleWishlistAction(productId, 'remove');

      if (result.success) {
        // Show toast message
        showInfoToast("Removed from wishlist", "Product has been removed from your wishlist");

        // Refresh wishlist to get updated data
        await refresh();
      } else {
        // Handle error - show error toast
        showInfoToast("Error", result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showInfoToast("Error", "An unexpected error occurred");
    }
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Wishlist
        wishListData={wishlistItems}
        onBack={handleBack}
        loading={isLoading}
        loadingWishlists={loadingWishlists}
        toggleWishlist={toggleWishlist}
        isRefreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </AuthPageWrapper>
  );
}