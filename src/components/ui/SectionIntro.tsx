import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { ThemeText } from "./ThemeText";
import { TextLink } from "./TextLink";
import { fs, getColor, hp, wp } from "@/src/utils";

interface SectionIntroProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  containerStyle?: ViewStyle;
}

export const SectionIntro = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  containerStyle,
}: SectionIntroProps) => {
  const colors = getColor();

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headingRow}>
        <Text style={styles.title}>
          {title}
        </Text>
        {actionLabel && onActionPress ? (
          <TextLink
            text={actionLabel}
            onPress={onActionPress}
            textStyle={styles.actionText}
          />
        ) : null}
      </View>

      {subtitle ? (
        <ThemeText variant="body"  style={styles.subtitle}>
          {subtitle}
        </ThemeText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: hp(8),
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: wp(10),
  },
  title: {
    flex: 1,
    fontFamily: "SpaceGrotesk-SemiBold",
    fontSize: fs(18),
  },
  subtitle: {
    lineHeight: hp(22),
    color: "#424242",
    fontFamily: "DMSans-Regular",
  },
  actionText: {
    color: "#2B46E5",
    textDecorationLine: "underline",
  },
});
