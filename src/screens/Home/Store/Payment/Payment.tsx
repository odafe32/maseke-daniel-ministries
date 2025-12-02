import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { pickupData } from "@/src/constants/data";
import { fs } from "@/src/utils";

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
  TEXT_LIGHT_GRAY: '#666666',
  MODAL_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  SEARCH_TEXT: '#333',
  ACTIVITY_INDICATOR: '#FF0000',
  PAYSTACK_GREEN: '#00C6A7',
};

interface PaymentUIProps {
  totalAmount: number;
  onBack: () => void;
  onPayNow: () => void;
  isProcessing: boolean;
}

export function PaymentUI({
  totalAmount,
  onBack,
  onPayNow,
  isProcessing,
}: PaymentUIProps) {

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader 
          title="Make Payment" 
          onBackPress={onBack} 
          showCartButton={false} 
        />

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          
          {/* Pickup Card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="bus" size={20} color={COLORS.PRIMARY_BLUE} />
              <ThemeText variant="h4" style={styles.cardTitle}>
                Pick Up
              </ThemeText>
            </View>
            
            <View style={styles.cardRow}>
              <ThemeText variant="body" style={styles.cardText}>
                {pickupData.minister}
              </ThemeText>
            </View>
            
            <View style={styles.cardRow}>
              <ThemeText variant="body" style={styles.cardText}>
                {pickupData.church}
              </ThemeText>
            </View>
            
            <View style={styles.cardRow}>
              <ThemeText variant="body" style={styles.cardText}>
                {pickupData.phone}
              </ThemeText>
            </View>
          </View>

          {/* Payment Method Card */}
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="wallet" size={20} color={COLORS.PRIMARY_BLUE} />
              <ThemeText variant="h4" style={styles.cardTitle}>
                Payment Method
              </ThemeText>
            </View>
            
            <View style={styles.paystackContainer}>
              <Icon name="paystack" size={24} />
              <ThemeText variant="body" style={styles.paystackText}>
                Pay with Paystack
              </ThemeText>
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <ThemeText variant="h4" style={styles.totalText}>
            Total Amount
          </ThemeText>
          <ThemeText variant="h3" style={styles.totalAmount}>
            {"₦" + totalAmount.toFixed(2)}
          </ThemeText>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity 
          style={styles.payButton} 
          onPress={onPayNow}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <>
              <ThemeText variant="h3" style={styles.payButtonText}>
                Pay Now
              </ThemeText>
              <Icon name="cart" size={20} color={COLORS.WHITE} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 120, // Space for fixed footer
  },
  cardsContainer: {
    paddingTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-SemiBold',
    fontSize: fs(18),
  },
  cardText: {
    color: COLORS.TEXT_GRAY,
    fontFamily: 'Geist-Medium',
    fontSize: fs(16),
    flex: 1,
  },
  paystackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  paystackText: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-Medium',
    fontSize: fs(16),
  },

  // Footer Styles
  footer: {
    backgroundColor: COLORS.WHITE,
    borderTopColor: COLORS.BORDER_GRAY,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  payButton: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  payButtonText: {
    color: COLORS.WHITE,
    fontSize: fs(18),
    fontWeight: '600',
  },
});
