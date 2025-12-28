import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { BackHeader, ThemeText, Dropdown } from "@/src/components";

interface GiveProps {
  onBack: () => void;
  giftType: string;
  amount: string;
  onGiftTypeChange: (value: string) => void;
  onAmountChange: (text: string) => void;
  onSubmit: () => void;
  giftTypeOptions: { label: string; value: string }[];
  giftTypeError: string;
  amountError: string;
  isLoading: boolean;
  showPaystack: boolean;
}

export function Give({
  onBack,
  giftType,
  amount,
  onGiftTypeChange,
  onAmountChange,
  onSubmit,
  giftTypeOptions,
  giftTypeError,
  amountError,
  isLoading,
  showPaystack,
}: GiveProps) {

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader title="Giving" onBackPress={onBack}/>

        <View style={styles.content}>
          <ThemeText variant="body" style={styles.description}>
            Give your widow&apos;s mite. Every small act of generosity counts in God&apos;s kingdom.
          </ThemeText>
          
          <View style={styles.formContainer}>
            <View style={styles.formField}>
              <ThemeText variant="body" style={styles.label}>
                Select Gift Type
              </ThemeText>
              <Dropdown
                options={giftTypeOptions}
                selectedValue={giftType}
                onValueChange={onGiftTypeChange}
                placeholder="Select gift type"
              />
              {giftTypeError ? (
                <ThemeText variant="caption" style={styles.errorText}>
                  {giftTypeError}
                </ThemeText>
              ) : null}
            </View>
            
            <View style={styles.formField}>
              <ThemeText variant="body" style={styles.label}>
                Enter Amount (₦)
              </ThemeText>
              <TextInput
                style={[styles.input, amountError && styles.inputError]}
                value={amount}
                onChangeText={onAmountChange}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
                autoCapitalize="none"
              />
              {amountError ? (
                <ThemeText variant="caption" style={styles.errorText}>
                  {amountError}
                </ThemeText>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
          onPress={onSubmit}
          disabled={isLoading}
          activeOpacity={isLoading ? 1 : 0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <ThemeText variant="body" style={styles.continueButtonText}>
                Processing...
              </ThemeText>
            </View>
          ) : (
            <ThemeText variant="body" style={styles.continueButtonText}>
              Proceed
            </ThemeText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 24,
  },
  content: {
    gap: 30,
  },
  description: {
    lineHeight: 24,
    color: "#424242",
    textAlign: "left",
    fontFamily: "Geist-Regular",
  },
  formContainer: {
    gap: 16,
  },
  formField: {
    gap: 4,
  },
  label: {
    fontFamily: "Geist-Medium",
    color: "#121116",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Geist-Regular",
    color: "#121116",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    backgroundColor: "#0C154C",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontFamily: "Geist-SemiBold",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 1,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontFamily: "Geist-Medium",
  },
  continueButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.7,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});