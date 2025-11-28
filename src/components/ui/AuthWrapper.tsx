import React, { ReactNode } from "react";
import { PullToRefresh } from "@/src/components";
import { StyleSheet, View, ViewStyle } from "react-native";
import { hp } from "@/src/utils";

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
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    gap: 24,
  },
  contentWithFixedBottom: {
    paddingBottom: hp(160), 
  },
  bottomActions: {
    paddingTop: 16,
    gap: 16,
  },
  fixedBottomActions: {
    position: 'absolute',
    bottom: hp(30),
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    paddingBottom: hp(20),
    paddingTop: hp(16),
  },
});
