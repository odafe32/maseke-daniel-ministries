import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/stores/authStore";

export default function ResetAppScreen() {
  const router = useRouter();
  const resetApp = useAuthStore((state) => state.resetApp);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      // Reset the app (clears all storage and state)
      await resetApp();
      
      // Wait a bit to ensure state is fully cleared
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a reload by replacing with the index route
      // The index route will then check storage and redirect to onboarding
      router.replace("/");
      
    } catch (error) {
      console.error("Reset failed:", error);
      setIsResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset App</Text>
      <Text style={styles.desc}>
        This will clear all data and show onboarding again.
      </Text>

      <TouchableOpacity 
        style={[styles.button, isResetting && styles.buttonDisabled]} 
        onPress={handleReset}
        disabled={isResetting}
      >
        {isResetting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Everything</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  desc: {
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    minWidth: 200,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});