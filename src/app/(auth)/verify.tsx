import React, { useEffect, useState } from "react";
import { Verify } from "@/src/screens";
import { router, useLocalSearchParams } from "expo-router";
import { verifyOtp, register, verifyOtpPassword } from "@/src/api/authAPi";
import { showErrorToast, showSuccessToast } from "@/src/utils/toast";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

const VERIFY_CODE_LENGTH = 6;
const RESEND_INTERVAL = 30; 

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const { source, email, full_name } = useLocalSearchParams<{ source?: string; email?: string; full_name?: string }>();

  useEffect(() => {
    if (timer === 0) return;

    const countdown = setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleVerify = async () => {
    if (code.length !== VERIFY_CODE_LENGTH || !email) return;

    setIsLoading(true);
    try {
      if (source === "forgot") {
        await verifyOtpPassword(email, code);
        showSuccessToast('Success', 'OTP verified. You can now reset your password.');
        router.push({ pathname: "/createpassword", params: { email, source: "reset" } });
      } else {
        await verifyOtp(email, code);
        showSuccessToast('Success', 'OTP verified successfully.');
        router.push({ pathname: "/createpassword", params: { email, full_name } });
      }
    } catch (error) {
      console.log('Verification error:', error);
      showErrorToast('Error', 'Incorrect OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email || !full_name) return;

    setIsLoading(true);
    try {
      await register(email, full_name);
      showSuccessToast('Success', 'OTP resent to your email.');
      setTimer(RESEND_INTERVAL);
    } catch (error) {
      console.log('Resend error:', error);
      showErrorToast('Error', 'Failed to resend OTP.');
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
    <AuthPageWrapper>
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
    </AuthPageWrapper>
  );
}