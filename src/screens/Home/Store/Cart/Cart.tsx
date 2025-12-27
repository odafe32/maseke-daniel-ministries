import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { CartItem } from "@/src/constants/data";
import { fs, hp, wp } from "@/src/utils";

// Color constants to avoid color literals
const COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  PRIMARY_DARK: '#080020',
  PRIMARY_BLUE: '#0C154C',
  LIGHT_GRAY: '#f5f5f5',
  BORDER_GRAY: '#e0e0e0',
  TEXT_GRAY: '#666',
  TEXT_DARK: '#121116',
  DISABLED_GRAY: '#f8f9fa',
  DISABLED_BORDER: '#f0f0f0',
  PRICE_GRAY: '#999',
  TEXT_LIGHT_GRAY: '#888',
  TEXT_DARK_GRAY: '#444',
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  SEARCH_TEXT: '#333',
  ACTIVITY_INDICATOR: '#FF0000',
};

interface CartUIProps {
  cartItems: CartItem[];
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  getTotalAmount: () => number;
  onBack: () => void;
  onCheckout: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  updatingItemId: string | null;
  isCheckingOut: boolean;
}

export function CartUI({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  getTotalAmount,
  onBack,
  onCheckout,
  onRefresh,
  isLoading,
  updatingItemId = null,
  isCheckingOut = false,
}: CartUIProps) {

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      {/* Product Image */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholderImage]} />
      )}
      
      {/* Product Details */}
      <View style={styles.productDetails}>
        <ThemeText variant="paragraph" style={styles.productTitle}>
          {item.title}
        </ThemeText>
        <ThemeText variant="bodySmall" style={styles.productPrice}>
          {"₦" + item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </ThemeText>
        
        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              item.quantity === 1 && styles.quantityButtonDisabled
            ]}
            onPress={() => decreaseQuantity(item.id)}
            disabled={item.quantity === 1 || updatingItemId === item.id}
          >
            {updatingItemId === item.id ? (
              <ActivityIndicator size={16} color={COLORS.ACTIVITY_INDICATOR} />
            ) : (
              <Feather 
                name="minus" 
                size={16} 
                color={item.quantity === 1 ? COLORS.TEXT_LIGHT_GRAY : COLORS.TEXT_GRAY} 
              />
            )}
          </TouchableOpacity>
          
          <ThemeText variant="body" style={styles.quantityText}>
            {item.quantity}
          </ThemeText>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.id)}
            disabled={updatingItemId === item.id}
          >
            {updatingItemId === item.id ? (
              <ActivityIndicator size={16} color={COLORS.ACTIVITY_INDICATOR} />
            ) : (
              <Feather name="plus" size={16} color={COLORS.TEXT_GRAY} />
            )}
          </TouchableOpacity>
          
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeFromCart(item.id)}
            disabled={updatingItemId === item.id}
          >
            {updatingItemId === item.id ? (
              <ActivityIndicator size={16} color={COLORS.ACTIVITY_INDICATOR} />
            ) : (
              <Feather name="trash-2" size={16} color={COLORS.ACTIVITY_INDICATOR} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader 
          title="My Cart" 
          onBackPress={onBack} 
          showCartButton={false} 
        />

        {/* Cart Items */}
        {isLoading ? (
          // Skeleton Loader
          <View>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
              <View key={index} style={styles.cartItemContainer}>
                {/* Skeleton Image */}
                <View style={[styles.productImage, styles.skeleton]} />
                {/* Skeleton Details */}
                <View style={styles.productDetails}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonPrice} />
                  {/* Skeleton Quantity Controls */}
                  <View style={styles.quantityContainer}>
                    <View style={[styles.quantityButton, styles.skeleton]} />
                    <ThemeText variant="body" style={[styles.quantityText, styles.skeletonText]}>--</ThemeText>
                    <View style={[styles.quantityButton, styles.skeleton]} />
                    <View style={[styles.deleteButton, styles.skeleton]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="cart" size={48} color={COLORS.TEXT_LIGHT_GRAY} />
                </View>
                <ThemeText variant="body" style={styles.emptyText}>
                  Your cart is empty
                </ThemeText>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <ThemeText variant="h4" style={styles.totalText}>
            Total Amount
          </ThemeText>
          <ThemeText variant="h3" style={styles.totalAmount}>
            {"₦" + getTotalAmount().toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </ThemeText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Refresh Button */}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={20} color={COLORS.PRIMARY_BLUE} />
            ) : (
              <>
                <Feather name="refresh-cw" size={20} color={COLORS.PRIMARY_BLUE} />
                <ThemeText variant="h4" style={styles.refreshText}>
                  Refresh
                </ThemeText>
              </>
            )}
          </TouchableOpacity>

          {/* Checkout Button */}
          <TouchableOpacity 
            style={[styles.checkoutButton, styles.checkoutButtonExpanded]} 
            onPress={onCheckout} 
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              <ActivityIndicator size={20} color={COLORS.WHITE} />
            ) : (
              <>
                <ThemeText variant="h3" style={styles.checkoutText}>
                  Checkout
                </ThemeText>
                <Icon name="cart" size={20} color={COLORS.WHITE} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cartItemContainer: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  container: {
    flexGrow: 1,
    gap: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  productImage: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    height: hp(80),
    marginRight: 12,
    width: wp(80),
  },
  placeholderImage: {
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    color: COLORS.TEXT_DARK,
    fontSize: fs(16),
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: COLORS.PRIMARY_BLUE,
    fontSize: fs(14),
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
    height: hp(32),
    justifyContent: 'center',
    width: wp(32),
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.DISABLED_GRAY,
    borderColor: COLORS.DISABLED_BORDER,
    borderWidth: 1,
  },
  quantityText: {
    color: COLORS.TEXT_DARK,
    fontSize: fs(16),
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.TRANSPARENT,
    borderRadius: 20,
    height: hp(32),
    justifyContent: 'center',
    marginLeft: 'auto',
    width: wp(32),
  },
  skeleton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
  },
  skeletonTitle: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    height: 20,
    marginBottom: 4,
    width: '70%',
  },
  skeletonPrice: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    height: 16,
    marginBottom: 8,
    width: '40%',
  },
  skeletonText: {
    color: COLORS.TEXT_LIGHT_GRAY,
    opacity: 0.3,
  },
  separator: {
    backgroundColor: COLORS.BORDER_GRAY,
    height: hp(1),
    marginHorizontal: 16,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 60,
    height: hp(120),
    justifyContent: 'center',
    marginBottom: 20,
    width: wp(120),
  },
  emptyText: {
    color: COLORS.TEXT_LIGHT_GRAY,
    fontSize: fs(14),
    textAlign: 'center',
  },

  // Footer Styles
  footer: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.BORDER_GRAY,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalText: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-Medium',
  },
  totalAmount: {
    color: COLORS.PRIMARY_BLUE,
    fontWeight: '600',
    fontFamily: 'Geist-Bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_BLUE,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
    flex: 1,
  },
  refreshText: {
    color: COLORS.PRIMARY_BLUE,
    fontSize: fs(16),
    fontWeight: '600',
  },
  checkoutButtonExpanded: {
    flex: 2,
  },
  checkoutButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  checkoutText: {
    color: COLORS.WHITE,
    fontSize: fs(18),
    fontWeight: '600',
  },
});