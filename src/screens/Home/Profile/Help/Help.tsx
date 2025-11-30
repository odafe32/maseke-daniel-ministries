import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <BackHeader title="Get Help" onBackPress={onBack} />

      <View style={styles.content}>
        <ThemeText variant="h5" style={styles.title}>
          Need Assistance?
        </ThemeText>

        <ThemeText variant="body" style={styles.description}>
          We're here to help you get the most out of our app. Send us your feedback, questions, or suggestions.
        </ThemeText>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={onFullNameChange}
            errorMessage={errors.fullName}
          />

          <InputField
            label="Email"
            placeholder="Enter your email address"
            value={email}
            onChangeText={onEmailChange}
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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

          <Button
            title="Send Feedback"
            onPress={onSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />
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