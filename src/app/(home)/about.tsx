import React from "react";
import { About } from "@/src/screens";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function AboutPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthPageWrapper>
      <About
        onBack={handleBack}
      />
    </AuthPageWrapper>
  );
}