import { getColor, hp, wp } from "@/src/utils";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  View,
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
  leftIcon?: ReactNode;
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
  leftIcon,
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
          { backgroundColor: colors.secondary },
          fullWidth && styles.fullWidth,
          disabled && styles.disabledButton,
          style,
        ];
      case "outline":
        return [
          styles.button,
          styles.outlineButton,
          { borderColor: colors.border },
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
      return variant === "outline" ? colors.placeholder : colors.muted;
    }

    switch (variant) {
      case "primary":
        return colors.card;
      case "secondary":
      case "outline":
        return colors.primary;
      default:
        return colors.card;
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
          color={variant === "outline" ? colors.primary : colors.card}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <ThemeText
            variant="button"
            style={[{ color: getTextColor() }, ...(textStyle ? [textStyle] : [])]}
          >
            {title}
          </ThemeText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: hp(52),
    borderRadius: wp(12),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(12),
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(6),
  },
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  disabledButton: {
    backgroundColor: "rgba(12, 21, 76, 0.08)",
  },
  disabledOutlineButton: {
    borderColor: "rgba(12, 21, 76, 0.2)",
  },
});
