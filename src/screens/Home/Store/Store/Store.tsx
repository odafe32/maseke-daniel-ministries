import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  ImageSourcePropType,
  Animated,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { StoreProduct } from '@/src/utils/types';
import { fs, hp, wp } from "@/src/utils";

// Color constants to avoid color literals
const COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  SKELETON: '#E3E6EB',
  PRIMARY_DARK: '#080020',
  PRIMARY_BLUE: '#0C154C',
  LIGHT_GRAY: '#f5f5f5',
  BORDER_GRAY: '#e0e0e0',
  TEXT_GRAY: '#666',
  TEXT_DARK: '#121116',
  DISABLED_GRAY: '#f8f9fa',
  DISABLED_BORDER: '#f0f0f0',
  PRICE_GRAY: '#999',
  TEXT_LIGHT_GRAY: '#666666',
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  SEARCH_TEXT: '#333',
  ACTIVITY_INDICATOR: '#FF0000',
};

interface StoreUIProps {
  onBack: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleSearchPress: () => void;
  currentPage: number;
  handlePageChange: (page: number) => Promise<void>;
  filterValue: string;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
  isLoading: boolean;
  loadingWishlists: Array<string>;
  loadingCart: Array<string>;
  refreshing: boolean;
  onRefresh: () => void;
  filterOptions: Array<{ label: string; value: string }>;
  paginatedProducts: StoreProduct[];
  totalPages: number;
  handleFilterChange: (value: string) => void;
  toggleWishlist: (productId: string) => void;
  handleCartPress: () => void;
  modalVisible: boolean;
  selectedProduct: StoreProduct | null;
  quantity: number;
  cartCount: number;
  openProductModal: (product: StoreProduct) => void;
  closeProductModal: () => void;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
  addToCart: () => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  carouselRef: React.RefObject<ScrollView | null>;
  carouselData: Array<{ id: string; image: ImageSourcePropType; text: string; duration?: number }>;
  goToSlide: (index: number) => void;
  actualCarouselWidth: number;
}

interface ProductItemProps {
  item: StoreProduct;
  index: number;
}

export function StoreUI({
  onBack,
  searchQuery,
  setSearchQuery,
  handleSearchPress,
  currentPage,
  handlePageChange,
  filterValue,
  showFilterDropdown,
  setShowFilterDropdown,
  isLoading,
  loadingWishlists = [],
  loadingCart = [],
  refreshing,
  onRefresh,
  filterOptions,
  paginatedProducts,
  totalPages,
  handleFilterChange,
  toggleWishlist,
  handleCartPress,
  modalVisible,
  selectedProduct,
  quantity,
  cartCount,
  openProductModal,
  closeProductModal,
  increaseQuantity,
  decreaseQuantity,
  addToCart,
  currentSlide,
  setCurrentSlide,
  carouselRef,
  carouselData,
  goToSlide,
  actualCarouselWidth,
}: StoreUIProps) {

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const carouselAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const trendingAnim = useRef(new Animated.Value(0)).current;
  const paginationAnim = useRef(new Animated.Value(0)).current;
  const skeletonPulse = useRef(new Animated.Value(0.3)).current;
  const filterDropdownAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations on mount
  useEffect(() => {
    // Sequence of animations with staggered timing
    Animated.parallel([
      // Header - fade and slide from top
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // Carousel - scale and fade
      Animated.spring(carouselAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        delay: 100,
        useNativeDriver: true,
      }),
      // Search bar - slide from left
      Animated.spring(searchAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Trending section - fade in
      Animated.timing(trendingAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Skeleton pulse animation
  useEffect(() => {
    if (isLoading) {
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
  }, [isLoading]);

  // Filter dropdown animation
  useEffect(() => {
    if (showFilterDropdown) {
      Animated.spring(filterDropdownAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      filterDropdownAnim.setValue(0);
    }
  }, [showFilterDropdown]);

  // Pagination animation when products change
  useEffect(() => {
    if (!isLoading && paginatedProducts.length > 0) {
      paginationAnim.setValue(0);
      Animated.timing(paginationAnim, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [paginatedProducts, isLoading]);

  // Modal animation
  useEffect(() => {
    if (modalVisible) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const ProductItem = ({ item, index }: ProductItemProps) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => openProductModal(item)}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]} />
          )}

          {/* Heart icon on top right */}
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => toggleWishlist(item.id)}
            disabled={loadingWishlists.includes(item.id)}
          >
            {loadingWishlists.includes(item.id) ? (
              <ActivityIndicator size={16} color={COLORS.ACTIVITY_INDICATOR} />
            ) : (
              <Icon
                name={item.isInWishlist ? "heart" : "heartRegular"}
                size={16}
                color={item.isInWishlist ? COLORS.ACTIVITY_INDICATOR : COLORS.BLACK}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.itemContent}>
          <ThemeText variant="paragraph" style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </ThemeText>

          <View style={styles.priceContainer}>
            <ThemeText variant="bodySmall" style={styles.currentPrice}>
              ₦{item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </ThemeText>

            {item.beforePrice && (
              <ThemeText variant="bodySmall" style={styles.beforePrice}>
                ₦{item.beforePrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemeText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const renderPaginationButton = (pageNumber: number, isActive: boolean) => (
    <TouchableOpacity
      key={pageNumber}
      style={[
        styles.paginationButton,
        styles.paginationNumberButton,
        isActive ? styles.paginationButtonActive : {}
      ]}
      onPress={() => handlePageChange(pageNumber)}
    >
      <ThemeText
        variant="bodySmall"
        style={[
          styles.paginationButtonText,
          isActive ? styles.paginationButtonTextActive : {}
        ]}
      >
        {pageNumber}
      </ThemeText>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
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
        <BackHeader
          title={"GDM SHOP"}
          onBackPress={onBack}
          showCartButton={true}
          cartCount={cartCount}
        />
      </Animated.View>

      {/* Animated Hero Carousel */}
      <Animated.View
        style={[
          styles.heroCarousel,
          {
            opacity: carouselAnim,
            transform: [
              {
                scale: carouselAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Image Cards Container */}
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / actualCarouselWidth);
            setCurrentSlide(index);
          }}
          style={{ ...styles.carouselScroll, width: "100%" }}
        >
          {carouselData.map((slide) => (
            <View key={slide.id} style={[styles.heroCard, { width: actualCarouselWidth }]}>
              <Image
                source={slide.image}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Absolute Text Overlay */}
        <LinearGradient
          style={styles.heroOverlay}
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <ThemeText variant="h3" style={styles.heroText}>
            {carouselData[currentSlide].text}
          </ThemeText>
        </LinearGradient>

        {/* Absolute Progress Indicator */}
        <View style={styles.progressIndicator}>
          {carouselData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.dot,
                currentSlide === index && styles.activeDot
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Animated Search and Filter Section */}
      <Animated.View
        style={[
          styles.searchFilterContainer,
          {
            opacity: searchAnim,
            transform: [
              {
                translateX: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.searchField}>
          <TextInput
            style={styles.searchInput}
            placeholder={"Search here"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.TEXT_GRAY}
          />
          <TouchableOpacity 
            style={styles.searchIconButton}
            onPress={handleSearchPress}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Icon name="search" size={18} color={COLORS.TEXT_GRAY} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          <ThemeText variant="bodySmall" style={styles.filterText}>
            {filterOptions.find(option => option.value === filterValue)?.label || "Filter"}
          </ThemeText>
          <View style={{ transform: [{ rotate: showFilterDropdown ? '180deg' : '0deg' }] }}>
            <Icon name="chevronDown" size={12} color={COLORS.TEXT_GRAY} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Filter Dropdown */}
      {showFilterDropdown && (
        <Animated.View
          style={[
            styles.filterDropdown,
            {
              opacity: filterDropdownAnim,
              transform: [
                {
                  scaleY: filterDropdownAnim,
                },
                {
                  translateY: filterDropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView style={styles.filterDropdownScroll} showsVerticalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filterValue === option.value && styles.filterOptionActive
                ]}
                onPress={() => {
                  handleFilterChange(option.value);
                  setShowFilterDropdown(false);
                }}
              >
                <ThemeText
                  variant="bodySmall"
                  style={[
                    styles.filterOptionText,
                    filterValue === option.value ? styles.filterOptionTextActive : {}
                  ]}
                >
                  {option.label}
                </ThemeText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Animated Trending Section */}
      <Animated.View
        style={[
          styles.trendingContainer,
          {
            opacity: trendingAnim,
          },
        ]}
      >
        <ThemeText variant="h4" style={styles.trendingText}>
          Trending
        </ThemeText>
      </Animated.View>

      {/* Products Grid */}
      {isLoading ? (
        // Animated Skeleton grid when loading
        <View style={[styles.row, styles.skeletonGrid]}>
          {Array.from({ length: 6 }, (_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.itemContainer,
                {
                  opacity: skeletonPulse,
                },
              ]}
            >
              <View style={styles.imageContainer}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonHeartIcon} />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.skeletonTitleBar} />
                <View style={styles.skeletonPriceBar} />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : paginatedProducts.length === 0 ? (
        // Empty State
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Feather name="shopping-bag" size={64} color="#D1D5DB" />
          </View>
          <ThemeText variant="h3" style={styles.emptyStateTitle}>
            No Products Found
          </ThemeText>
          <ThemeText variant="body" style={styles.emptyStateDescription}>
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try different keywords or browse all items.`
              : "There are no products available at the moment. Please check back later!"}
          </ThemeText>
        </View>
      ) : (
        // Actual products when not loading
        <View style={styles.productsContainer}>
          {paginatedProducts.map((item, index) => (
            <ProductItem key={item.id} item={item} index={index} /> // eslint-disable-line react/prop-types
          ))}
        </View>
      )}

      {/* Animated Pagination */}
      {totalPages > 1 && (
        <Animated.View
          style={[
            styles.paginationContainer,
            {
              opacity: paginationAnim,
              transform: [
                {
                  translateY: paginationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === 1 && styles.paginationButtonDisabled
            ]}
            onPress={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Feather 
              name="chevron-left" 
              size={16} 
              color={currentPage === 1 ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
          
          <View style={styles.paginationNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
              renderPaginationButton(page, page === currentPage)
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === totalPages && styles.paginationButtonDisabled
            ]}
            onPress={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <Feather 
              name="chevron-right" 
              size={16} 
              color={currentPage === totalPages ? "#ccc" : "#666"}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Product Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        {/* Modal Overlay */}
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={closeProductModal}
          />
        </Animated.View>

        {/* Animated Modal Content */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Product Image Section with Floating Header */}
          <View style={styles.productImageSection}>
            {selectedProduct?.image ? (
              <Image source={{ uri: selectedProduct?.image }} style={styles.productImage} />
            ) : (
              <View style={[styles.itemImage, styles.placeholderImage]} />
            )}
            {/* Floating Header */}
            <View style={styles.floatingHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeProductModal}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color={COLORS.TEXT_GRAY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Details */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Product Type */}
            <ThemeText variant="caption" style={styles.productType}>
              {selectedProduct?.category}
            </ThemeText>

            {/* Title */}
            <ThemeText variant="h3" style={styles.productTitle}>
              {selectedProduct?.title}
            </ThemeText>

            {/* Price */}
            <View style={styles.priceSection}>
              <ThemeText variant="h2" style={styles.modalCurrentPrice}>
                ₦{selectedProduct?.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemeText>
              {selectedProduct?.beforePrice && (
                <ThemeText variant="body" style={styles.modalBeforePrice}>
                  ₦{selectedProduct.beforePrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </ThemeText>
              )}
            </View>

            {/* Availability Indicator */}
            <View style={styles.availabilitySection}>
              <View style={[
                styles.availabilityBadge,
                selectedProduct && selectedProduct.stockCount === 0 ? styles.availabilityBadgeOutOfStock :
                selectedProduct && selectedProduct.stockCount <= 5 ? styles.availabilityBadgeLow :
                styles.availabilityBadgeInStock
              ]}>
                <Feather
                  name={
                    selectedProduct && selectedProduct.stockCount === 0 ? "x-circle" :
                    selectedProduct && selectedProduct.stockCount <= 5 ? "alert-circle" :
                    "check-circle"
                  }
                  size={16}
                  color={
                    selectedProduct && selectedProduct.stockCount === 0 ? COLORS.ACTIVITY_INDICATOR :
                    selectedProduct && selectedProduct.stockCount <= 5 ? "#FF8C00" :
                    "#10B981"
                  }
                />
                <ThemeText
                  variant="bodySmall"
                  style={[
                    styles.availabilityText,
                    selectedProduct && selectedProduct.stockCount === 0 ? styles.availabilityTextOutOfStock :
                    selectedProduct && selectedProduct.stockCount <= 5 ? styles.availabilityTextLow :
                    styles.availabilityTextInStock
                  ]}
                >
                  {selectedProduct && selectedProduct.stockCount === 0 ? "Out of Stock" :
                   selectedProduct && selectedProduct.stockCount <= 5 ? `Only ${selectedProduct.stockCount} left!` :
                   `${selectedProduct?.stockCount} Available`}
                </ThemeText>
              </View>
            </View>

            {/* Quantity Selector - Only show if in stock */}
            {selectedProduct && selectedProduct.stockCount > 0 && (
              <View style={styles.quantitySection}>
                <ThemeText variant="h4" style={styles.quantityLabel}>
                  Select Quantity
                </ThemeText>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={decreaseQuantity}
                    activeOpacity={0.7}
                    disabled={quantity <= 1}
                  >
                    <Feather name="minus" size={18} color={quantity <= 1 ? COLORS.BORDER_GRAY : COLORS.TEXT_GRAY} />
                  </TouchableOpacity>
                  <ThemeText variant="h3" style={styles.quantityValue}>
                    {quantity}
                  </ThemeText>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity >= selectedProduct.stockCount && styles.quantityButtonDisabled]}
                    onPress={increaseQuantity}
                    activeOpacity={0.7}
                    disabled={quantity >= selectedProduct.stockCount}
                  >
                    <Feather name="plus" size={18} color={quantity >= selectedProduct.stockCount ? COLORS.BORDER_GRAY : COLORS.TEXT_GRAY} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <ThemeText variant="h4" style={styles.descriptionLabel}>
                Product Details
              </ThemeText>
              <ThemeText variant="body" style={styles.descriptionText}>
                {selectedProduct?.description}
              </ThemeText>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                selectedProduct && selectedProduct.stockCount === 0 && styles.addToCartButtonDisabled
              ]}
              onPress={addToCart}
              activeOpacity={0.8}
              disabled={
                selectedProduct
                  ? (loadingCart.includes(selectedProduct.id) || selectedProduct.stockCount === 0)
                  : false
              }
            >
              {selectedProduct && loadingCart.includes(selectedProduct.id) ? (
                <ActivityIndicator size={20} color={COLORS.WHITE} />
              ) : (
                <>
                  <ThemeText variant="h3" style={styles.addToCartText}>
                    {selectedProduct && selectedProduct.stockCount === 0 ? "Out of Stock" : "Add to Cart"}
                  </ThemeText>
                  {selectedProduct && selectedProduct.stockCount > 0 && (
                    <Icon name="cart" size={20} color={COLORS.WHITE} />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: wp(16),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: "space-between",
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: "space-between",
    gap:12,
  },
  separator: {
    height: hp(12),
  },
  
  // Hero Carousel
  heroCarousel: {
    height: hp(180),
    marginBottom: 24,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselScroll: {
    flex: 1,
  },
  heroCard: {
    height: "100%",
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  heroText: {
    color: COLORS.WHITE,
    fontSize: fs(24),
    fontFamily: 'Geist-SemiBold',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BORDER_GRAY,
  },
  activeDot: {
    width: 24,
  },

  // Search and Filter
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
    height: hp(50),
  },
  searchField: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER_GRAY,
    flexWrap: "nowrap",
    height: "100%",
  },
  searchIconButton: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    width: wp(40),
    height: wp(40),
    borderRadius: 11,
    borderWidth:1,
    borderColor: "#d1d1d1",
    marginRight:5,
  },
  searchInput: {
    flex: 1,
    color: COLORS.SEARCH_TEXT,
    fontSize: fs(16),
    fontWeight: 500,
    height: "100%",
    padding: 0,
    fontFamily: "Geist-Medium",
    paddingLeft: 12,
  },
  filterButton: {
    height: hp(100),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap:8,
    fontFamily: "Geist-Medium",
    fontWeight: 500,
  },
  filterText: {
    color: COLORS.TEXT_GRAY,
  },

  // Filter Dropdown
  filterDropdown: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: COLORS.BLACK,
    shadowOffset: { height: 2, width: wp(0) },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterDropdownScroll: {
    maxHeight: 200,
  },
  filterOption: {
    alignItems: 'center',
    borderBottomColor: COLORS.LIGHT_GRAY,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterOptionActive: {
    backgroundColor: COLORS.DISABLED_GRAY,
    borderLeftColor: COLORS.PRIMARY_BLUE,
    borderLeftWidth: 3,
  },
  filterOptionText: {
    color: COLORS.SEARCH_TEXT,
    flex: 1,
    fontSize: fs(14),
  },
  filterOptionTextActive: {
    color: COLORS.PRIMARY_BLUE,
    fontFamily: 'Geist-SemiBold',
    fontWeight: '600',
  },

  // Trending Section
  trendingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendingText: {
    color: COLORS.TEXT_DARK,
  },

  // Product Cards
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  itemContainer: {
    backgroundColor: COLORS.TRANSPARENT,
    overflow: "hidden",
    width: "48%",
  },
  imageContainer: {
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: wp(6),
    borderWidth: 1,
    height: hp(200),
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  itemImage: {
    backgroundColor: COLORS.LIGHT_GRAY,
    height: "100%",
    width: "100%",
  },
  placeholderImage: {
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%"
  },
  // Skeleton styles for product items
  skeletonImage: {
    backgroundColor: COLORS.SKELETON,
    height: "100%",
    width: "100%",
  },
  skeletonHeartIcon: {
    backgroundColor: COLORS.SKELETON,
    borderRadius: wp(14),
    height: hp(28),
    position: "absolute",
    right: wp(8),
    top: hp(8),
    width: wp(28),
  },
  skeletonTitleBar: {
    backgroundColor: COLORS.SKELETON,
    borderRadius: wp(8),
    height: hp(14),
    marginBottom: hp(4),
    width: '80%',
  },
  skeletonPriceBar: {
    backgroundColor: COLORS.SKELETON,
    borderRadius: wp(8),
    height: hp(12),
    width: '40%',
  },
  heartIcon: {
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: wp(14),
    elevation: 2,
    height: hp(28),
    justifyContent: "center",
    position: "absolute",
    right: wp(8),
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    top: hp(8),
    width: wp(28),
  },
  itemContent: {
    gap: 0,
  },
  itemTitle: {
    color: COLORS.TEXT_DARK,
    marginBottom: 0,
  },
  priceContainer: {
    flexDirection: "row",
    gap: wp(6),
  },
  currentPrice: {
    color: COLORS.PRIMARY_BLUE,
    fontFamily: "Geist-SemiBold",
  },
  beforePrice: {
    color: COLORS.PRICE_GRAY,
    textDecorationLine: "line-through",
  },

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
    borderRadius: wp(60),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  emptyStateTitle: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-Bold',
    fontSize: fs(22),
    marginBottom: hp(12),
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

  // Pagination
  paginationContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT,
    borderRadius: wp(16),
    flexDirection: 'row',
    gap: wp(12),
    justifyContent: 'center',
    marginBottom: hp(24),
    marginHorizontal: wp(16),
    marginTop: hp(24),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
  },
  paginationNumbers: {
    flexDirection: 'row',
    gap: wp(8),
  },
  paginationButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationNumberButton: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: wp(18),
    borderWidth: 1,
    elevation: 1,
    height: hp(36),
    shadowColor: COLORS.BLACK,
    shadowOffset: { height: 1, width: wp(0) },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    width: wp(36),
  },
  paginationNavButton: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: wp(20),
    borderWidth: 1,
    elevation: 1,
    height: hp(40),
    shadowColor: COLORS.BLACK,
    shadowOffset: { height: 1, width: wp(0) },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    width: wp(40),
  },
  paginationButtonActive: {
    backgroundColor: COLORS.PRIMARY_DARK,
    borderColor: COLORS.PRIMARY_DARK,
    elevation: 3,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.DISABLED_GRAY,
    borderColor: COLORS.DISABLED_BORDER,
    elevation: 0,
    shadowOpacity: 0,
  },
  paginationButtonText: {
    color: COLORS.TEXT_LIGHT_GRAY,
    fontFamily: 'Geist-Medium',
    fontSize: fs(14),
    fontWeight: '500',
  },
  paginationButtonTextActive: {
    color: COLORS.WHITE,
    fontFamily: 'Geist-SemiBold',
    fontWeight: '600',
  },

  // Product Details Modal
  modalOverlay: {
    backgroundColor: COLORS.MODAL_OVERLAY,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalOverlayTouchable: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    left: 0,
    maxHeight: '90%',
    position: 'absolute',
    right: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  productImageSection: {
    position: 'relative',
    flexShrink: 0,
  },
  productImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: hp(250),
    resizeMode: 'cover',
    width: '100%',
  },
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    elevation: 2,
    height: hp(40),
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { height: 1, width: wp(0) },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: wp(40),
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    elevation: 2,
    height: hp(40),
    justifyContent: 'center',
    shadowColor: COLORS.BLACK,
    shadowOffset: { height: 1, width: wp(0) },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: wp(40),
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalBodyContent: {
    paddingBottom: hp(90),
  },
  productType: {
    color: COLORS.PRIMARY_BLUE,
    fontFamily: 'Geist-SemiBold',
    fontWeight: 500,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  productTitle: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-SemiBold',
    fontWeight: 500,
    marginTop: 8,
  },
  priceSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  modalCurrentPrice: {
    color: COLORS.PRIMARY_BLUE,
    fontFamily: 'Geist-Medium',
    fontSize: fs(27),
  },
  modalBeforePrice: {
    color: COLORS.PRICE_GRAY,
    fontFamily: 'Geist-Regular',
    fontSize: fs(20),
    marginLeft: 6,
    textDecorationLine: 'line-through',
  },
  availabilitySection: {
    marginTop: 16,
  },
  availabilityBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  availabilityBadgeInStock: {
    backgroundColor: '#D1FAE5',
  },
  availabilityBadgeLow: {
    backgroundColor: '#FEF3C7',
  },
  availabilityBadgeOutOfStock: {
    backgroundColor: '#FEE2E2',
  },
  availabilityText: {
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(13),
    fontWeight: '600',
  },
  availabilityTextInStock: {
    color: '#059669',
  },
  availabilityTextLow: {
    color: '#D97706',
  },
  availabilityTextOutOfStock: {
    color: '#DC2626',
  },
  quantitySection: {
    marginTop: hp(24),
  },
  quantityLabel: {
    color: COLORS.TEXT_DARK,
    marginBottom: hp(12),
  },
  quantityControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: wp(25),
    height: hp(50),
    justifyContent: 'center',
    width: wp(50),
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.DISABLED_GRAY,
    opacity: 0.5,
  },
  quantityValue: {
    color: COLORS.TEXT_DARK,
    fontSize: fs(24),
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: hp(32),
    marginBottom: hp(20),
  },
  descriptionLabel: {
    color: COLORS.TEXT_DARK,
    marginBottom: hp(12),
  },
  descriptionText: {
    color: COLORS.TEXT_GRAY,
    lineHeight: hp(22),
  },
  modalFooter: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.LIGHT_GRAY,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: wp(20),
    paddingVertical: wp(16),
    position: 'absolute',
    right: 0,
    flexShrink: 0,
    elevation: 8,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.TEXT_GRAY,
    opacity: 0.6,
  },
  addToCartText: {
    color: COLORS.WHITE,
    fontFamily: 'Geist-Medium',
    fontSize: fs(20),
  },
});