import useTheme from "@/hooks/use-theme";
import { useLoadingStore } from "@/hooks/zustand";
import { useResposiveScale } from "@/lib/resposive";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  View,
} from "react-native";

type Props = {
  visible: boolean;
};

const LoadingOverlay: React.FC = () => {
  const visible = useLoadingStore((state) => state.visible);
  const { rw, rh, rpm, rf } = useResposiveScale();
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -25, // naik
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0, // turun
            duration: 600,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      translateY.setValue(0);
    }
  }, [visible]);

  // 🎯 Shadow animasi (ikut perubahan posisi)
  const shadowScale = translateY.interpolate({
    inputRange: [-25, 0],
    outputRange: [0.4, 1], // kecil saat di atas, besar saat di bawah
  });

  const shadowOpacity = translateY.interpolate({
    inputRange: [-25, 0],
    outputRange: [0.2, 0.7],
  });

  return (
    <Modal transparent visible={visible}>
      <View className="flex-1 bg-black/40 justify-center items-center">

        {/* Logo */}
        <Animated.Image
          source={require("../assets/images/splash-icon.png")}
          resizeMode="contain"
          style={{
            transform: [{ translateY }],
            width: rw(45),
            height: rh(45),
          }}
        />

        {/* Shadow */}
        <Animated.View
          className="mt-2 bg-black rounded-full"
          style={{
            width: rw(25),
            height: rh(4),
            opacity: shadowOpacity,
            transform: [{ scaleX: shadowScale }],
          }}
        />
      </View>
    </Modal>
  );
};

export default LoadingOverlay;