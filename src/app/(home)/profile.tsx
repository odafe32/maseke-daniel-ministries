import React, { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Profile } from "@/src/screens";
import { avatarUri, profileActions } from "@/src/constants/data";
import { useRouter } from "expo-router";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { Alert } from "react-native";
import { ConfirmActionSheet } from "@/src/components";
import { useAuthStore } from "@/src/stores/authStore";
import { showSuccessToast } from "@/src/utils/toast";
import { useUser } from '../../hooks/useUser';
import { useProfile } from '../../hooks/useProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user } = useUser();
  const { updateProfile, getProfile, isUpdating, error } = useProfile();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [profile, setProfile] = useState(user ? { name: user.full_name, email: user.email, phone: user.phone_number || "", address: user.address || "" } : { name: "", email: "", phone: "", address: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user?.full_name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formPhone, setFormPhone] = useState(user?.phone_number || "");
  const [formAddress, setFormAddress] = useState(user?.address || "");
  const [formAvatar, setFormAvatar] = useState<string>(user?.avatar || "");
  const [avatar, setAvatar] = useState(avatarUri);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.full_name, email: user.email, phone: user.phone_number || "", address: user.address || "" });
      setFormName(user.full_name);
      setFormEmail(user.email);
      setFormPhone(user.phone_number || "");
      setFormAddress(user.address || "");
      setFormAvatar(user.avatar || "");
      setAvatar(user.avatar_base64 || user.avatar_url || avatarUri);
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored) {
          const notifications = JSON.parse(stored);
          const unread = notifications.filter((n: { read: boolean }) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };
    loadNotifications();
  }, []);

  const handleActionPress = (link: string) => {
    if (!link) return;
    router.push(link);
  };

  const handleEditPress = () => {
    setFormName(profile.name);
    setFormEmail(profile.email);
    setFormPhone(profile.phone);
    setFormAddress(profile.address);
    setFormAvatar(user?.avatar || "");
    setIsEditing(true);
    wrapperRef.current?.replayAnimate();
  };

  const handleCancelEdit = () => {
    setFormName(profile.name);
    setFormEmail(profile.email);
    setFormPhone(profile.phone);
    setFormAddress(profile.address);
    setIsEditing(false);
  };

  const handleBack = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      wrapperRef.current?.reverseAnimate(() => router.back());
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await updateProfile({
        full_name: formName,
        email: formEmail,
        phone_number: formPhone,
        address: formAddress,
        avatar: formAvatar,
      });
      if (error) {
        showSuccessToast('Error', error);
      } else {
        setProfile({ name: formName, email: formEmail, phone: formPhone, address: formAddress });
        // Update avatar with server-returned data (prefer base64 for mobile display)
        if (updatedUser?.avatar_base64) {
          setAvatar(updatedUser.avatar_base64);
        } else if (updatedUser?.avatar_url) {
          setAvatar(updatedUser.avatar_url);
        }
        setIsEditing(false);
        showSuccessToast('Success', 'Profile updated successfully');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showSuccessToast('Error', 'Failed to update profile');
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
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 1024 * 1024) {
        Alert.alert("File too large", "Please select an image smaller than 1MB.");
        return;
      }
      setIsAvatarLoading(true);
      const uri = asset.uri;
      setAvatar(uri);
      const base64 = asset.base64;
      if (base64) {
        setFormAvatar(base64);
      }
      setIsAvatarLoading(false);
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

  const actions = profileActions.map(a => a.id === 'notifications' ? { ...a, badgeCount: unreadCount } : a);

  return (
    <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <Profile
        avatar={avatar}
        name={profile.name}
        email={profile.email}
        actions={actions}
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
          phone: formPhone,
          address: formAddress,
          onNameChange: setFormName,
          onEmailChange: setFormEmail,
          onPhoneChange: setFormPhone,
          onAddressChange: setFormAddress,
          onAvatarPress: handleAvatarPress,
          onSave: handleSaveProfile,
          onDelete: handleDeleteAccount,
          onCancel: handleCancelEdit,
          isSaving: isUpdating,
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