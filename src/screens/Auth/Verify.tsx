import React from "react";
import { StyleSheet, View } from "react-native";
import {
  AuthWrapper,
  BackHeader,
  Button,
  OtpCodeInput,
  SectionIntro,
  TextLink,
  ThemeText,
} from "@/src/components";
import { VerifyProps } from "@/src/utils";

export const Verify = ({
  code,
  isLoading,
  timer,
  onCodeChange,
  onCodeComplete,
  onVerify,
  onResend,
  onBack,
  onRefresh,
}: VerifyProps) => {
  const isCodeComplete = code.length === 6;
  const canResend = timer === 0;

  return (
    <AuthWrapper
      onRefresh={onRefresh}
      fixedBottomActions
      bottomActions={
        <Button
          title="Verify Account"
          onPress={onVerify}
          loading={isLoading}
          disabled={!isCodeComplete || isLoading}
        />
      }
    >
      <BackHeader title="Grace Dimensions" onBackPress={onBack} />

      <SectionIntro
        title="Let’s get you verified!"
        subtitle="A code has been sent to your registered email address."
      />

      <View style={styles.card}>
        <ThemeText variant="label" style={styles.label}>
          Verification code
        </ThemeText>

        <OtpCodeInput
          value={code}
          onChange={onCodeChange}
          onComplete={onCodeComplete}
          length={6}
        />

        <View style={styles.resendRow}>
          <ThemeText variant="caption" color="#94A3B8">
            {canResend
              ? "Didn’t get the code?"
              : `Resend code in 0:${timer.toString().padStart(2, "0")}`}
          </ThemeText>
          <TextLink
            text="Resend code"
            onPress={onResend}
            disabled={!canResend}
            style={styles.resendLink}
            textStyle={styles.resendText}
          />
        </View>
      </View>
    </AuthWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontFamily: "SpaceGrotesk-SemiBold",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resendLink: {
    paddingHorizontal: 0,
    color: "#2B46E5",
  },
  resendText: {
    fontSize: 14,
    color: "#2B46E5",
  },
});