import React, { useState, useRef, useMemo, useEffect } from "react";
import { StoreUI } from "@/src/screens/Home/Store/Store";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { StoreProduct, storeProducts } from "@/src/constants/data";
import { showSuccessToast, showInfoToast } from "@/src/utils/toast";
import { Animated } from "react-native";

export default function StorePage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [products, setProducts] = useState<StoreProduct[]>(storeProducts);
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Product modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(2); // Simple cart state
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Constants
  const itemsPerPage = 20;
  const filterOptions = [
    { label: "All Items", value: "all" },
    { label: "Price: Low to High", value: "price_low_high" },
    { label: "Price: High to Low", value: "price_high_low" },
  ];

  // Simulate initial page loading for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery, products]);

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (value === "all") {
      setSelectedCategory("All");
    } else if (value === "price_low_high" || value === "price_high_low") {
      // TODO: Implement price sorting functionality
    } else {
      setSelectedCategory(value);
    }

    setCurrentPage(1);
  };

  const toggleWishlist = async (productId: string) => {
    // Add to loading state
    setLoadingProducts(prev => new Set(prev).add(productId));
    
    // Simulate API call delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update product state
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === productId) {
          const newWishlistState = !product.isInWishlist;
          
          // Show appropriate toast message
          if (newWishlistState) {
            showSuccessToast("Added to wishlist", "Product has been added to your wishlist");
          } else {
            showInfoToast("Removed from wishlist", "Product has been removed from your wishlist");
          }
          
          return { ...product, isInWishlist: newWishlistState };
        }
        return product;
      });
      return updatedProducts;
    });
    
    // Remove from loading state
    setLoadingProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
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
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  const addToCart = () => {
    if (selectedProduct) {
      showSuccessToast("Added to cart", `${selectedProduct.title} (${quantity}x) added to cart`);
      setCartCount(prev => prev + quantity); // Add quantity to cart count
      closeProductModal();
    }
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <StoreUI
        onBack={handleBack}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterValue={filterValue}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        loadingProducts={loadingProducts}
        isInitialLoading={isInitialLoading}
        filterOptions={filterOptions}
        paginatedProducts={paginatedProducts}
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
      />
    </AuthPageWrapper>
  );
}