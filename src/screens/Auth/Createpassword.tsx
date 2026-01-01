import React from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthWrapper,
  BackHeader,
  Button,
  InputField,
  SectionIntro,
} from "@/src/components";
import { CreatePasswordProps } from "@/src/utils";
import { Feather } from "@expo/vector-icons";

export const CreatePassword = ({
  password,
  confirmPassword,
  isLoading,
  passwordError,
  confirmPasswordError,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePasswordVisibility,
  onToggleConfirmVisibility,
  showPassword,
  showConfirmPassword,
  onSubmit,
  onBack,
  onRefresh,
}: CreatePasswordProps) => {
  return (
    <AuthWrapper
      onRefresh={onRefresh}
      fixedBottomActions
      bottomActions={
        <Button
          title="Finish"
          onPress={onSubmit}
          loading={isLoading}
        />
      }
    >
      <BackHeader title="Maseke Daniels Ministries s" onBackPress={onBack} />

      <SectionIntro
        title="Create your password"
        subtitle="Your password should be 6 characters long and contain an uppercase letter."
      />

      <View style={styles.form}>
        <InputField
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry={!showPassword}
          rightIcon={
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#0C154C"
              onPress={onTogglePasswordVisibility}
            />
          }
          errorMessage={passwordError}
        />

        <InputField
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          secureTextEntry={!showConfirmPassword}
          rightIcon={
            <Feather
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color="#0C154C"
              onPress={onToggleConfirmVisibility}
            />
          }
          errorMessage={confirmPasswordError}
        />
      </View>
    </AuthWrapper>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
});