import React from "react";
import { PrivacyPolicy } from "@/src/screens";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthPageWrapper>
      <PrivacyPolicy
        onBack={handleBack}
      />
    </AuthPageWrapper>
  );
}