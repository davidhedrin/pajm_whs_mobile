import { ThemeProvider } from "@/hooks/use-theme";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GlobalConfirmModal } from "@/components/confirm-alert";
import LoadingOverlay from "@/components/loading";
import { useAuthStore } from "@/hooks/zustand";
import { useResposiveScale } from "@/lib/resposive";
import { toastConfigs } from "@/lib/toast-config";
import Toast from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scales = useResposiveScale();
  const { isAuthenticated, loadAuth, isAuthLoaded } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),

    PoppinsItalic: require("../assets/fonts/Poppins-Italic.ttf"),
    PoppinsMediumItalic: require("../assets/fonts/Poppins-MediumItalic.ttf"),
    PoppinsSemiBoldItalic: require("../assets/fonts/Poppins-SemiBoldItalic.ttf"),
    PoppinsBoldItalic: require("../assets/fonts/Poppins-BoldItalic.ttf"),
  });

  useEffect(() => {
    const load = async () => {
      await loadAuth();
    };

    load();
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

      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, [isAuthLoaded, fontsLoaded, isAuthenticated, segments]);

  if (!isReady) return null;

  return <ThemeProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      <Toast config={toastConfigs({scales})} />
      <GlobalConfirmModal />

      <LoadingOverlay />
    </GestureHandlerRootView>
  </ThemeProvider>;
}
