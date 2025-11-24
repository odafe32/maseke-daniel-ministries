import { fs, getColor } from "@/src/utils";
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
}

export const TextLink = ({
  text,
  onPress,
  textStyle,
  style,
}: TextLinkProps) => {
  const colors = getColor();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: colors.primary }, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  text: {
    fontFamily: "DMSans-Medium",
    fontSize: fs(16),
    textAlign: "center",
  },
});
