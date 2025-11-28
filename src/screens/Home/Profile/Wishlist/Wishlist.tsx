import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";
import { WishlistProps } from "@/src/utils/types";
import { Feather } from "@expo/vector-icons";

export function Wishlist({ wishListData, onBack, loading = false }: WishlistProps) {
  const calculateDiscount = (price: number, beforePrice: number) => {
    return Math.round(((beforePrice - price) / beforePrice) * 100);
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.itemImage} />
        
        {/* Discount badge on top left */}
        {item.beforePrice && (
          <View style={styles.discountBadge}>
            <ThemeText variant="caption" style={styles.discountText}>
              {calculateDiscount(item.price, item.beforePrice)}% OFF
            </ThemeText>
          </View>
        )}
        
        {/* Heart icon on top right */}
        <TouchableOpacity style={styles.heartIcon}>
          <Feather name="heart" size={16} color="#FF0000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemContent}>
        <ThemeText variant="paragraph" style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </ThemeText>
        
        <View style={styles.priceContainer}>
          <ThemeText variant="bodySmall" style={styles.currentPrice}>
            ${item.price.toFixed(2)}
          </ThemeText>
          
          {item.beforePrice && (
            <ThemeText variant="bodySmall" style={styles.beforePrice}>
              ${item.beforePrice.toFixed(2)}
            </ThemeText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeletonItem = (index: number) => (
    <View key={`skeleton-${index}`} style={styles.skeletonItemContainer}>
      <View style={styles.skeletonImageContainer}>
        <View style={styles.skeletonImage} />
      </View>
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonBar, { width: '80%', marginBottom: 4 }]} />
        <View style={[styles.skeletonBar, { width: '40%' }]} />
      </View>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="My Wishlist" />

      {loading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => renderSkeletonItem(index))}
        </View>
      ) : (
        <FlatList
          data={wishListData}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 24,
  },
  row: {
    justifyContent: "space-between",
  },
  itemContainer: {
    width: "48%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
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
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#080020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Geist-Medium",
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
    width: "48%",
    marginBottom: 12,
  },
  skeletonImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
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
  skeletonDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 40,
    height: 20,
    backgroundColor: "#E3E6EB",
    borderRadius: 16,
  },
  skeletonHeartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
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
});