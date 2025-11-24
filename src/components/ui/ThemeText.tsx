import { fs, getColor, hp } from "@/src/utils";
import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "body"
  | "bodyBold"
  | "bodySmall"
  | "caption"
  | "button"
  | "label"
  | "paragraph";

interface ThemeTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  centered?: boolean;
  semiBold?: boolean;
  bold?: boolean;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

export const ThemeText = ({
  variant = "body",
  color,
  centered = false,
  semiBold = false,
  bold = false,
  style,
  children,
  ...rest
}: ThemeTextProps) => {
  const colors = getColor();
  const defaultColor = color || colors.text;

  const getFontFamily = () => {
    if (variant === "h1" || variant === "h2") {
      return "SpaceGrotesk-Bold";
    }
    if (variant === "h3" || variant === "h4") {
      return "SpaceGrotesk-SemiBold";
    }
    if (variant === "h5") {
      return "SpaceGrotesk-Medium";
    }

    if (bold || variant === "button" || variant === "bodyBold") {
      return "DMSans-Bold";
    }

    if (semiBold || variant === "label") {
      return "DMSans-Medium";
    }

    return "DMSans-Regular";
  };

  const getBaseStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: defaultColor,
      fontFamily: getFontFamily(),
    };

    if (centered) {
      baseStyle.textAlign = "center";
    }

    switch (variant) {
      case "h1":
        return {
          ...baseStyle,
          fontSize: fs(32),
          lineHeight: hp(40),
          letterSpacing: -0.5,
        };
      case "h2":
        return {
          ...baseStyle,
          fontSize: fs(28),
          lineHeight: hp(36),
        };
      case "h3":
        return {
          ...baseStyle,
          fontSize: fs(24),
          lineHeight: hp(32),
        };
      case "h4":
        return {
          ...baseStyle,
          fontSize: fs(20),
          lineHeight: hp(28),
        };
      case "h5":
        return {
          ...baseStyle,
          fontSize: fs(18),
          lineHeight: hp(26),
        };
      case "body":
        return {
          ...baseStyle,
          fontSize: fs(16),
          lineHeight: hp(24),
        };
      case "bodyBold":
        return {
          ...baseStyle,
          fontSize: fs(16),
          lineHeight: hp(24),
        };
      case "bodySmall":
        return {
          ...baseStyle,
          fontSize: fs(14),
          lineHeight: hp(20),
        };
      case "caption":
        return {
          ...baseStyle,
          fontSize: fs(12),
          lineHeight: hp(16),
        };
      case "button":
        return {
          ...baseStyle,
          fontSize: fs(16),
          lineHeight: hp(22),
        };
      case "label":
        return {
          ...baseStyle,
          fontSize: fs(14),
          lineHeight: hp(18),
        };
      case "paragraph":
        return {
          ...baseStyle,
          fontSize: fs(16),
          lineHeight: hp(24),
          marginBottom: hp(12),
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Text style={[getBaseStyle(), style]} {...rest}>
      {children}
    </Text>
  );
};
