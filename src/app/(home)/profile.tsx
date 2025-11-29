import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Profile } from "@/src/screens";
import { avatarUri, profileActions } from "@/src/constants/data";
import { useRouter } from "expo-router";
import { AuthPageWrapper } from "@/src/components/AuthPageWrapper";
import { Alert } from "react-native";
import { ConfirmActionSheet } from "@/src/components";
import { useAuthStore } from "@/src/stores/authStore";
import { showSuccessToast } from "@/src/utils/toast";
import { useUser } from '../../hooks/useUser';

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user } = useUser();
  const [profile, setProfile] = useState(user ? { name: user.full_name, email: user.email } : { name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.full_name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState(avatarUri);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.full_name, email: user.email });
      setFormName(user.full_name);
      setFormEmail(user.email);
    }
  }, [user]);

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

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      showSuccessToast('Success', 'Logged out successfully');
      setShowLogoutModal(false);
      
      // Explicitly navigate to login screen to ensure redirect
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1000); // Small delay to show the success toast
      
    } catch (error) {
      console.error('Logout failed:', error);
      showSuccessToast('Error', 'Failed to logout');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <AuthPageWrapper disableLottieLoading={true}>
      <Profile
        avatar={avatar}
        name={profile.name}
        email={profile.email}
        actions={profileActions}
        onBack={handleBack}
        onActionPress={handleActionPress}
        onLogout={handleLogout}
        onLogoutPress={handleLogoutPress}
        onLogoutCancel={handleLogoutCancel}
        showLogoutModal={showLogoutModal}
        logoutLoading={logoutLoading}
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
        visible={showLogoutModal}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmLabel="Logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={logoutLoading}
      />
      <ConfirmActionSheet
        visible={showDeleteSheet}
        title="Are you sure?"
        description="Your account will be permanently deleted. You can sign up again anytime, but previous data cannot be restored"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteSheet(false)}
      />
    </AuthPageWrapper>
  );
}