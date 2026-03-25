import { ThemeProvider } from "@/hooks/use-theme";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GlobalConfirmModal } from "@/components/confirm-alert";
import { useAuthStore } from "@/hooks/zustand";
import { Ionicons } from "@expo/vector-icons";
import Toast, {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  ToastConfig,
} from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();
const toastConfig: ToastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#34D399',
        borderRadius: 10,
        alignItems: "center"
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 15,
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="checkmark-circle-outline"
          size={28}
          color="#34D399"
          style={{ marginRight: 12 }}
        />
      )}
    />
  ),

  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        borderRadius: 10,
        alignItems: 'center',
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 15,
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="information-circle-outline"
          size={28}
          color="#3B82F6"
          style={{ marginRight: 12 }}
        />
      )}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#F87171',
        borderRadius: 12,
        alignItems: "center"
      }}
      contentContainerStyle={{
        paddingHorizontal: 10,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
      }}
      text2Style={{
        fontSize: 15,
        color: '#6B7280',
      }}
      renderTrailingIcon={() => (
        <Ionicons
          name="warning-outline"
          size={28}
          color="#F87171"
          style={{ marginRight: 12 }}
        />
      )}
    />
  ),
};

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

      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, [isAuthLoaded, fontsLoaded, isAuthenticated, segments]);

  if (!isReady) return null;

  return <ThemeProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      <Toast config={toastConfig} />
      <GlobalConfirmModal />
    </GestureHandlerRootView>
  </ThemeProvider>;
}
