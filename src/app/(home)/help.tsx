import React from "react";
import { Help } from "@/src/screens";
import { useRouter } from "expo-router";

export default function HelpPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Help
      onBack={handleBack}
    />
  );
}