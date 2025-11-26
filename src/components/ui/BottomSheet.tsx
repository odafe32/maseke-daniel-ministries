import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleProp,
  StyleSheet,
  PanResponder,
  PanResponderGestureState,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { getColor, wp } from "@/src/utils";

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissible?: boolean;
  backdropOpacity?: number;
  containerStyle?: StyleProp<ViewStyle>;
  maxHeightRatio?: number; // between 0 and 1
}

export const BottomSheet = ({
  visible,
  onClose,
  children,
  dismissible = true,
  backdropOpacity = 0.35,
  containerStyle,
  maxHeightRatio = 0.75,
}: BottomSheetProps) => {
  const colors = getColor();
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(0).current;

  const maxHeight = useMemo(
    () => SCREEN_HEIGHT * Math.min(Math.max(maxHeightRatio, 0.3), 0.95),
    [maxHeightRatio]
  );

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      onClose();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 4,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            backdrop.setValue(backdropOpacity * (1 - gestureState.dy / (SCREEN_HEIGHT * 0.75)));
          }
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.8) {
            animateClose();
            return;
          }
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(backdrop, {
              toValue: backdropOpacity,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
    [animateClose, backdrop, backdropOpacity, translateY]
  );

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: backdropOpacity,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      animateClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={animateClose}>
      <View style={styles.wrapper}>
        <TouchableWithoutFeedback onPress={dismissible ? animateClose : undefined}>
          <Animated.View
            style={[styles.backdrop, { backgroundColor: colors.text, opacity: backdrop }]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, transform: [{ translateY }] },
            { maxHeight },
            containerStyle,
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.grabberWrapper}>
            <View style={styles.grabber} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    paddingHorizontal: wp(20),
    paddingBottom: wp(24),
    paddingTop: wp(8),
  },
  grabberWrapper: {
    alignItems: "center",
    paddingVertical: wp(8),
  },
  grabber: {
    width: wp(52),
    height: wp(5),
    borderRadius: wp(3),
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
