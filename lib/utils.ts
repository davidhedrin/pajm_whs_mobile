import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { ToastType } from "react-native-toast-message";

export async function CheckAllStorage() {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log("All Storage:", items);
}

export async function ClearAllStorage() {
  await AsyncStorage.clear();
  console.log("All Storage is Clear");
}

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function ExecuteMinDelay<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  const [result] = await Promise.all([promise, delay(ms)]);

  return result;
}

export const showToast = ({
  type,
  title,
  message,
  visTime = 4000,
}: {
  type: ToastType;
  title: string;
  message: string;
  visTime?: number | undefined;
}) => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    position: "top",
    topOffset: 60,
    visibilityTime: visTime,
  });
};
