import Configs from "@/lib/config";
import { ApiResponse, SistemOrg, UserAuthData } from "@/lib/model-type";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AuthState = {
  accounts: UserAuthData[];
  authData: UserAuthData | null;

  isAuthenticated: boolean;
  isAuthLoaded: boolean;

  setAuth: (auth: UserAuthData) => Promise<void>;
  switchAccount: (auth: UserAuthData) => Promise<void>;
  logout: (auth?: UserAuthData) => Promise<void>;
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
      await AsyncStorage.setItem(
        "authData",
        JSON.stringify({
          username: authData.Username,
          org: authData.Org,
        }),
      );

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

  switchAccount: async (authData) => {
    try {
      const { accounts } = get();

      let selected = accounts.find(
        (a) => a.Username === authData.Username && a.Org === authData.Org,
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
      await AsyncStorage.setItem(
        "authData",
        JSON.stringify({
          username: selected.Username,
          org: selected.Org,
        }),
      );

      set({
        accounts: updatedAccounts,
        authData: selected,
        isAuthenticated: true,
      });
    } catch (e) {
      throw e;
    }
  },

  logout: async (userData) => {
    try {
      const { accounts, authData } = get();

      // logout semua account
      if (!userData) {
        await AsyncStorage.multiRemove(["accounts", "authData"]);

        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
        });

        return;
      }

      // logout 1 account
      const newAccounts = accounts.filter(
        (a) => a.Username !== userData.Username || a.Org !== userData.Org,
      );

      await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));

      let newActive = authData;

      if (authData?.Username === userData.Username) {
        newActive = newAccounts[0] || null;

        if (newActive) {
          await AsyncStorage.setItem(
            "authData",
            JSON.stringify({
              username: newActive.Username,
              org: newActive.Org,
            }),
          );
        } else {
          await AsyncStorage.removeItem("authData");
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
      const activeAuth = await AsyncStorage.getItem("authData");

      if (!accountsStr || !activeAuth) {
        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
        });
        return;
      }

      const activeAuthData: { username: string; org: string } =
        JSON.parse(activeAuth);
      const accounts: UserAuthData[] = JSON.parse(accountsStr);

      let authData =
        accounts.find(
          (a) =>
            a.Username === activeAuthData.username &&
            a.Org === activeAuthData.org,
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

type OrganizationProps = {
  activeOrg: SistemOrg | null;
  allOrgs: SistemOrg[];

  setOrg: (org: SistemOrg) => Promise<void>;
  addOrg: (org: SistemOrg) => Promise<void>;
  deleteOrg: (org: SistemOrg) => Promise<void>;
  loadOrg: () => Promise<void>;
};

export const useOrgStore = create<OrganizationProps>((set, get) => ({
  activeOrg: null,
  allOrgs: [],

  setOrg: async (org) => {
    try {
      await AsyncStorage.setItem("activeOrg", JSON.stringify(org));
      set({ activeOrg: org });
    } catch (e) {
      throw e;
    }
  },

  addOrg: async (org) => {
    try {
      const { allOrgs } = get();
      const filtered = allOrgs.filter((a) => a.key !== org.key);

      const newOrgs = [...filtered, org];

      await AsyncStorage.setItem("allOrgs", JSON.stringify(newOrgs));
      set({ allOrgs: newOrgs });
    } catch (e) {
      throw e;
    }
  },

  deleteOrg: async (org) => {
    try {
      const { allOrgs } = get();

      const newOrgs = allOrgs.filter((a) => a.key !== org.key);
      await AsyncStorage.setItem("allOrgs", JSON.stringify(newOrgs));

      set({ allOrgs: newOrgs });
    } catch (e) {
      throw e;
    }
  },

  loadOrg: async () => {
    try {
      const allOrgStr = await AsyncStorage.getItem("allOrgs");
      const activeOrg = await AsyncStorage.getItem("activeOrg");

      if (!allOrgStr) {
        set({
          activeOrg: null,
          allOrgs: [],
        });
        return;
      }

      const allOrgs: SistemOrg[] = JSON.parse(allOrgStr);
      let findOrg = allOrgs.find((a) => a.key === activeOrg) || null;

      set({
        activeOrg: findOrg,
        allOrgs: allOrgs,
      });
    } catch (e) {
      throw e;
    }
  },
}));
