import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDeviceToken, saveDeviceToken } from "./notif-service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

type RegisterTokenRespon = {
  new_token: string;
  old_token: string | null;
};
export async function registerForPushNotification(): Promise<RegisterTokenRespon | null> {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Notification permission is denied!");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;

    const oldToken = await getDeviceToken();
    if (!oldToken) {
      await saveDeviceToken(token);
      return { new_token: token, old_token: null };
    }

    if (oldToken !== token) {
      await saveDeviceToken(token);
      return { new_token: token, old_token: oldToken };
    }

    return { new_token: token, old_token: null };
  } catch (error) {
    throw error;
  }
}
