import { BASE_URL } from "@/lib/config";
import { ApiResponse, UserAuthData } from "@/lib/model-type";
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

      const setDatas = {
        authData: ticketParse,
        isAuthenticated: true,
      };

      if (expirationDate <= new Date()) {
        const createReq = await LoginApi<UserAuthData>(
          ticketParse.Username,
          "",
          true,
        );
        if (createReq.Data) setDatas.authData = createReq.Data;
        await AsyncStorage.setItem("authData", JSON.stringify(createReq));
      }

      set(setDatas);
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },
}));

export async function LoginApi<T>(
  username: string,
  password: string,
  isRelogin = false,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(
      `${BASE_URL}/WebServicesNoCred/MobileJsonWebService.asmx/Login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          is_relogin: isRelogin,
        }),
      },
    );

    const raw = await res.json();
    const resJson: ApiResponse<T> = { ...raw.d, Status: res.status };

    if (!resJson.Success)
      throw new Error(
        resJson.Message === undefined ? raw["Message"] : resJson.Message,
      );
    return resJson;
  } catch (error) {
    throw error;
  }
}
