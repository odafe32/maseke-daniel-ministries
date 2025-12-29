import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

import { BackHeader, ThemeText, InputField, Button } from "@/src/components";
import { getColor } from "@/src/utils";
import { Ionicons } from '@expo/vector-icons';

interface ChangePasswordProps {
  onBack: () => void;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  showOldPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  errors: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  isUpdating: boolean;
  onOldPasswordChange: (text: string) => void;
  onNewPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onSave: () => void;
  onToggleOldPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
}

export function ChangePassword({
  onBack,
  oldPassword,
  newPassword,
  confirmPassword,
  showOldPassword,
  showNewPassword,
  showConfirmPassword,
  errors,
  isUpdating,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSave,
  onToggleOldPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
}: ChangePasswordProps) {
  const colors = getColor();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const oldPasswordAnim = useRef(new Animated.Value(0)).current;
  const newPasswordAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

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
      // Card - scale and fade in
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      // Title - fade in
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      // Old password field - slide from left
      Animated.spring(oldPasswordAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      // New password field - slide from right
      Animated.spring(newPasswordAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
      // Confirm password field - slide from left
      Animated.spring(confirmPasswordAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 500,
        useNativeDriver: true,
      }),
      // Button - slide up
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
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
        <BackHeader title="Change Password" onBackPress={onBack} />
      </Animated.View>

      {/* Animated Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardAnim,
            transform: [
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.content}>
          {/* Animated Title */}
          <Animated.View
            style={{
              opacity: titleAnim,
            }}
          >
            <ThemeText variant="h4" style={styles.title}>
              Change Your Password
            </ThemeText>
          </Animated.View>

          <View style={styles.form}>
            {/* Animated Old Password Field */}
            <Animated.View
              style={{
                opacity: oldPasswordAnim,
                transform: [
                  {
                    translateX: oldPasswordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              }}
            >
              <InputField
                label="Current Password"
                placeholder="Enter current password"
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={onOldPasswordChange}
                errorMessage={errors.oldPassword}
                rightIcon={
                  <TouchableOpacity onPress={onToggleOldPassword}>
                    <Ionicons
                      name={showOldPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                }
              />
            </Animated.View>

            {/* Animated New Password Field */}
            <Animated.View
              style={{
                opacity: newPasswordAnim,
                transform: [
                  {
                    translateX: newPasswordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              }}
            >
              <InputField
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={onNewPasswordChange}
                errorMessage={errors.newPassword}
                rightIcon={
                  <TouchableOpacity onPress={onToggleNewPassword}>
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                }
              />
            </Animated.View>

            {/* Animated Confirm Password Field */}
            <Animated.View
              style={{
                opacity: confirmPasswordAnim,
                transform: [
                  {
                    translateX: confirmPasswordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  },
                ],
              }}
            >
              <InputField
                label="Confirm New Password"
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                errorMessage={errors.confirmPassword}
                rightIcon={
                  <TouchableOpacity onPress={onToggleConfirmPassword}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                }
              />
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Animated Button */}
      <Animated.View
        style={[
          styles.actions,
          {
            opacity: buttonAnim,
            transform: [
              {
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Button
          title="Change Password"
          onPress={onSave}
          loading={isUpdating}
          style={styles.saveButton}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    flexGrow: 1,
  },
  content: {
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontFamily: "Geist-SemiBold",
    color: "#0C154C",
  },
  form: {
    gap: 16,
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
    width: "100%",
  },
  saveButton: {
    marginTop: 8,
  },
});
