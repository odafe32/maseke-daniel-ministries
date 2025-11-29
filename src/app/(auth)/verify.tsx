import React, { useEffect, useState } from "react";
import { Verify } from "@/src/screens";
import { router, useLocalSearchParams } from "expo-router";
import { verifyOtp, register, verifyOtpPassword, otpLogin, forgotPassword, verifyOtpLogin } from "@/src/api/authAPi";
import { showErrorToast, showSuccessToast } from "@/src/utils/toast";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { useAuthStore } from "@/src/stores/authStore";


const VERIFY_CODE_LENGTH = 6;
const RESEND_INTERVAL = 30; 

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const { source, email, full_name } = useLocalSearchParams<{ source?: string; email?: string; full_name?: string }>();
  const { token } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to home
    if (token) {
      router.replace("/home");
    }
  }, [token]);

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
      } else if (source === "login") {
        const result = await verifyOtpLogin(email, code);
        showSuccessToast('Success', 'Login successful.');
        console.log('Login successful');
        router.replace("/home");
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
    if (timer > 0 || !email) return;

    setIsResending(true);
    try {
      if (source === "forgot") {
        // Resend forgot password OTP
        await forgotPassword(email);
        showSuccessToast('Success', 'OTP resent to your email.');
      } else if (source === "login") {
        // Resend login OTP
        await otpLogin(email);
        showSuccessToast('Success', 'OTP resent to your email.');
      } else if (full_name) {
        // Resend registration OTP
        await register(email, full_name);
        showSuccessToast('Success', 'OTP resent to your email.');
      }
      setTimer(RESEND_INTERVAL);
    } catch (error) {
      console.log('Resend error:', error);
      showErrorToast('Error', 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
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
        isResending={isResending}
      />
    </AuthPageWrapper>
  );
}