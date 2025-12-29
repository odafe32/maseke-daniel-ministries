import React, { useState, useRef, useEffect } from "react";
import { StoreUI } from "@/src/screens/Home/Store/Store";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { showSuccessToast, showInfoToast } from "@/src/utils/toast";
import { Animated, Dimensions, ScrollView } from "react-native";
import { useStore } from "@/src/hooks/store/useStore";
import { StoreProduct } from '@/src/utils/types';

export default function StorePage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Use the real store hook for products
  const {
    products: storeProducts,
    pagination,
    currentFilters,
    setCurrentFilters,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
    applyFilters,
    loadingWishlists,
    loadingCart,
    handleWishlistAction,
    handleCartAction,
    cartCount,
  } = useStore();

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<ScrollView | null>(null);

  // Get screen width for carousel calculations
  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 32; // 16px padding on each side
  const actualCarouselWidth = screenWidth - containerPadding;

  // Carousel data
  const carouselData = [
    {
      id: 1,
      image: require("@/src/assets/images/store2.jpg"),
      text: "Get all your items"
    },
    {
      id: 2,
      image: require("@/src/assets/images/store2.jpg"),
      text: "Discover amazing products"
    },
    {
      id: 3,
      image: require("@/src/assets/images/store2.jpg"),
      text: "Shop with confidence"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % carouselData.length;
        carouselRef.current?.scrollTo({ x: nextSlide * actualCarouselWidth, animated: true });
        return nextSlide;
      });
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [carouselData.length]);

  // Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    carouselRef.current?.scrollTo({ x: index * actualCarouselWidth, animated: true });
  };

  // State management
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Product modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Constants
  const filterOptions = [
    { label: "All Items", value: "all" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
  ];

  const totalPages = pagination.last_page;

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = async (value: string) => {
    await applyFilters({
      sort_by: value,
      page: 1,
    });

  };

  // Handle pagination
  const handlePageChange = async (newPage: number) => {
    await applyFilters({
      page: newPage
    });
  };

  const toggleWishlist = async (productId: string) => {
    // Find the product to determine current wishlist state
    const product = storeProducts.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    // Determine action based on current wishlist state
    const action = product.isInWishlist ? 'remove' : 'add';

    try {
      // Call the hook to handle the API call
      const result = await handleWishlistAction(productId, action);

      if (result.success) {
        // Show appropriate toast message
        if (action === 'add') {
          showSuccessToast("Added to wishlist", "Product has been added to your wishlist");
        } else {
          showInfoToast("Removed from wishlist", "Product has been removed from your wishlist");
        }

        // Refresh products to get updated wishlist state
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

  const handleCartPress = () => {
    console.log('Cart pressed');
  };

  // Handle search when search button is pressed
  const handleSearchPress = async () => {
    await applyFilters({
      search: searchQuery,
      page: 1,
    });
  };

  // Product modal handlers
  const openProductModal = (product: StoreProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setModalVisible(true);

    // Animate modal opening
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeProductModal = () => {
    // Animate modal closing
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedProduct(null);
    });
  };

  const increaseQuantity = () => {
    if (selectedProduct) {
      setQuantity(prev => Math.min(prev + 1, selectedProduct.stockCount)); // Max is stock count
    }
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  const addToCart = async () => {
    if (selectedProduct) {
      try {
        // Call the cart action from the hook
        const result = await handleCartAction(selectedProduct.id, quantity);

        if (result.success) {
          // Show success toast and close modal
          showSuccessToast("Added to cart", "Product added successfully");
          closeProductModal();
        } else {
          // Handle error - show error toast
          showInfoToast("Error", result.error || "Failed to add to cart");
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        showInfoToast("Error", "An unexpected error occurred");
      }
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
      <StoreUI
        onBack={handleBack}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchPress={handleSearchPress}
        currentPage={currentFilters.page ?? 1}
        handlePageChange={handlePageChange}
        filterValue={currentFilters.sort_by ?? "all"}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        isLoading={isLoading}
        loadingWishlists={loadingWishlists}
        loadingCart={loadingCart}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        filterOptions={filterOptions}
        paginatedProducts={storeProducts}
        totalPages={totalPages}
        handleFilterChange={handleFilterChange}
        toggleWishlist={toggleWishlist}
        handleCartPress={handleCartPress}
        modalVisible={modalVisible}
        selectedProduct={selectedProduct}
        quantity={quantity}
        cartCount={cartCount}
        openProductModal={openProductModal}
        closeProductModal={closeProductModal}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        addToCart={addToCart}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        carouselRef={carouselRef}
        carouselData={carouselData}
        goToSlide={goToSlide}
        actualCarouselWidth={actualCarouselWidth}
      />
    </AuthPageWrapper>
  );
}