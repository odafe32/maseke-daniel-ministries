import { getColor, hp, wp } from "@/utils";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { ThemeText } from "./ThemeText";

export type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
  ...rest
}: ButtonProps) => {
  const colors = getColor();

  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [
          styles.button,
          { backgroundColor: colors.primary },
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
        ];
      case "secondary":
        return [
          styles.button,
          styles.secondaryButton,
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
        ];
      case "outline":
        return [
          styles.button,
          styles.outlineButton,
          { borderColor: colors.primary },
          fullWidth && styles.fullWidth,
          disabled && styles.disabledOutlineButton,
          style,
        ];
      default:
        return [
          styles.button,
          { backgroundColor: colors.primary },
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
        ];
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return variant === "outline" ? "#C4C4C4" : "#FFFFFF";
    }

    switch (variant) {
      case "primary":
        return "#FFFFFF";
      case "secondary":
      case "outline":
        return colors.primary;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? colors.primary : "#FFFFFF"}
        />
      ) : (
        <ThemeText
          variant="button"
          style={[{ color: getTextColor() }, ...(textStyle ? [textStyle] : [])]}
        >
          {title}
        </ThemeText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: hp(52),
    borderRadius: wp(8),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(12),
  },
  fullWidth: {
    width: "100%",
  },
  secondaryButton: {
    backgroundColor: "#E8E9F1",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: "#E8E9F1",
  },
  disabledOutlineButton: {
    borderColor: "#C4C4C4",
  },
});
