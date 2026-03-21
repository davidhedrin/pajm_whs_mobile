import useTheme from "@/hooks/use-theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: ReactNode;
  gradientColors?: [string, string];
}

const ScreenWrapper = ({ children, gradientColors, ...props }: ScreenWrapperProps) => {
  const { colors } = useTheme();

  return (
    <LinearGradient style={{ flex: 1, width: '100%', height: '100%' }} colors={gradientColors || colors.gradients.background}>
      <SafeAreaView className="flex-1" edges={['top']} {...props}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default ScreenWrapper;