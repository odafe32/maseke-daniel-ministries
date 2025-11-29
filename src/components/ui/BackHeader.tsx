import { getColor, hp, wp } from "@/src/utils";
import { useRouter } from "expo-router";
import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ThemeText } from "./ThemeText";

interface BackHeaderProps {
  title: string;
  onBackPress?: () => void;
  onMorePress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showBackButton?: boolean;
  showMoreButton?: boolean;
}

export const BackHeader = ({
  title,
  onBackPress,
  onMorePress,
  containerStyle,
  titleStyle,
  showBackButton = true,
  showMoreButton = false,
}: BackHeaderProps) => {
  const router = useRouter();
  const colors = getColor();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/index");
    }
  };

  const handleMore = () => {
    if (onMorePress) {
      onMorePress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/index");
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.sideColumn}>
        {showBackButton ? (
          <Pressable
            onPress={handleBack}
            style={[
              styles.backButton,
              { backgroundColor: "#fff" },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="chevron-left" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      <ThemeText
        variant="h2"
        style={[
          styles.title,
          { color: colors.primary },
          ...(titleStyle ? [titleStyle] : []),
        ]}
      >
        {title}
      </ThemeText>

      {showMoreButton ? (
        <Pressable
          onPress={handleMore}
          style={[
            styles.backButton,
            { backgroundColor: "#fff" },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="menu" size={22} color={colors.primary} />
        </Pressable>
      ) : <View style={styles.sideColumn} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 10,
  },
  sideColumn: {
    width: wp(52),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backButton: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: wp(18),
    textAlign: "center",
    fontFamily: "DMSans-Bold",
    flex: 1,
  },
});
