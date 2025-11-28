import React from "react";
import { PrivacyPolicy } from "@/src/screens";
import { useRouter } from "expo-router";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <PrivacyPolicy
      onBack={handleBack}
    />
  );
}