import { getColor, wp } from "@/utils";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface PaginationDotsProps {
  length: number;
  activeIndex: number;
  style?: ViewStyle;
}

export const PaginationDots = ({
  length,
  activeIndex,
  style,
}: PaginationDotsProps) => {
  const colors = getColor();

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex
              ? [styles.activeDot, { backgroundColor: colors.primary }]
              : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: wp(20),
  },
  dot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    marginHorizontal: wp(4),
  },
  activeDot: {
    width: wp(24),
  },
  inactiveDot: {
    backgroundColor: "#E8E9F1",
  },
});
