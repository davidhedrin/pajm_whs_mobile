import { SourceStatisPrPo } from "@/lib/model-type";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_KEY = "RECENTLY_VIEWED";
const MAX_ITEMS = 10;

export interface RecentItem {
  id: number;
  doc_num: string;
  name: string;
  date: Date | null;

  source: SourceStatisPrPo;
  module_url: string;
}

export const saveRecentItem = async (newItem: RecentItem) => {
  try {
    const existing = await AsyncStorage.getItem(RECENT_KEY);
    let items: RecentItem[] = existing ? JSON.parse(existing) : [];

    // ❗ hapus jika sudah ada (biar tidak duplicate)
    items = items.filter(
      (item) => item.id !== newItem.id && item.doc_num !== newItem.doc_num,
    );

    // ❗ tambah ke paling atas
    items.unshift(newItem);

    // ❗ batasi max 10
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving recent item:", error);
  }
};

export const getRecentItems = async (): Promise<RecentItem[]> => {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting recent items:", error);
    return [];
  }
};

export const clearRecentItems = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_KEY);
  } catch (error) {
    console.error("Error clearing recent items:", error);
  }
};
