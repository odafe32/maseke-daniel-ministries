import React, { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Signup } from "@/src/screens";
import { register } from "@/src/api/authAPi";
import { showSuccessToast, showErrorToast } from "@/src/utils/toast";
import { Animated } from "react-native";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [fullNameError, setFullNameError] = useState<string | undefined>();
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

    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      return;
    }

    if (fullName.trim().length < 2) {
      setFullNameError("Full name must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    try {
      await register(email, fullName);
      showSuccessToast('Success', 'OTP sent to your email. Please verify.');
      console.log('Signup successful');
      router.push({ pathname: "/verify", params: { source: "signup", email, full_name: fullName } });
    } catch (error) {
      showErrorToast('Error', 'Signup failed. Please try again.');
      console.log('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setEmail("");
    setFullName("");
    setEmailError(undefined);
    setFullNameError(undefined);
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Signup
        email={email}
        fullName={fullName}
        emailError={emailError}
        fullNameError={fullNameError}
        isLoading={isLoading}
        onEmailChange={(value) => {
          setEmail(value);
          if (emailError) setEmailError(undefined);
        }}
        onFullNameChange={(value: string) => {
          setFullName(value);
          if (fullNameError) setFullNameError(undefined);
        }}
        onSubmit={handleSubmit}
        onSignupWithGoogle={() => {}}
        onLoginPress={() => router.push("/login")}
        onBack={() => router.back()}
        onRefresh={handleRefresh}
      />
    </Animated.View>
  );
}
