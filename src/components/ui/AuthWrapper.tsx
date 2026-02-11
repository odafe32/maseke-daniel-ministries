import React, { ReactNode } from "react";
import { PullToRefresh } from "@/src/components";
import { StyleSheet, View, ViewStyle } from "react-native";
import { hp, wp } from "@/src/utils";

interface AuthWrapperProps {
  children: ReactNode;
  bottomActions?: ReactNode;
  onRefresh?: () => void | Promise<void>;
  containerStyle?: ViewStyle;
  fixedBottomActions?: boolean;
}

export const AuthWrapper = ({
  children,
  bottomActions,
  onRefresh,
  containerStyle,
  fixedBottomActions = false,
}: AuthWrapperProps) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  const content = (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.content, fixedBottomActions && styles.contentWithFixedBottom]}>
        {children}
      </View>
      {bottomActions && (
        <View style={[styles.bottomActions, fixedBottomActions && styles.fixedBottomActions]}>
          {bottomActions}
        </View>
      )}
    </View>
  );

  if (onRefresh) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        {content}
      </PullToRefresh>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    gap: hp(24),
  },
  contentWithFixedBottom: {
    paddingBottom: hp(160),
  },
  bottomActions: {
    paddingTop: hp(16),
    gap: hp(16),
  },
  fixedBottomActions: {
    position: "absolute",
    bottom: hp(30),
    left: wp(20),
    right: wp(20),
    backgroundColor: "#FFFFFF",
    paddingBottom: hp(20),
    paddingTop: hp(16),
  },
});