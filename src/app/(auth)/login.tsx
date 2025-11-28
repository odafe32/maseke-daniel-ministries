import { Login } from "@/src/screens";
import { router } from "expo-router";
import React, { useState } from "react";
import { useLogin } from "@/src/hooks/auth";
import { showErrorToast, showSuccessToast } from "@/src/utils/toast";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const { mutate: login, isLoading: hookLoading } = useLogin();
  const [loginMethod, setLoginMethod] = useState<'traditional' | 'email-only'>('traditional');

  const validateEmail = (value: string) =>
    /^\S+@\S+\.\S+$/.test(value.trim());

  const handleEmailOnlyLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    if (!hasError) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push({ pathname: "/verify", params: { source: "login" } });
      } catch (error) {
        console.error("Email login error:", error);
      }
    }
  };

  const handleTraditionalLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (!hasError) {
      try {
        await login(email, password);
        showSuccessToast('Success', 'Login successful');
        console.log('Login successful');
        router.replace("/home");
      } catch (error) {
        console.log('Login error:', error);
        showErrorToast('Error', 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleRefresh = async () => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setLoginMethod('traditional');
  };

  return (
    <AuthPageWrapper>
      <Login
        email={email}
        password={password}
        showPassword={showPassword}
        emailError={emailError}
        passwordError={passwordError}
        isLoading={hookLoading}
        loginMethod={loginMethod}
        onEmailChange={(value) => {
          setEmail(value);
          if (emailError) setEmailError(undefined);
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(undefined);
        }}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onEmailOnlySelect={() => setLoginMethod('email-only')}
        onTraditionalSelect={() => setLoginMethod('traditional')}
        onEmailOnlyLogin={handleEmailOnlyLogin}
        onTraditionalLogin={handleTraditionalLogin}
        onRefresh={handleRefresh}
        onSignupPress={() => router.push("/signup")}
        onForgotPasswordPress={() => router.push("/forgotpassword")}
      />
    </AuthPageWrapper>
  );
}
