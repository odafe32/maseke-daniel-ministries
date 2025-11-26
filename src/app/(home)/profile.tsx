import React from "react";
import { Profile } from "@/src/screens";
import { avatarUri, profileActions } from "@/src/constants/data";
import { useRouter } from "expo-router";

const MOCK_USER = {
  name: "Samuel Bishop",
  email: "example@gmail.com",
};

export default function ProfilePage() {
  const router = useRouter();

  const handleActionPress = (link: string) => {
    if (!link) return;
    router.push(link);
  };

  return (
    <Profile
      avatar={avatarUri}
      name={MOCK_USER.name}
      email={MOCK_USER.email}
      actions={profileActions}
      onBack={() => router.back()}
      onActionPress={handleActionPress}
    />
  );
}