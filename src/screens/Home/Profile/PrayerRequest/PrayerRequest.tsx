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
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const nameFieldAnim = useRef(new Animated.Value(0)).current;
  const emailFieldAnim = useRef(new Animated.Value(0)).current;
  const messageFieldAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

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
      // Title - fade in with scale
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      // Name field - slide from left
      Animated.spring(nameFieldAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Email field - slide from right
      Animated.spring(emailFieldAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      // Message field - slide from left
      Animated.spring(messageFieldAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
      // Buttons - fade and slide up
      Animated.spring(buttonsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 500,
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
        <BackHeader title="Prayer Requests" onBackPress={onBack}/>
      </Animated.View>

      <View style={styles.content}>
        {/* Animated Title */}
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [
              {
                scale: titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          }}
        >
          <ThemeText variant="h5" style={styles.title}>
            Send a Prayer Request
          </ThemeText>
        </Animated.View>

        <View style={styles.formContainer}>
          {/* Animated Name Field */}
          <Animated.View
            style={{
              opacity: nameFieldAnim,
              transform: [
                {
                  translateX: nameFieldAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            }}
          >
            <ThemeText variant="body" style={styles.label}>
              Full Name
            </ThemeText>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              value={name}
              onChangeText={onNameChange}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
            {nameError ? (
              <ThemeText variant="caption" style={styles.errorText}>
                {nameError}
              </ThemeText>
            ) : null}
          </Animated.View>

          {/* Animated Email Field */}
          <Animated.View
            style={{
              opacity: emailFieldAnim,
              transform: [
                {
                  translateX: emailFieldAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
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
          </Animated.View>

          {/* Animated Message Field */}
          <Animated.View
            style={{
              opacity: messageFieldAnim,
              transform: [
                {
                  translateX: messageFieldAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            }}
          >
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
          </Animated.View>

          {/* Animated Buttons */}
          <Animated.View
            style={{
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
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
          </Animated.View>
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
    marginTop: 4,
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