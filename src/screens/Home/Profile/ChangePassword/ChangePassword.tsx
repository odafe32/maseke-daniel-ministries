import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { BackHeader, ThemeText, InputField, Button } from "@/src/components";
import { fs, getColor } from "@/src/utils";

export function ChangePassword({ onBack }: { onBack: () => void }) {
  const colors = getColor();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Password changed successfully!");
      onBack();
    }, 2000);
  };

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
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <InputField
              label="New Password"
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <InputField
              label="Confirm New Password"
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Change Password"
          onPress={handleSave}
          loading={isLoading}
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
