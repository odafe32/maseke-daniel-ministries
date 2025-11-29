import React, { useState, useRef, useEffect } from "react";
import { Orders } from "@/src/screens/Home/Profile/Orders";
import { useRouter } from "expo-router";
import { Animated } from "react-native";
import { ordersData, Order, OrderStatus } from "@/src/constants/data";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";

export default function OrdersPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  const handleFilterChange = (filter: 'all' | OrderStatus) => {
    setActiveFilter(filter);
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    
    // Start animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    // Reverse animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedOrder(null);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getDisplayDate = (order: Order) => {
    const date = formatDate(order.date);
    return activeFilter === 'all' 
      ? `${(order.status === 'available for pickup' || order.status === 'processing') ? 'Ongoing' : 'Past'}. ${date}`
      : date;
  };

  const filteredOrders = activeFilter === 'all' 
    ? ordersData 
    : activeFilter === 'processing' 
      ? ordersData.filter(order => order.status === 'available for pickup' || order.status === 'processing')
      : ordersData.filter(order => order.status === 'completed' || order.status === 'cancelled');

  return (
<AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Orders 
        onBack={handleBack}
        ordersData={ordersData}
        filteredOrders={filteredOrders}
        loading={loading}
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
      />
    </AuthPageWrapper>
  );
}