import React, { useState, useRef } from "react";
import { Animated } from "react-native";
import { Orders } from "@/src/screens/Home/Profile/Orders/Orders";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { showInfoToast } from "@/src/utils/toast";
import { useOrders } from "@/src/hooks/useOrders";
import { Order, OrderStatus } from "@/src/constants/data";

export default function OrdersPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Use orders hook
  const {
    orders,
    filteredOrders,
    isLoading,
    isRefreshing,
    error,
    activeFilter,
    refresh,
    setActiveFilter,
    getOrderById,
    formatDate,
    getDisplayDate,
    getOrderNumber,
    getProductImage,
    getProductTitle,
  } = useOrders();

  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Animation values
  const [slideAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(1));

  // Event handlers
  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = (filter: 'all' | 'ongoing' | 'past') => {
    setActiveFilter(filter);
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    // Start closing animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedOrder(null);
    });
  };

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Orders
        onBack={handleBack}
        ordersData={orders}
        filteredOrders={filteredOrders}
        loading={isLoading}
        activeFilter={activeFilter}
        modalVisible={modalVisible}
        selectedOrder={selectedOrder}
        slideAnim={slideAnim}
        fadeAnim={fadeAnim}
        onFilterChange={handleFilterChange}
        onOrderPress={handleOrderPress}
        onCloseModal={handleCloseModal}
        formatDate={formatDate}
        getDisplayDate={getDisplayDate}
        getOrderNumber={getOrderNumber}
        getProductImage={getProductImage}
        getProductTitle={getProductTitle}
        isRefreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </AuthPageWrapper>
  );
}