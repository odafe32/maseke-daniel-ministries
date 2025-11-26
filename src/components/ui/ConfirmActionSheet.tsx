import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { ThemeText } from "./ThemeText";
import { getColor, hp, wp } from "@/src/utils";
import { Feather } from "@expo/vector-icons";

interface ConfirmActionSheetProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancelLabel?: string;
  confirmIcon?: ReactNode;
  isLoading?: boolean;
}

export const ConfirmActionSheet = ({
  visible,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  cancelLabel = "Cancel",
  confirmIcon,
  isLoading = false,
}: ConfirmActionSheetProps) => {
  const colors = getColor();

  return (
    <BottomSheet visible={visible} onClose={onCancel} dismissible={!isLoading}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          {confirmIcon || (
            <Feather name="alert-triangle" size={36} color="#C47200" />
          )}
        </View>

        <ThemeText variant="h4" centered style={styles.title}>
          {title}
        </ThemeText>
    <View style={styles.descriptionContainer}>
        <ThemeText variant="body" centered color={colors.muted} style={styles.description}>
          {description}
        </ThemeText>
        </View>

        <View style={styles.actions}>
          <Button
            title={cancelLabel}
            variant="outline"
            onPress={onCancel}
            disabled={isLoading}
            style={{ borderColor: colors.primary }}
            textStyle={{ color: colors.primary }}
          />

          <Button
            title={confirmLabel}
            onPress={onConfirm}
            loading={isLoading}
            style={{ backgroundColor: colors.error }}
            textStyle={{ color: colors.card }}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: hp(12),
  },
  iconWrapper: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(12),
  },
  title: {
    marginBottom: hp(8),
    color: "#717171",
  },
  descriptionContainer:{
display: "flex",
alignItems: "center",
justifyContent: "center",
  },
  description: {
    width: wp(300),
    marginBottom: hp(24),
    fontFamily: "DMSans-Medium",
  },
  actions: {
    gap: hp(12),
  },
});
