import React from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarColor?: string;
  barStyle?: "dark-content" | "light-content" | "default";
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = "#FFFFFF",
  statusBarColor = "transparent",
  barStyle = "dark-content",
}) => {
  const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 0;

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={statusBarColor}
        translucent={true}
      />

      {Platform.OS === "android" && (
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor }} />
      )}

      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
