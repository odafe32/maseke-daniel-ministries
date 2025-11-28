import React, { useState } from "react";
import { router } from "expo-router";
import { ForgotPassword } from "@/src/screens";
import { useForgotPassword } from "@/src/hooks/auth";
import { showSuccessToast, showErrorToast } from "@/src/utils/toast";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const { mutate: forgotPassword, isLoading } = useForgotPassword();

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

    try {
      await forgotPassword(email);
      showSuccessToast('Success', 'OTP sent to your email. Please check your inbox.');
      console.log('Forgot password successful');
      router.push({ pathname: "/verify", params: { source: "forgot", email } });
    } catch (error: any) {
      console.log('Forgot password error:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error?.response?.status === 422) {
        errorMessage = 'Email not found. Please check your email address.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showErrorToast('Error', errorMessage);
    }
  };

  const handleRefresh = () => {
    setEmail("");
    setEmailError(undefined);
  };

  return (
    <AuthPageWrapper>
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
    </AuthPageWrapper>
  );
}