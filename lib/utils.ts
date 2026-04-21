import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Toast, { ToastType } from "react-native-toast-message";
import { SistemOrg } from "./model-type";

export const orgLable: Record<SistemOrg, string> = {
  PAJM: "Pemalang Aji Jaya Maritimindo",
  LCS: "Lentera Cipta Samudra"
};

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

export function formatDate(
  dateString: string | Date | null | undefined,
  dtStyle?: "short" | "full" | "long" | "medium",
  tmStyle?: "short" | "full" | "long" | "medium",
) {
  if (!dateString) return "Invalid Format";

  const date = new Date(
    typeof dateString === "string" ? dateString.replace(" ", "T") : dateString,
  );

  if (isNaN(date.getTime())) return "Invalid Format";

  const dateFormatter = dtStyle
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: dtStyle })
    : null;

  const timeFormatter = tmStyle
    ? new Intl.DateTimeFormat("id-ID", { timeStyle: tmStyle })
    : null;

  const formattedDate = dateFormatter ? dateFormatter.format(date) : "";
  const formattedTime = timeFormatter ? `, ${timeFormatter.format(date)}` : "";

  return tmStyle ? `${formattedDate}${formattedTime}` : formattedDate;
}

export function useDefaultState<T>(defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);

  const reset = () => setState(defaultValue);

  return [state, setState, reset] as const;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
