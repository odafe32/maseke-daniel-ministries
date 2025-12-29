import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
} from "react-native";

import { BackHeader, ThemeText, InputField, Button } from "@/src/components";
import { getColor } from "@/src/utils";

interface HelpProps {
  onBack: () => void;
  fullName: string;
  email: string;
  message: string;
  isSubmitting: boolean;
  errors: {
    fullName: string;
    email: string;
    message: string;
  };
  onFullNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onMessageChange: (text: string) => void;
  onSubmit: () => void;
}

export function Help({
  onBack,
  fullName,
  email,
  message,
  isSubmitting,
  errors,
  onFullNameChange,
  onEmailChange,
  onMessageChange,
  onSubmit,
}: HelpProps) {
  const colors = getColor();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descriptionAnim = useRef(new Animated.Value(0)).current;
  const fullNameAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
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
      // Title - fade in with scale
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      // Description - fade in
      Animated.spring(descriptionAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
      // Full Name field - slide from left
      Animated.spring(fullNameAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      // Email field - slide from right
      Animated.spring(emailAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
      // Message field - slide from left
      Animated.spring(messageAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 400,
        useNativeDriver: true,
      }),
      // Button - fade and slide up
      Animated.spring(buttonAnim, {
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
                outputRange: [8, 0],
              }),
            },
          ],
        }}
      >
        <BackHeader title="Get Help" onBackPress={onBack} />
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
            Need Assistance?
          </ThemeText>
        </Animated.View>

        {/* Animated Description */}
        <Animated.View
          style={{
            opacity: descriptionAnim,
          }}
        >
          <ThemeText variant="body" style={styles.description}>
            We're here to help you get the most out of our app. Send us your feedback, questions, or suggestions.
          </ThemeText>
        </Animated.View>

        <View style={styles.form}>
          {/* Animated Full Name Field */}
          <Animated.View
            style={{
              opacity: fullNameAnim,
              transform: [
                {
                  translateX: fullNameAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            }}
          >
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={onFullNameChange}
              errorMessage={errors.fullName}
            />
          </Animated.View>

          {/* Animated Email Field */}
          <Animated.View
            style={{
              opacity: emailAnim,
              transform: [
                {
                  translateX: emailAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
            <InputField
              label="Email"
              placeholder="Enter your email address"
              value={email}
              onChangeText={onEmailChange}
              errorMessage={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          {/* Animated Message Field */}
          <Animated.View
            style={{
              opacity: messageAnim,
              transform: [
                {
                  translateX: messageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            }}
          >
            <InputField
              label="Message"
              placeholder="Tell us how we can help you..."
              value={message}
              onChangeText={onMessageChange}
              errorMessage={errors.message}
              multiline
              numberOfLines={4}
              style={styles.messageInput}
            />
          </Animated.View>

          {/* Animated Button */}
          <Animated.View
            style={{
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <Button
              title="Send Feedback"
              onPress={onSubmit}
              loading={isSubmitting}
              style={styles.submitButton}
            />
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
    gap: 20,
  },
  title: {
    textAlign: "left",
    fontFamily: "Geist-SemiBold",
    color: "#000000",
  },
  description: {
    lineHeight: 24,
    color: "#424242",
    textAlign: "left",
  },
  form: {
    gap: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
  },
});