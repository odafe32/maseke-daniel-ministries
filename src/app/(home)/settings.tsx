import React from 'react';
import { Settings } from '@/src/screens/Home/Profile/Settings';
import { settingsData } from '@/src/constants/data';
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";

export default function SettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthPageWrapper>
      <Settings
        onBack={handleBack}
        settingsData={settingsData}
      />
    </AuthPageWrapper>
  );
}