import { fs, getColor,  hp,  wp } from "@/src/utils";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { ThemeText } from "./ThemeText";
import { Icon } from "@/src/components";
import { useSafeNavigation } from "@/src/hooks/useSafeNavigation";

interface BackHeaderProps {
  title: string;
  onBackPress?: () => void;
  onMorePress?: () => void;
  onRefreshPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showBackButton?: boolean;
  showMoreButton?: boolean;
  showCartButton?: boolean;
  showRefreshButton?: boolean;
  cartCount?: number; 
}

export const BackHeader = ({
  title,
  onBackPress,
  onMorePress,
  onRefreshPress,
  containerStyle,
  titleStyle,
  showBackButton = true,
  showMoreButton = false,
  showCartButton = false,
  showRefreshButton = false,
  cartCount = 0, // Default to 0 items
}: BackHeaderProps) => {
  const router = useRouter();
  const { back, push } = useSafeNavigation();
  const colors = getColor();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    // Trigger scale animation
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start(() => {
      // Reset scale after animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    });

    if (onBackPress) {
      onBackPress();
      return;
    }

    back();
  };

  const handleMore = () => {
    if (onMorePress) {
      onMorePress();
      return;
    }

    back();
  };

  const handleRefresh = () => {
    if (onRefreshPress) {
      onRefreshPress();
    }
  };

  const handleCart = () => {
    push("/cart");
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.sideColumn}>
        {showBackButton ? (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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
          </Animated.View>
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

      {showRefreshButton ? (
        <Pressable
          onPress={handleRefresh}
          style={[
            styles.backButton,
            { backgroundColor: "#fff" },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="refresh-ccw" size={22} color={colors.primary} />
        </Pressable>
      ) : showCartButton ? (
        <Pressable
          onPress={handleCart}
          style={[
            styles.backButton,
            { backgroundColor: "#fff" },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View style={styles.cartIconContainer}>
            <Icon name="cart" size={22} color={colors.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <ThemeText variant="caption" style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </ThemeText>
              </View>
            )}
          </View>
        </Pressable>
      ) : showMoreButton ? (
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
    paddingTop: wp(20),
    paddingBottom: wp(10),
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
  cartIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    alignItems: "center",
    backgroundColor: '#007AFF',
    borderRadius: wp(10),
    height: hp(15),
    justifyContent: "center",
    width: wp(15),
    paddingHorizontal: 4,
    position: "absolute",
    right: -6,
    top: -6,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: fs(10),
    fontWeight: "500",
    lineHeight: hp(12),
    textAlign: "center",
    fontFamily: "Geist-SemiBold",
  },
});
