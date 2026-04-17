import useTheme from "@/hooks/use-theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: ReactNode;
  gradientColors?: [string, string];
  scrollable?: boolean;
  refreshControlAction?: () => Promise<void>
}

const ScreenWrapper = ({ children, gradientColors, scrollable = true, refreshControlAction, ...props }: ScreenWrapperProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const onRefresh = async () => {
    if (!refreshControlAction) return;

    setRefreshing(true);
    try {
      await refreshControlAction();
    } catch (err) {
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <LinearGradient
      style={{ flex: 1, width: "100%", height: "100%" }}
      colors={gradientColors || colors.gradients.background}
    >
      <SafeAreaView className="flex-1" edges={["top"]} {...props}>
        {
          scrollable ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                refreshControlAction ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
              }
            >
              {children}
            </ScrollView>
          ) : (
            <>{children}</>
          )
        }
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ScreenWrapper;