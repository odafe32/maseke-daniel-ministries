import React from "react";
import { Help } from "@/src/screens";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function HelpPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthPageWrapper>
      <Help
        onBack={handleBack}
      />
    </AuthPageWrapper>
  );
}