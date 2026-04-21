import Configs from "@/lib/config";
import { ApiResponse, UserAuthData } from "@/lib/model-type";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AuthState = {
  accounts: UserAuthData[];
  authData: UserAuthData | null;

  isAuthenticated: boolean;
  isAuthLoaded: boolean;

  setAuth: (auth: UserAuthData) => Promise<void>;
  switchAccount: (username: string) => Promise<void>;
  logout: (username?: string) => Promise<void>;
  loadAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  authData: null,

  isAuthenticated: false,
  isAuthLoaded: false,

  setAuth: async (authData) => {
    try {
      const { accounts } = get();

      // hapus kalau sudah ada (biar tidak duplicate)
      const filtered = accounts.filter((a) => a.Username !== authData.Username);

      const newAccounts = [...filtered, authData];

      await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));
      await AsyncStorage.setItem("authData", authData.Username);

      set({
        accounts: newAccounts,
        authData,
        isAuthenticated: true,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },

  switchAccount: async (username: string) => {
    try {
      const { accounts } = get();

      let selected = accounts.find((a) => a.Username === username);
      if (!selected) return;

      let updatedAccounts = [...accounts];

      const expirationDate = new Date(selected.ExpiredAt);

      // 🔥 cek expired
      if (expirationDate <= new Date()) {
        const createReq = await LoginApi<UserAuthData>(
          selected.Username,
          "",
          true,
        );

        if (createReq.Data) {
          selected = createReq.Data;

          // update account di list
          updatedAccounts = accounts.map((a) =>
            a.Username === selected!.Username ? selected! : a,
          );

          await AsyncStorage.setItem(
            "accounts",
            JSON.stringify(updatedAccounts),
          );
        } else {
          // kalau gagal refresh → jangan switch
          throw new Error("Session expired, please login again");
        }
      }

      // set active account
      await AsyncStorage.setItem("activeAccount", selected.Username);

      set({
        accounts: updatedAccounts,
        authData: selected,
        isAuthenticated: true,
      });
    } catch (e) {
      throw e;
    }
  },

  logout: async (username?: string) => {
    try {
      const { accounts, authData } = get();

      // logout semua account
      if (!username) {
        await AsyncStorage.multiRemove([
          "accounts",
          "authData",
          "activeAccount",
        ]);

        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
        });

        return;
      }

      // logout 1 account
      const newAccounts = accounts.filter((a) => a.Username !== username);

      await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));

      let newActive = authData;

      if (authData?.Username === username) {
        newActive = newAccounts[0] || null;

        if (newActive) {
          await AsyncStorage.setItem("authData", newActive.Username);
          await AsyncStorage.setItem("activeAccount", newActive.Username);
        } else {
          await AsyncStorage.removeItem("authData");
          await AsyncStorage.removeItem("activeAccount");
        }
      }

      set({
        accounts: newAccounts,
        authData: newActive,
        isAuthenticated: !!newActive,
      });
    } catch (e) {
      throw e;
    }
  },

  loadAuth: async () => {
    try {
      const accountsStr = await AsyncStorage.getItem("accounts");
      const activeUsername = await AsyncStorage.getItem("authData");

      if (!accountsStr) {
        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
        });
        return;
      }

      const accounts: UserAuthData[] = JSON.parse(accountsStr);

      let authData =
        accounts.find((a) => a.Username === activeUsername) || null;

      // 🔥 cek expired
      if (authData) {
        const expirationDate = new Date(authData.ExpiredAt);

        if (expirationDate <= new Date()) {
          const createReq = await LoginApi<UserAuthData>(
            authData.Username,
            "",
            true,
          );

          if (createReq.Data) {
            authData = createReq.Data;

            const updatedAccounts = accounts.map((a) =>
              a.Username === authData!.Username ? authData! : a,
            );

            await AsyncStorage.setItem(
              "accounts",
              JSON.stringify(updatedAccounts),
            );

            set({
              accounts: updatedAccounts,
              authData,
              isAuthenticated: true,
            });

            return;
          }
        }
      }

      set({
        accounts,
        authData,
        isAuthenticated: !!authData,
      });
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
      `${Configs.BASE_URL}/WebServicesNoCred/MobileJsonWebService.asmx/Login`,
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

type ConfirmParams = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type ConfirmStore = {
  visible: boolean;
  params: ConfirmParams | null;
  resolver: ((value: boolean) => void) | null;
  showConfirm: (params: ConfirmParams) => Promise<boolean>;
  closeConfirm: (val: boolean) => void;
};

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  visible: false,
  params: null,
  resolver: null,

  showConfirm: (params) => {
    return new Promise<boolean>((resolve) => {
      set({ visible: true, params, resolver: resolve });
    });
  },

  closeConfirm: (val) => {
    const { resolver } = get();
    if (resolver) resolver(val);
    set({ visible: false, params: null, resolver: null });
  },
}));

type LoadingStore = {
  visible: boolean;
  show: () => void;
  hide: () => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  visible: false,

  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));
