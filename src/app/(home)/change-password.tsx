import React, { useRef, useState, useEffect } from "react";
import { ChangePassword } from "@/src/screens";
import { AuthPageWrapper, AuthPageWrapperRef } from "@/src/components/AuthPageWrapper";
import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@/src/components";
import { useProfile } from '../../hooks/useProfile';
import { showSuccessToast } from '../../utils/toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const wrapperRef = useRef<AuthPageWrapperRef>(null);
  const [loading, setLoading] = useState(true);
  const { changePassword, isUpdating } = useProfile();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleOldPasswordChange = (text: string) => {
    setOldPassword(text);
    if (errors.oldPassword) {
      setErrors(prev => ({ ...prev, oldPassword: "" }));
    }
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSave = async () => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!oldPassword) {
      newErrors.oldPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "New passwords do not match.";
    }
    if (newPassword && newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters.";
    }

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      showSuccessToast('Success', 'Password changed successfully!');
      handleBack();
    } catch (err) {
      // Error is handled in the hook and shown via toast
      console.error('Change password failed:', err);
    }
  };

  const handleBack = () => {
    wrapperRef.current?.reverseAnimate(() => router.back());
  };

  if (loading) {
    return (
   <AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
        <View style={styles.container}>
          <Skeleton width={200} height={28} style={{ marginBottom: 30, marginTop: 20 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={50} style={{ marginBottom: 30 }} />
          <Skeleton width="100%" height={48} style={{ borderRadius: 8 }} />
        </View>
      </AuthPageWrapper>
    );
  }

  return (
<AuthPageWrapper ref={wrapperRef} disableLottieLoading={true}>
      <ChangePassword
        onBack={handleBack}
        oldPassword={oldPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showOldPassword={showOldPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        errors={errors}
        isUpdating={isUpdating}
        onOldPasswordChange={handleOldPasswordChange}
        onNewPasswordChange={handleNewPasswordChange}
        onConfirmPasswordChange={handleConfirmPasswordChange}
        onSave={handleSave}
        onToggleOldPassword={() => setShowOldPassword(!showOldPassword)}
        onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
        onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
    </AuthPageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
});
