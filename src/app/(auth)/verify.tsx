import React, { useEffect, useState } from "react";
import { Verify } from "@/src/screens";
import { router, useLocalSearchParams } from "expo-router";

const VERIFY_CODE_LENGTH = 6;
const RESEND_INTERVAL = 30; 

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const { source } = useLocalSearchParams<{ source?: string }>();

  useEffect(() => {
    if (timer === 0) return;

    const countdown = setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleVerify = async () => {
    if (code.length !== VERIFY_CODE_LENGTH) return;

    setIsLoading(true);
    try {
 
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const nextRoute = source === "forgot" ? "/createpassword" : "/home";
      router.replace(nextRoute);
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    try {
     
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTimer(RESEND_INTERVAL);
    } catch (error) {
      console.error("Resend code error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.slice(0, VERIFY_CODE_LENGTH));
  };

  const handleCodeComplete = (value: string) => {
    setCode(value.slice(0, VERIFY_CODE_LENGTH));
  };

  const handleRefresh = () => {
    setCode("");
    setTimer(RESEND_INTERVAL);
  };

  return (
    <Verify
      code={code}
      isLoading={isLoading}
      timer={timer}
      onCodeChange={handleCodeChange}
      onCodeComplete={handleCodeComplete}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
    />
  );
}