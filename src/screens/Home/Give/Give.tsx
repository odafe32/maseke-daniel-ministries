import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
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
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const descriptionAnim = useRef(new Animated.Value(0)).current;
  const giftTypeAnim = useRef(new Animated.Value(0)).current;
  const amountAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(100)).current;

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
      // Description - fade in
      Animated.timing(descriptionAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      // Gift type field - slide from left
      Animated.spring(giftTypeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Amount field - slide from right
      Animated.spring(amountAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      // Footer - slide from bottom
      Animated.spring(footerAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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
          <BackHeader title="Giving" onBackPress={onBack}/>
        </Animated.View>

        <View style={styles.content}>
          {/* Animated Description */}
          <Animated.View
            style={{
              opacity: descriptionAnim,
              transform: [
                {
                  scale: descriptionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            }}
          >
            <ThemeText variant="body" style={styles.description}>
              Give your widow&apos;s mite. Every small act of generosity counts in God&apos;s kingdom.
            </ThemeText>
          </Animated.View>

          <View style={styles.formContainer}>
            {/* Animated Gift Type Field */}
            <Animated.View
              style={{
                opacity: giftTypeAnim,
                transform: [
                  {
                    translateX: giftTypeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              }}
            >
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
            </Animated.View>

            {/* Animated Amount Field */}
            <Animated.View
              style={{
                opacity: amountAnim,
                transform: [
                  {
                    translateX: amountAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                zIndex:-1,
              }}
            >
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
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* Animated Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            transform: [
              {
                translateY: footerAnim,
              },
            ],
          },
        ]}
      >
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
      </Animated.View>
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