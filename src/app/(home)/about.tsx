import React from "react";
import { About } from "@/src/screens";
import { useRouter } from "expo-router";

export default function AboutPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <About
      onBack={handleBack}
    />
  );
}