import React, { useState } from "react";
import { router } from "expo-router";
import { ForgotPassword } from "@/src/screens";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email is required";
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return "Please enter a valid email";
    }
    return undefined;
  };

  const handleSubmit = async () => {
    const validation = validateEmail(email);
    setEmailError(validation);

    if (validation) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push({ pathname: "/verify", params: { source: "forgot" } });
    } catch (error) {
      console.error("Forgot password error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setEmail("");
    setEmailError(undefined);
  };

  return (
    <ForgotPassword
      email={email}
      emailError={emailError}
      isLoading={isLoading}
      onEmailChange={(value) => {
        setEmail(value);
        if (emailError) setEmailError(undefined);
      }}
      onSubmit={handleSubmit}
      onSignupPress={() => router.push("/login")}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
    />
  );
}