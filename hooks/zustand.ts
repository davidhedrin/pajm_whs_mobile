import { UserAuthData } from "@/utils/model-type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AuthState = {
  authData: UserAuthData | null;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  setAuth: (auth: UserAuthData) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  authData: null,
  isAuthenticated: false,
  isAuthLoaded: false,

  setAuth: async (authData) => {
    try {
      await AsyncStorage.setItem("authData", JSON.stringify(authData));

      set({ authData, isAuthenticated: true });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["authData"]);
      set({
        authData: null,
        isAuthenticated: false,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: false });
    }
  },

  loadAuth: async () => {
    try {
      const [authData] = await AsyncStorage.multiGet(["authData"]).then((res) =>
        res.map((r) => r[1]),
      );

      if (!authData) {
        set({ isAuthenticated: false });
        return;
      }

      const ticketParse = JSON.parse(authData) as UserAuthData;
      const expirationDate = new Date(ticketParse.ExpiredAt);
      if (expirationDate <= new Date()) {
        await AsyncStorage.multiRemove(["authData"]);

        set({
          authData: null,
          isAuthenticated: false,
        });
        return;
      }

      set({
        authData: ticketParse,
        isAuthenticated: true,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },
}));
