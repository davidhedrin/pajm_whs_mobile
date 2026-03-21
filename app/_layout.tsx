import { ThemeProvider } from "@/hooks/use-theme";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuthStore } from "@/hooks/zustand";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, loadAuth, isAuthLoaded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    async function prepare() {
      if (!isAuthLoaded || !fontsLoaded) return;

      const inAuthGroup = segments[0] === "(auth)";

      if (!isAuthenticated && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        router.replace("/(tabs)");
      }

      // 🔥 baru tampilkan UI
      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, [isAuthLoaded, fontsLoaded, isAuthenticated, segments]);

  if (!isReady) return null;

  return <ThemeProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  </ThemeProvider>;
}
