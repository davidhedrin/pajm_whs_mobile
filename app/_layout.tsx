import { ThemeProvider } from "@/hooks/use-theme";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GlobalConfirmModal } from "@/components/confirm-alert";
import { useAuthStore } from "@/hooks/zustand";
import { useResposiveScale } from "@/lib/resposive";
import { Ionicons } from "@expo/vector-icons";
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { rpm, rf } = useResposiveScale();
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

      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, [isAuthLoaded, fontsLoaded, isAuthenticated, segments]);

  if (!isReady) return null;


  const toastConfig: ToastConfig = {
    success: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#34D399',
          borderRadius: rpm(10),
          alignItems: "center"
        }}
        contentContainerStyle={{
          paddingHorizontal: rpm(12),
        }}
        text1Style={{
          fontSize: rf(14),
          fontWeight: 'bold',
        }}
        text2Style={{
          fontSize: rf(13),
          color: '#6B7280',
        }}
        renderTrailingIcon={() => (
          <Ionicons
            name="checkmark-circle-outline"
            size={rf(25)}
            color="#34D399"
            style={{ marginRight: rpm(12) }}
          />
        )}
      />
    ),

    info: (props: BaseToastProps) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#3B82F6',
          borderRadius: rpm(10),
          alignItems: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: rpm(12),
        }}
        text1Style={{
          fontSize: rf(14),
          fontWeight: 'bold',
        }}
        text2Style={{
          fontSize: rf(13),
          color: '#6B7280',
        }}
        renderTrailingIcon={() => (
          <Ionicons
            name="information-circle-outline"
            size={rf(25)}
            color="#3B82F6"
            style={{ marginRight: rpm(12) }}
          />
        )}
      />
    ),

    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#F87171',
          borderRadius: rpm(10),
          alignItems: "center"
        }}
        contentContainerStyle={{
          paddingHorizontal: rpm(12),
        }}
        text1Style={{
          fontSize: rf(14),
          fontWeight: 'bold',
        }}
        text2Style={{
          fontSize: rf(13),
          color: '#6B7280',
        }}
        renderTrailingIcon={() => (
          <Ionicons
            name="warning-outline"
            size={rf(25)}
            color="#F87171"
            style={{ marginRight: rpm(12) }}
          />
        )}
      />
    ),
  };

  return <ThemeProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      <Toast config={toastConfig} />
      <GlobalConfirmModal />
    </GestureHandlerRootView>
  </ThemeProvider>;
}
