import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  RefreshControl,
  ImageSourcePropType,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { BackHeader, ThemeText } from "@/src/components";
import { fs, hp, wp } from "@/src/utils";
import { Order, OrderStatus, OrderItem } from "@/src/constants/data";

interface OrdersProps {
  onBack: () => void;
  ordersData: Order[];
  filteredOrders: Order[];
  loading: boolean;
  activeFilter: 'all' | 'ongoing' | 'past';
  modalVisible: boolean;
  selectedOrder: Order | null;
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
  onFilterChange: (filter: 'all' | 'ongoing' | 'past') => void;
  onOrderPress: (order: Order) => void;
  onCloseModal: () => void;
  formatDate: (dateString: string) => string;
  getDisplayDate: (order: Order) => string;
  getOrderNumber: (order: Order) => string;
  getProductImage: (item: OrderItem) => ImageSourcePropType;
  getProductTitle: (item: OrderItem) => string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

interface AnimatedOrderCardProps {
  item: Order;
  index: number;
}

export function Orders({
  onBack,
  ordersData,
  filteredOrders,
  loading,
  activeFilter,
  modalVisible,
  selectedOrder,
  slideAnim,
  fadeAnim,
  onFilterChange,
  onOrderPress,
  onCloseModal,
  formatDate,
  getDisplayDate,
  getOrderNumber,
  getProductImage,
  getProductTitle,
  isRefreshing = false,
  onRefresh,
}: OrdersProps) {
  // Animation values for page entrance
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;

  // Trigger animations on mount
  useEffect(() => {
    Animated.parallel([
      // Header - fade and slide from top
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // Filter section - slide from left
      Animated.spring(filterAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Skeleton pulse animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'ready_for_pickup':
        return '#FFECBA'; // yellow
      case 'processing':
        return '#E1E1E1'; // gray
      case 'cancelled':
        return '#FFC7C3'; // pink
      case 'completed':
        return '#C4E6D3'; // green
      case 'paid':
        return '#C4E6D3'; // green (same as completed)
      case 'shipped':
        return '#C4E6D3'; // green (same as completed)
      case 'pending':
        return '#E1E1E1'; // gray (same as processing)
      case 'refunded':
        return '#FFC7C3'; // pink (same as cancelled)
      default:
        return '#E5E7EB'; // light gray for any other status
    }
  };

  const getStatusTextColor = (status: OrderStatus) => {
    switch (status) {
      case 'ready_for_pickup':
        return '#8B7500'; // dark yellow
      case 'processing':
      case 'pending':
        return '#434343'; // dark gray
      case 'cancelled':
      case 'refunded':
        return '#6B1F1A'; // dark red
      case 'completed':
      case 'paid':
      case 'shipped':
        return '#235F3E'; // dark green
      default:
        return '#666'; // medium gray
    }
  };

  const AnimatedOrderCard = ({ item, index }: AnimatedOrderCardProps) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200 + (index * 80), // Staggered animation
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
            {
              scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.orderCard}
          activeOpacity={0.8}
          onPress={() => onOrderPress(item)}
        >
          {/* Product Image */}
          <Image
            source={getProductImage(item.items?.[0] || {})}
            style={styles.orderImage}
            resizeMode="cover"
          />

          {/* Order Details */}
          <View style={styles.orderDetails}>
            <View style={styles.orderHeader}>
              <ThemeText variant="body" style={styles.orderNumber} numberOfLines={1}>
                #{item.id}
              </ThemeText>
              <ThemeText variant="body" style={styles.orderPrice}>
                ₦{item.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemeText>
            </View>

            <View style={styles.orderFooter}>
              <ThemeText variant="caption" style={styles.quantityText}>
                Qty: {item.items.reduce((sum, item) => sum + item.quantity, 0)}
              </ThemeText>

              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}>
                <ThemeText
                  variant="caption"
                  style={[
                    styles.statusText,
                    { color: getStatusTextColor(item.status) }
                  ]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </ThemeText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSkeletonOrderCard = (index: number) => (
    <Animated.View
      key={`skeleton-${index}`}
      style={{
        opacity: skeletonPulse,
      }}
    >
      <View style={styles.orderCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.orderDetails}>
          <View style={styles.orderHeader}>
            <View style={[styles.skeletonBar, { width: '60%', height: 16 }]} />
            <View style={[styles.skeletonBar, { width: '30%', height: 16 }]} />
          </View>
          <View style={styles.orderFooter}>
            <View style={[styles.skeletonBar, { width: '20%', height: 12 }]} />
            <View style={[styles.skeletonBar, { width: '40%', height: 20, borderRadius: 10 }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const FilterButton = ({ filter, label }: { filter: 'all' | 'ongoing' | 'past'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        ...(activeFilter === filter ? [styles.activeFilterButton] : [])
      ]}
      onPress={() => onFilterChange(filter)}
      activeOpacity={0.7}
    >
      <ThemeText 
        variant="bodySmall" 
        style={[
          styles.filterButtonText,
          ...(activeFilter === filter ? [styles.activeFilterButtonText] : [])
        ]}
      >
        {label}
      </ThemeText>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.modalOrderItem}>
      <Image 
        source={getProductImage(item)} 
        style={styles.modalItemImage}
        resizeMode="cover"
      />
      <View style={styles.modalItemDetails}>
        <ThemeText variant="body" style={styles.modalItemTitle}>
           {getProductTitle(item)}
        </ThemeText>
        <ThemeText variant="caption" style={styles.modalItemPrice}>
          {(() => {
            const price = (item?.product?.price ?? item?.amount ?? 0);
            return `₦${Number(price).toFixed(2)}`;
          })()}
        </ThemeText>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? (
          <RefreshControl
            refreshing={!!isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0C154C"
            colors={["#0C154C"]}
          />
        ) : undefined}
      >
        {/* Animated Header */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <BackHeader title="My Orders" onBackPress={onBack} />
        </Animated.View>

        {/* Animated Filter Section */}
        <Animated.View
          style={{
            opacity: filterAnim,
            transform: [
              {
                translateY: filterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-15, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <FilterButton filter="all" label="All" />
              <FilterButton filter="ongoing" label="Ongoing Orders" />
              <FilterButton filter="past" label="Past Orders" />
            </View>
          </View>
        </Animated.View>


        {loading ? (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 6 }).map((_, index) => renderSkeletonOrderCard(index))}
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <Feather name="shopping-bag" size={64} color="#D1D5DB" />
            </View>
            <ThemeText variant="h3" style={styles.emptyStateTitle}>
              No Orders Yet
            </ThemeText>
            <ThemeText variant="body" style={styles.emptyStateDescription}>
              {activeFilter === 'all'
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : activeFilter === 'ongoing'
                ? "You don't have any ongoing orders at the moment."
                : "You don't have any past orders yet."}
            </ThemeText>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={({ item, index }) => <AnimatedOrderCard item={item} index={index} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={onCloseModal}
      >
        {/* Backdrop */}
        <Animated.View 
          style={[
            styles.modalBackdrop,
            {
              opacity: fadeAnim
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable} 
            activeOpacity={1} 
            onPress={onCloseModal} 
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={styles.modalTitleIconContainer}>
                <Feather name="shopping-bag" size={20} color="#0C154C" />
              </View>
              <View style={styles.modalTitleTextContainer}>
                <ThemeText variant="h3" style={styles.modalTitle}>
                  Order Details
                </ThemeText>
                <ThemeText variant="caption" style={styles.modalOrderNumber}>
                  {selectedOrder ? getOrderNumber(selectedOrder) : ''}
                </ThemeText>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onCloseModal}
              activeOpacity={0.7}
            >
              <Feather name="x" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Order Items */}
          <View style={styles.modalBody}>
            <FlatList
              data={selectedOrder?.items || []}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              ItemSeparatorComponent={() => <View style={styles.modalItemSeparator} />}
              style={styles.modalItemsList}
            />
            
            {/* Order Summary */}
            <View style={styles.modalFooter}>
              <View style={styles.modalSummaryContainer}>
                <View style={styles.modalSummaryHeader}>
                  <ThemeText variant="h4" style={styles.modalSummaryTitle}>
                    Order Summary
                  </ThemeText>
                </View>
                
                <View style={styles.modalSummaryDetails}>
                  <View style={styles.modalSummaryRow}>
                    <ThemeText variant="body" style={styles.modalSummaryLabel}>
                      Total Amount:
                    </ThemeText>
                    <ThemeText variant="h3" style={styles.modalSummaryValue}>
                      ₦{selectedOrder?.totalAmount.toFixed(2)}
                    </ThemeText>
                  </View>
                  
                  <View style={styles.modalSummaryDivider} />
                  
                  <View style={styles.modalStatusContainer}>
                    <ThemeText variant="caption" style={styles.modalStatusLabel}>
                      Status:
                    </ThemeText>
                    <View style={[
                      styles.modalStatusBadge,
                      { backgroundColor: getStatusColor(selectedOrder?.status || 'processing') }
                    ]}>
                      <ThemeText 
                        variant="bodySmall" 
                        style={[
                          styles.modalStatusText,
                          { color: getStatusTextColor(selectedOrder?.status || 'processing') }
                        ]}
                      >
                        {selectedOrder?.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Unknown'}
                      </ThemeText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 20,
  },
  filterContainer: {
    gap: 8,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  activeFilterButton: {
    backgroundColor: '#E6F0FF',
    borderColor: '#032B6B',
  },
  filterButtonText: {
    color: '#424242',
    fontSize: fs(14),
    fontFamily: 'Geist-SemiBold',
  },
  activeFilterButtonText: {
    color: '#032B6B',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    gap: 12,
  },
  orderImage: {
    width: wp(100),
    height: hp(100),
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderHeader: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  orderNumber: {
    color: '#0B0A0D',
    fontFamily: 'Geist-Medium',
    fontSize: fs(16),
    maxWidth: '70%',
  },
  orderPrice: {
    color: '#0C154C',
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(14),
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityText: {
    color: '#666',
    fontSize: fs(12.5),
    fontFamily: 'Geist-Medium',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: fs(11),
    fontFamily: 'Geist-SemiBold',
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonImage: {
    width:wp(80),
    height: hp(80),
    borderRadius: 8,
    backgroundColor: '#E3E6EB',
  },
  skeletonBar: {
    backgroundColor: '#E3E6EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  separator: {
    height: 8,
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(80),
    paddingHorizontal: wp(40),
  },
  emptyStateIconContainer: {
    width: wp(120),
    height: hp(120),
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    color: '#0B0A0D',
    fontFamily: 'Geist-Bold',
    fontSize: fs(22),
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: '#6B7280',
    fontFamily: 'Geist-Regular',
    fontSize: fs(15),
    textAlign: 'center',
    lineHeight: fs(22),
    maxWidth: '85%',
  },
  // Modal Styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitleIconContainer: {
    width: wp(40),
    height: hp(40),
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleTextContainer: {
    flex: 1,
  },
  modalTitle: {
    color: '#121116',
    fontFamily: 'Geist-Bold',
    fontSize: fs(18),
    marginBottom: 2,
  },
  modalOrderNumber: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(13),
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalBody: {
    flex: 1,
  },
  modalItemsList: {
    maxHeight: 300,
  },
  modalOrderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  modalItemImage: {
    width: wp(60),
    height: hp(60),
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  modalItemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  modalItemTitle: {
    color: '#121116',
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(14),
    marginBottom: 4,
  },
  modalItemPrice: {
    color: '#0C154C',
    fontFamily: 'Geist-Medium',
    fontSize: fs(12),
    marginBottom: 2,
  },
  modalItemSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  modalFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalSummaryContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSummaryHeader: {
    marginBottom: 16,
  },
  modalSummaryTitle: {
    color: '#121116',
    fontFamily: 'Geist-SemiBold',
    marginBottom: 4,
  },
  modalSummaryDetails: {
    gap: 16,
  },
  modalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSummaryLabel: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(14),
  },
  modalSummaryValue: {
    color: '#0C154C',
    fontFamily: 'Geist-Bold',
    fontSize: fs(20),
  },
  modalSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  modalStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalStatusLabel: {
    color: '#666',
    fontFamily: 'Geist-Medium',
    fontSize: fs(12),
  },
  modalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalStatusText: {
    fontSize: fs(10),
    fontFamily: 'Geist-SemiBold',
  },
});