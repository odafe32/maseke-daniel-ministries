import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
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
}

export function CartUI({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  getTotalAmount,
  onBack,
  onCheckout,
}: CartUIProps) {

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      {/* Product Image */}
      <Image source={item.image} style={styles.productImage} />
      
      {/* Product Details */}
      <View style={styles.productDetails}>
        <ThemeText variant="paragraph" style={styles.productTitle}>
          {item.title}
        </ThemeText>
        <ThemeText variant="bodySmall" style={styles.productPrice}>
          {"₦" + item.price.toFixed(2)}
        </ThemeText>
        
        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              item.quantity === 1 && styles.quantityButtonDisabled
            ]}
            onPress={() => decreaseQuantity(item.id)}
            disabled={item.quantity === 1}
          >
            <Feather 
              name="minus" 
              size={16} 
              color={item.quantity === 1 ? COLORS.TEXT_LIGHT_GRAY : COLORS.TEXT_GRAY} 
            />
          </TouchableOpacity>
          
          <ThemeText variant="body" style={styles.quantityText}>
            {item.quantity}
          </ThemeText>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.id)}
          >
            <Feather name="plus" size={16} color={COLORS.TEXT_GRAY} />
          </TouchableOpacity>
          
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeFromCart(item.id)}
          >
            <Feather name="trash-2" size={16} color={COLORS.ACTIVITY_INDICATOR} />
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
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <ThemeText variant="h4" style={styles.totalText}>
            Total Amount
          </ThemeText>
          <ThemeText variant="h3" style={styles.totalAmount}>
            {"₦" + getTotalAmount().toFixed(2)}
          </ThemeText>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <ThemeText variant="h3" style={styles.checkoutText}>
            Checkout
          </ThemeText>
          <Icon name="cart" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>
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