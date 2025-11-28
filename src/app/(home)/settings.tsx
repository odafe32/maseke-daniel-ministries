import React from 'react';
import { Settings } from '@/src/screens/Home/Profile/Settings';
import { settingsData } from '@/src/constants/data';
import { useRouter } from "expo-router";

export default function SettingsPage() {
  const router = useRouter();
    
  const handleBack = () => {
    router.back();
  };

  return (
    <Settings onBack={handleBack} settingsData={settingsData} />
  );
}