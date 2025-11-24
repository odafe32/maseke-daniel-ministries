import React, { useState } from "react";
import { router } from "expo-router";
import { CreatePassword } from "@/src/screens";

const MIN_PASSWORD_LENGTH = 6;

export default function CreatePasswordPage() {
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
      return "Password must be at least 6 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Include at least one uppercase letter";
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

    setIsLoading(true);
    try {
      // TODO: Hook up to real API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/");
    } catch (error) {
      console.error("Create password error:", error);
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
  );
}