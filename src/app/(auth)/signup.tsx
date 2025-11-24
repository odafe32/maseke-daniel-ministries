import React, { useState } from "react";
import { router } from "expo-router";
import { Signup } from "@/src/screens";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) =>
    /^\S+@\S+\.\S+$/.test(value.trim());

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push({ pathname: "/verify", params: { source: "signup" } });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setEmail("");
    setEmailError(undefined);
  };

  return (
    <Signup
      email={email}
      emailError={emailError}
      isLoading={isLoading}
      onEmailChange={(value) => {
        setEmail(value);
        if (emailError) setEmailError(undefined);
      }}
      onSubmit={handleSubmit}
      onSignupWithGoogle={() => {}}
      onLoginPress={() => router.push("/login")}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
    />
  );
}
