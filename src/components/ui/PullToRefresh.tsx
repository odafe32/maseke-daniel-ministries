import React, { useState, ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {  getColor } from "@/src/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  refreshThreshold?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  indicatorColor?: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  containerStyle,
  contentContainerStyle,
  indicatorColor,
  onScroll,
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
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
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
      onScroll={onScroll}
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
