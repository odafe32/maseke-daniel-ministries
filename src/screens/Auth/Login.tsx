import { AuthWrapper, BackHeader, Button, InputField, SectionIntro, TextLink } from "@/src/components";
import { LoginProps } from "@/src/utils";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export const Login = ({
  email,
  password,
  showPassword,
  emailError,
  passwordError,
  isLoading,
  isEmailOnlyLoading = false,
  loginMethod,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onEmailOnlySelect,
  onTraditionalSelect,
  onEmailOnlyLogin,
  onTraditionalLogin,
  onRefresh,
  onSignupPress,
  onForgotPasswordPress,
}: LoginProps) => {
  const handleRefresh = onRefresh;
  return (
    <AuthWrapper 
      onRefresh={handleRefresh}
      fixedBottomActions={true}
      bottomActions={
        <View style={styles.actions}>
          {loginMethod === 'email-only' ? (
            <Button
              title="Continue"
              onPress={onEmailOnlyLogin}
              loading={isEmailOnlyLoading}
            />
          ) : (
            <>
              <Button
                title="Log in"
                onPress={onTraditionalLogin}
                loading={isLoading}
              />
              <Button
                title="Sign in with email"
                onPress={onEmailOnlySelect}
                variant="outline"
                textStyle={{ color: "#0C154C" }}
              />
            </>
          )}

          {loginMethod === 'email-only' && (
            <Button
              title="Back to password login"
              onPress={onTraditionalSelect}
              variant="outline"
              textStyle={{ color: "#0C154C" }}
            />
          )}
        </View>
      }
    >
      <BackHeader title="Maseke Daniels Ministries" showBackButton={false} />

      <SectionIntro
        title="Welcome home,"
        subtitle="Log back into your Maseke Danielapp and continue watching live sermons."
        actionLabel="Sign up"
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

        {loginMethod === 'traditional' && (
          <>
            <InputField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!showPassword}
              rightIcon={
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#0C154C"
                  onPress={onTogglePassword}
                />
              }
              errorMessage={passwordError}
            />

            <TextLink
              text="Forgot Password"
              onPress={onForgotPasswordPress}
              style={styles.forgotLink}
            />
          </>
        )}
      </View>

    </AuthWrapper>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  forgotLink: {
    alignSelf: "flex-start",
    marginTop: -8,
  },
  actions: {
    gap: 16,
  },
});
