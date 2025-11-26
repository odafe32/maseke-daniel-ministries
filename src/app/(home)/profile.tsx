import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Profile } from "@/src/screens";
import { avatarUri, profileActions } from "@/src/constants/data";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { ConfirmActionSheet } from "@/src/components";

const MOCK_USER = {
  name: "Samuel Bishop",
  email: "example@gmail.com",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(MOCK_USER.name);
  const [formEmail, setFormEmail] = useState(MOCK_USER.email);
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState(avatarUri);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const handleActionPress = (link: string) => {
    if (!link) return;
    router.push(link);
  };

  const handleEditPress = () => {
    setFormName(profile.name);
    setFormEmail(profile.email);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormName(profile.name);
    setFormEmail(profile.email);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      router.back();
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProfile({ name: formName, email: formEmail });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteSheet(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteSheet(false);
    Alert.alert("Deleted", "Account deleted (mock action)");
  };

  const handleAvatarPress = async () => {
    if (isAvatarLoading) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setIsAvatarLoading(true);
      const uri = result.assets[0].uri;
      setAvatar(uri);
      setTimeout(() => setIsAvatarLoading(false), 500);
    }
  };

  return (
    <>
      <Profile
        avatar={avatar}
        name={profile.name}
        email={profile.email}
        actions={profileActions}
        onBack={handleBack}
        onActionPress={handleActionPress}
        onEditPress={handleEditPress}
        isEditing={isEditing}
        editForm={{
          avatar,
          name: formName,
          email: formEmail,
          onNameChange: setFormName,
          onEmailChange: setFormEmail,
          onAvatarPress: handleAvatarPress,
          onSave: handleSaveProfile,
          onDelete: handleDeleteAccount,
          onCancel: handleCancelEdit,
          isSaving,
          isAvatarLoading,
        }}
      />
      <ConfirmActionSheet
        visible={showDeleteSheet}
        title="Are you sure?"
        description="Your account will be permanently deleted. You can sign up again anytime, but previous data cannot be restored"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteSheet(false)}
      />
    </>
  );
}