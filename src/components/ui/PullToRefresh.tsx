import React, { useRef, useState, ReactNode } from "react";
import {
  Animated,
  PanResponder,
  PanResponderInstance,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { hp, wp, getColor } from "@/src/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  refreshThreshold?: number;
  containerStyle?: ViewStyle;
  indicatorColor?: string;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  containerStyle,
  indicatorColor,
}: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const colors = getColor();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const resolvedIndicatorColor = indicatorColor || colors.primary;

  return (
    <ScrollView
      style={[styles.container, containerStyle]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[resolvedIndicatorColor]}
          tintColor={resolvedIndicatorColor}
          progressBackgroundColor={colors.card}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
