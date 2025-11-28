import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { LottieLoading } from "./LottieLoading";

interface AuthPageWrapperProps {
  children: React.ReactNode;
}

export const AuthPageWrapper: React.FC<AuthPageWrapperProps> = ({ children }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showLottie, setShowLottie] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLottie(false);
    });
  }, []);

  return (
    <>
      {showLottie && (
        <LottieLoading
          visible={showLottie}
          onAnimationFinish={() => setShowLottie(false)}
        />
      )}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        {children}
      </Animated.View>
    </>
  );
};
