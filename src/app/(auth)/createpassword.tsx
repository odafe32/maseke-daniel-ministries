import React, { useState, useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { CreatePassword } from "@/src/screens";
import { createPassword, resetPassword } from "@/src/api/authAPi";
import { showErrorToast, showSuccessToast } from "@/src/utils/toast";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { useAuthStore } from "@/src/stores/authStore";


const MIN_PASSWORD_LENGTH = 8;

export default function CreatePasswordPage() {
  const { email, source } = useLocalSearchParams<{ email: string; source?: string }>();
  const { user } = useAuthStore();

  if (user) {
    router.replace('/home');
    return null;
  }

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "Password is required";
    }
    if (value.trim().length < MIN_PASSWORD_LENGTH) {
      return "Password must be at least 8 characters";
    }
    return undefined;
  };

  const handleSubmit = async () => {
    const passwordValidation = validatePassword(password);
    const confirmValidation =
      confirmPassword !== password ? "Passwords do not match" : undefined;

    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmValidation);

    if (passwordValidation || confirmValidation) {
      return;
    }

    try {
      setIsLoading(true);
      if (source === "reset") {
        await createPassword(email!, password, confirmPassword);
        showSuccessToast('Success', 'Password reset successfully. Please login with your new password.');
        console.log('Password reset successful');
      } else {
        await createPassword(email!, password, confirmPassword);
        showSuccessToast('Success', 'Account created successfully. Please login.');
        console.log('Password creation successful');
      }
      router.replace('/login');
    } catch (error: any) {
      console.log('Password error:', error);
      let errorMessage = source === "reset" ? 'Failed to reset password. Please try again.' : 'Failed to create account. Please try again.';
      if (error?.response?.status === 422) {
        errorMessage = 'Email has already been used.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showErrorToast('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setPassword("");
    setConfirmPassword("");
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <AuthPageWrapper>
      <CreatePassword
        password={password}
        confirmPassword={confirmPassword}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        isLoading={isLoading}
        passwordError={passwordError}
        confirmPasswordError={confirmPasswordError}
        onPasswordChange={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(undefined);
        }}
        onConfirmPasswordChange={(value) => {
          setConfirmPassword(value);
          if (confirmPasswordError) setConfirmPasswordError(undefined);
        }}
        onTogglePasswordVisibility={() => setShowPassword((prev) => !prev)}
        onToggleConfirmVisibility={() =>
          setShowConfirmPassword((prev) => !prev)
        }
        onSubmit={handleSubmit}
        onBack={() => router.back()}
        onRefresh={handleRefresh}
      />
    </AuthPageWrapper>
  );
}