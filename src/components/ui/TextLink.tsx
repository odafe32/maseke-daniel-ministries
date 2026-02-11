import { fs, getColor, wp } from "@/src/utils";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface TextLinkProps {
  text: string;
  onPress: () => void;
  textStyle?: TextStyle;
  style?: ViewStyle;
  disabled?: boolean;
}

export const TextLink = ({
  text,
  onPress,
  textStyle,
  style,
  disabled = false,
}: TextLinkProps) => {
  const colors = getColor();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          { color: disabled ? colors.muted : colors.primary },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp(10),
  },
  text: {
    fontFamily: "DMSans-Medium",
    fontSize: fs(16),
    textAlign: "center",
  },
});
