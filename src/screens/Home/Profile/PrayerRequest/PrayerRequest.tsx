import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { BackHeader, ThemeText } from "@/src/components";

interface PrayerRequestProps {
  onBack: () => void;
  name: string;
  email: string;
  message: string;
  onNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  nameError: string;
  emailError: string;
  messageError: string;
  isLoading: boolean;
}

export function PrayerRequest({
  onBack,
  name,
  email,
  message,
  onNameChange,
  onEmailChange,
  onMessageChange,
  onSubmit,
  onCancel,
  nameError,
  emailError,
  messageError,
  isLoading,
}: PrayerRequestProps) {

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="Prayer Requests" onBackPress={onBack}/>

      <View style={styles.content}>
        <ThemeText variant="h5" style={styles.title}>
          Send a Prayer Request
        </ThemeText>
        
        <View style={styles.formContainer}>
          <ThemeText variant="body" style={styles.label}>
            Name
          </ThemeText>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            value={name}
            onChangeText={onNameChange}
            placeholder="Enter your name"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
          {nameError ? (
            <ThemeText variant="caption" style={styles.errorText}>
              {nameError}
            </ThemeText>
          ) : null}
          
          <ThemeText variant="body" style={styles.label}>
            Email Address
          </ThemeText>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            value={email}
            onChangeText={onEmailChange}
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <ThemeText variant="caption" style={styles.errorText}>
              {emailError}
            </ThemeText>
          ) : null}
          
          <ThemeText variant="body" style={styles.label}>
            Prayer Message
          </ThemeText>
          <TextInput
            style={[styles.input, styles.textArea, messageError && styles.inputError]}
            value={message}
            onChangeText={onMessageChange}
            placeholder="Enter your prayer request"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {messageError ? (
            <ThemeText variant="caption" style={styles.errorText}>
              {messageError}
            </ThemeText>
          ) : null}
          
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={onSubmit}
            disabled={isLoading}
            activeOpacity={isLoading ? 1 : 0.8}
          >
            <View style={styles.buttonContent}>
              {isLoading && (
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={styles.spinner} 
                />
              )}
              <ThemeText variant="body" style={styles.sendButtonText}>
                {isLoading ? "Sending..." : "Send Request"}
              </ThemeText>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <ThemeText variant="body" style={styles.cancelButtonText}>
              Cancel
            </ThemeText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 24,
  },
  content: {
    gap: 30,
  },
  title: {
    textAlign: "left",
    fontFamily: "Geist-SemiBold",
    color: "#000000",
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontFamily: "Geist-Medium",
    color: "#121116",
    marginBottom: -8,
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
  textArea: {
    height: 200,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: "#0C154C",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontFamily: "Geist-SemiBold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontFamily: "Geist-Medium",
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
    marginTop: -8,
  },
  sendButtonDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginRight: 8,
  },
});