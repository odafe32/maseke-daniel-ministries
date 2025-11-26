import React from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthWrapper,
  BackHeader,
  Button,
  InputField,
  SectionIntro,
} from "@/src/components";
import { ForgotPasswordProps } from "@/src/utils";

export function ForgotPassword({
  email,
  emailError,
  isLoading,
  onEmailChange,
  onSubmit,
  onSignupPress,
  onBack,
  onRefresh,
}: ForgotPasswordProps) {
  return (
    <AuthWrapper
      onRefresh={onRefresh}
      fixedBottomActions
      bottomActions={
        <Button
          title="Send code"
          onPress={onSubmit}
          loading={isLoading}
        />
      }
    >
      <BackHeader title="Grace Dimensions" onBackPress={onBack} />

      <SectionIntro
        title="Let’s get you back in"
        subtitle="Forgot your password? Share your registered email address and we will share your One-Time Passcode OTP."
        actionLabel="Log in "
        onActionPress={onSignupPress}
      />

      <View style={styles.form}>
        <InputField
          label="Email"
          placeholder="example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={onEmailChange}
          errorMessage={emailError}
        />
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 12,
    gap: 16,
  },
}); 