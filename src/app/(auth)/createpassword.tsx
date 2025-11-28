import React, { useState, useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { CreatePassword } from "@/src/screens";
import { createPassword } from "@/src/api/authAPi";
import { showErrorToast, showSuccessToast } from "@/src/utils/toast";
import { Animated } from "react-native";

const MIN_PASSWORD_LENGTH = 8;

export default function CreatePasswordPage() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      await createPassword(email!, password, confirmPassword);
      showSuccessToast('Success', 'Account created successfully. Please login.');
      console.log('Password creation successful');
      router.replace('/login');
    } catch (error: any) {
      console.log('Create password error:', error);
      showErrorToast('Error', error?.response?.data?.message || 'Failed to create account. Please try again.');
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
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
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
    </Animated.View>
  );
}