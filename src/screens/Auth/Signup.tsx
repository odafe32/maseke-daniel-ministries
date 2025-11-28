import React from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import {
  AuthWrapper,
  BackHeader,
  Button,
  InputField,
  SectionIntro,
} from "@/src/components";
import { SignupProps } from "@/src/utils";
import { FontAwesome } from "@expo/vector-icons";

export const Signup = ({
  email,
  fullName,
  emailError,
  fullNameError,
  isLoading,
  onEmailChange,
  onFullNameChange,
  onSubmit,
  onSignupWithGoogle,
  onLoginPress,
  onBack,
  onRefresh,
}: SignupProps) => {
  return (
    <AuthWrapper
      onRefresh={onRefresh}
    >
      <BackHeader title="Grace Dimensions" onBackPress={onBack} />

      <SectionIntro
        title="Join the Community of Grace"
        subtitle="Enter your details below to create your very own account and start watching."
        actionLabel="Log in"
        onActionPress={onLoginPress}
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
          autoComplete="email"
          textContentType="emailAddress"
        />
        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          value={fullName}
          onChangeText={onFullNameChange}
          errorMessage={fullNameError}
          autoComplete="name"
          textContentType="name"
        />
 
      </View>

      <View style={{ height: 230 }} />
          <View style={styles.actions}>
        <Button
          title="Create Account"
          onPress={onSubmit}
          loading={isLoading}
        />
        <Button
          title="Sign up with Google"
          variant="outline"
          onPress={onSignupWithGoogle}
          leftIcon={<FontAwesome name="google" size={18} color="#DB4437" />}
        />
      </View>

    </AuthWrapper>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 8,
    gap: 16,
  },
  actions: {
    gap: 12,
  },
});
