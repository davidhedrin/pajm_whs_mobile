import { useRef } from "react";
import { Animated } from "react-native";

export type scaleAnimationProps = {
  scale: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
};

export const useScaleAnimation = (
  scaleTo: number = 0.95,
): scaleAnimationProps => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return {
    scale,
    onPressIn,
    onPressOut,
  };
};
