import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

interface LottieLoadingProps {
  visible: boolean;
  onAnimationFinish?: () => void;
}

export const LottieLoading: React.FC<LottieLoadingProps> = ({
  visible,
  onAnimationFinish,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <LottieView
        source={require("../assets/loading.json")}
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottie: {
    width: 200,
    height: 200,
  },
});
