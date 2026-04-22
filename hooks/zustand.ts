import Configs from "@/lib/config";
import { ApiResponse, SistemOrg, UserAuthData } from "@/lib/model-type";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AuthState = {
  accounts: UserAuthData[];
  authData: UserAuthData | null;
  activeOrg: SistemOrg | null;

  isAuthenticated: boolean;
  isAuthLoaded: boolean;

  setAuth: (auth: UserAuthData) => Promise<void>;
  switchAccount: (username: string, org: SistemOrg) => Promise<void>;
  logout: (username?: string, org?: SistemOrg) => Promise<void>;
  loadAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  authData: null,
  activeOrg: null,

  isAuthenticated: false,
  isAuthLoaded: false,

  setAuth: async (authData) => {
    try {
      const { accounts } = get();

      // hapus kalau sudah ada (biar tidak duplicate)
      const filtered = accounts.filter(
        (a) => a.Username !== authData.Username || a.Org !== authData.Org,
      );

      const newAccounts = [...filtered, authData];

      await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));
      await AsyncStorage.setItem("authData", authData.Username);
      await AsyncStorage.setItem("activeOrg", authData.Org);

      set({
        accounts: newAccounts,
        authData,
        isAuthenticated: true,
        activeOrg: authData.Org as SistemOrg,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },

  switchAccount: async (username: string, org: SistemOrg) => {
    try {
      const { accounts } = get();

      let selected = accounts.find(
        (a) => a.Username === username && a.Org === org,
      );
      if (!selected) return;

      let updatedAccounts = [...accounts];

      const expirationDate = new Date(selected.ExpiredAt);

      // 🔥 cek expired
      if (expirationDate <= new Date()) {
        const createReq = await LoginApi<UserAuthData>(
          selected.Username,
          "",
          selected.Org,
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
      await AsyncStorage.setItem("authData", selected.Username);
      await AsyncStorage.setItem("activeOrg", selected.Org);

      set({
        accounts: updatedAccounts,
        authData: selected,
        isAuthenticated: true,
        activeOrg: selected.Org as SistemOrg,
      });
    } catch (e) {
      throw e;
    }
  },

  logout: async (username?: string, org?: SistemOrg) => {
    try {
      const { accounts, authData } = get();

      // logout semua account
      if (!username || !org) {
        await AsyncStorage.multiRemove(["accounts", "authData", "activeOrg"]);

        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
          activeOrg: null,
        });

        return;
      }

      // logout 1 account
      const newAccounts = accounts.filter(
        (a) => a.Username !== username || a.Org !== org,
      );

      await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));

      let newActive = authData;

      if (authData?.Username === username) {
        newActive = newAccounts[0] || null;

        if (newActive) {
          await AsyncStorage.setItem("authData", newActive.Username);
          await AsyncStorage.setItem("activeOrg", newActive.Org);
        } else {
          await AsyncStorage.removeItem("authData");
          await AsyncStorage.removeItem("activeOrg");
        }
      }

      set({
        accounts: newAccounts,
        authData: newActive,
        isAuthenticated: !!newActive,
        activeOrg: newActive?.Org as SistemOrg,
      });
    } catch (e) {
      throw e;
    }
  },

  loadAuth: async () => {
    try {
      const accountsStr = await AsyncStorage.getItem("accounts");
      const activeUsername = await AsyncStorage.getItem("authData");
      const activeOrg = await AsyncStorage.getItem("activeOrg");

      if (!accountsStr) {
        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
          activeOrg: null,
        });
        return;
      }

      const accounts: UserAuthData[] = JSON.parse(accountsStr);

      let authData =
        accounts.find(
          (a) => a.Username === activeUsername && a.Org === activeOrg,
        ) || null;

      // 🔥 cek expired
      if (authData) {
        const expirationDate = new Date(authData.ExpiredAt);

        if (expirationDate <= new Date()) {
          const createReq = await LoginApi<UserAuthData>(
            authData.Username,
            "",
            authData.Org,
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
              activeOrg: authData.Org as SistemOrg,
            });

            return;
          }
        }
      }

      set({
        accounts,
        authData,
        isAuthenticated: !!authData,
        activeOrg: activeOrg as SistemOrg,
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
  org: string,
  isRelogin = false,
): Promise<ApiResponse<T>> {
  try {
    const BASE_URL =
      org === "PAJM" ? Configs.BASE_URL_PAJM : Configs.BASE_URL_LCS;

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
          org_code: org,
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
