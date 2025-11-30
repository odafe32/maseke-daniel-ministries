import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Animated } from "react-native";
import { LottieLoading } from "./LottieLoading";

interface AuthPageWrapperProps {
  children: React.ReactNode;
  disableLottieLoading?: boolean;
}

export interface AuthPageWrapperRef {
  reverseAnimate: (callback?: () => void) => void;
  replayAnimate: () => void;
}

export const AuthPageWrapper = forwardRef<AuthPageWrapperRef, AuthPageWrapperProps>(({ children, disableLottieLoading = false }, ref) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showLottie, setShowLottie] = useState(!disableLottieLoading);

  useImperativeHandle(ref, () => ({
    reverseAnimate: (callback) => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (callback) callback();
      });
    },
    replayAnimate: () => {
      // Reset to initial values
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      // Animate forward
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
      ]).start();
    },
  }));

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
      if (!disableLottieLoading) {
        setShowLottie(false);
      }
    });
  }, [disableLottieLoading]);

  return (
    <>
      {!disableLottieLoading && showLottie && (
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
});
