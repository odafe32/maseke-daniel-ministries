import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { IWishlist } from "@/src/constants/data";
import { hp, wp, wpt } from "@/src/utils";

interface WishlistProps {
  wishListData: IWishlist[];
  onBack: () => void;
  loading?: boolean;
  loadingWishlists?: Array<string>;
  toggleWishlist?: (productId: string) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function Wishlist({
  wishListData,
  onBack,
  loading = false,
  loadingWishlists = [],
  toggleWishlist,
  isRefreshing = false,
  onRefresh,
}: WishlistProps) {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const emptyStateAnim = useRef(new Animated.Value(0)).current;
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
      // Grid - fade in
      Animated.timing(gridAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      // Empty state - scale up
      Animated.spring(emptyStateAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        delay: 200,
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

  const calculateDiscount = (price: number, beforePrice: number) => {
    return Math.round(((beforePrice - price) / beforePrice) * 100);
  };

  const renderWishlistItem = ({ item }: { item: IWishlist }) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]} />
        )}

        {/* Heart icon on top right */}
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleWishlist && toggleWishlist(item.id)}
          disabled={loadingWishlists.includes(item.id)}
        >
          {loadingWishlists.includes(item.id) ? (
            <ActivityIndicator size={16} color="#FF0000" />
          ) : (
            <Icon name="heart" size={16} color="#FF0000" />
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

  const renderSkeletonItem = (index: number) => (
    <Animated.View
      key={`skeleton-${index}`}
      style={[
        styles.skeletonItemContainer,
        {
          opacity: skeletonPulse,
        },
      ]}
    >
      <View style={styles.skeletonImageContainer}>
        <View style={styles.skeletonImage} />
      </View>
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonBar, { width: '80%', marginBottom: 4 }]} />
        <View style={[styles.skeletonBar, { width: '40%' }]} />
      </View>
    </Animated.View>
  );

  return (
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
        <BackHeader title="My Wishlist" onBackPress={onBack} />
      </Animated.View>

      {loading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => renderSkeletonItem(index))}
        </View>
      ) : wishListData.length > 0 ? (
        <Animated.View
          style={{
            opacity: gridAnim,
          }}
        >
          <FlatList
            data={wishListData}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.emptyStateContainer,
            {
              opacity: emptyStateAnim,
              transform: [
                {
                  scale: emptyStateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.emptyStateIconContainer}>
            <Feather name="heart" size={64} color="#D1D5DB" />
          </View>
          <ThemeText variant="h2" style={styles.emptyStateTitle}>
            Your Wishlist is Empty
          </ThemeText>
          <ThemeText variant="body" style={styles.emptyStateDescription}>
            Save your favorite items here! Browse the store and tap the heart icon to add products to your wishlist.
          </ThemeText>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  itemContainer: {
    width: wpt(44),
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: hp(200),
    borderColor: "#f5f5f5",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    gap: 0,
  },
  itemTitle: {
    color: "#121116",
    marginBottom: 0,
  },
  priceContainer: {
    flexDirection: "row",
    gap: 6,
  },
  currentPrice: {
    color: "#0C154C",
    fontFamily: "Geist-SemiBold",
  },
  beforePrice: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  separator: {
    height: 12,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonItemContainer: {
    width: wpt(44),
    marginBottom: 12,
  },
  skeletonImageContainer: {
    position: "relative",
    width: "100%",
    height: hp(200),
    borderColor: "#f5f5f5",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  skeletonImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E3E6EB",
  },
  skeletonContent: {
    gap: 0,
  },
  skeletonBar: {
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E3E6EB",
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    color: '#6B7280',
    fontFamily: 'Geist-Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
});