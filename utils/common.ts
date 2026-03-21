import AsyncStorage from "@react-native-async-storage/async-storage";

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
