import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { BackHeader, ThemeText, Icon } from "@/src/components";
import { PickupStation } from "@/src/constants/data";
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
  pickupStations: PickupStation[];
  selectedPickupStationId: string | null;
  onSelectPickupStation: (id: string) => void;
  totalCartAmount: number;
  onBack: () => void;
  onPayNow: () => void;
  isProcessing: boolean;
  isLoadingStations?: boolean;
}

export function PaymentUI({
  pickupStations,
  selectedPickupStationId,
  onSelectPickupStation,
  totalCartAmount,
  onBack,
  onPayNow,
  isProcessing,
  isLoadingStations = false,
}: PaymentUIProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selected = pickupStations.find((s) => s.id === selectedPickupStationId) || null;

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

            {/* Dropdown selector */}
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setDropdownOpen((v) => !v)}
              disabled={isLoadingStations}
            >
              {isLoadingStations ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY_BLUE} />
              ) : (
                  !selected ? (
                    <ThemeText variant="body" style={styles.cardText}>
                      Select pickup station
                    </ThemeText>
                  ) : (
                    <>
                      <ThemeText variant="body" style={styles.cardText}>
                        Location: {selected.title}
                      </ThemeText>
                      <ThemeText variant="body" style={styles.cardText}>
                        Address: {selected.address}
                      </ThemeText>
                      <ThemeText variant="body" style={styles.cardText}>
                        Name: {selected.name}
                      </ThemeText>
                      <ThemeText variant="body" style={styles.cardText}>
                        Phone: {selected.contact_phone}
                      </ThemeText>
                    </>
                  )
              )}
              <Icon name={'chevronDown'} size={18} color={COLORS.TEXT_GRAY} />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                {pickupStations.map((station) => (
                  <TouchableOpacity
                    key={station.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onSelectPickupStation(station.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <ThemeText variant="body" style={styles.dropdownTitle}>{station.title}</ThemeText>
                    <ThemeText variant="bodySmall" style={styles.dropdownSubtitle}>{station.address}</ThemeText>
                    <ThemeText variant="bodySmall" style={styles.dropdownSubtitle}>{station.name}</ThemeText>
                    <ThemeText variant="bodySmall" style={styles.dropdownMeta}>{station.contact_phone}</ThemeText>
                  </TouchableOpacity>
                ))}
                {pickupStations.length === 0 && !isLoadingStations && (
                  <View style={styles.dropdownEmpty}> 
                    <ThemeText variant="bodySmall" style={styles.dropdownMeta}>No pickup stations found</ThemeText>
                  </View>
                )}
              </View>
            )}
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
          <ThemeText variant="h3" style={styles.totalCartAmount}>
            {"₦" + totalCartAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    fontFamily: 'Geist',
    fontSize: fs(16),
    flex: 1,
    width: "100%",
  },
  selectBox: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdown: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_GRAY,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_GRAY,
  },
  dropdownTitle: {
    color: COLORS.TEXT_DARK,
    fontFamily: 'Geist-Medium',
  },
  dropdownSubtitle: {
    color: COLORS.TEXT_GRAY,
  },
  dropdownMeta: {
    color: COLORS.TEXT_LIGHT_GRAY,
  },
  dropdownEmpty: {
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  totalCartAmount: {
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
