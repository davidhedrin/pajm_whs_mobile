import { ThemeProvider } from "@/hooks/use-theme";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GlobalConfirmModal } from "@/components/confirm-alert";
import LoadingOverlay from "@/components/loading";
import { useAuthStore } from "@/hooks/zustand";
import { registerForPushNotification } from "@/lib/notif-permission";
import { UpdateUsersTokenDevice } from "@/lib/notif-service";
import { useResposiveScale } from "@/lib/resposive";
import { toastConfigs } from "@/lib/toast-config";
import * as Notifications from "expo-notifications";
import Toast from 'react-native-toast-message';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scales = useResposiveScale();
  const segments = useSegments();
  const { isAuthenticated, loadAuth, isAuthLoaded } = useAuthStore();
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
        router.replace("/(auth)");
      } else if (isAuthenticated && inAuthGroup) {
        router.replace("/(tabs)");
      }

      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, [isAuthLoaded, fontsLoaded, isAuthenticated, segments]);

  useEffect(() => {
    if (!isReady) return;
    let notificationListener: any;

    async function initNotification() {
      const result = await registerForPushNotification();

      if (result && isAuthenticated) {
        await UpdateUsersTokenDevice(result.new_token, result.old_token);
      }
    };
    initNotification();

    async function checkInitialNotification() {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response) {
        const data: any = response.notification.request.content.data;
        if (data?.screen) {
          router.push({
            pathname: data.screen,
            params: data.parameter ?? {}
          });
        }
      }
    }
    checkInitialNotification();

    notificationListener = Notifications.addNotificationResponseReceivedListener(res => {
      const data: any = res.notification.request.content.data;
      if (data?.screen) {
        router.push({
          pathname: data.screen,
          params: data.parameter ?? {}
        });
      }
    });

    //   tokenListener = Notifications.addPushTokenListener(async token => {
    //     try {
    //       const newToken = token.data;
    //       const existToken = await getDeviceToken();

    //       if (!existToken) {
    //         await saveDeviceToken(newToken);
    //         await UpdateUsersTokenDevice(newToken);
    //       } else if (existToken !== newToken) {
    //         saveDeviceToken(newToken);
    //         await UpdateUsersTokenDevice(newToken, existToken);
    //       }
    //     } catch (error) {
    //       showToast({
    //         type: "info",
    //         title: "Notify Token",
    //         message: "Update notif token failed"
    //       });
    //     }
    //   });

    return () => {
      notificationListener?.remove();
      // tokenListener?.remove();
    };
  }, [isReady, isAuthenticated]);

  if (!isReady) return null;

  return <ThemeProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />

      <Toast config={toastConfigs({ scales })} />
      <GlobalConfirmModal />

      <LoadingOverlay />
    </GestureHandlerRootView>
  </ThemeProvider>;
}
