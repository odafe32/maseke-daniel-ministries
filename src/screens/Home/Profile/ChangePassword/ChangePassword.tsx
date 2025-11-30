import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="Change Password" onBackPress={onBack} />

      <View style={styles.card}>
        <View style={styles.content}>
          <ThemeText variant="h4" style={styles.title}>
            Change Your Password
          </ThemeText>

          <View style={styles.form}>
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
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Change Password"
          onPress={onSave}
          loading={isUpdating}
          style={styles.saveButton}
        />
      </View>
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
