import { getColor, wp } from "@/src/utils";
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
              ? [styles.activeDot, { backgroundColor: "#63637A" }]
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
    marginVertical: wp(7),
  },
  dot: {
    width: wp(25),
    height: wp(6),
    borderRadius: wp(4),
    marginHorizontal: wp(2),
  },
  activeDot: {
    width: wp(64),
  },
  inactiveDot: {
    backgroundColor: "#D9D9D9",
  },
});
