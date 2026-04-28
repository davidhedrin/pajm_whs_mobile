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

  activeOrg: SistemOrg | null;
  allOrgs: SistemOrg[];

  addOrg: (org: SistemOrg) => Promise<void>;
  deleteOrg: (org?: SistemOrg) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  authData: null,

  activeOrg: null,
  allOrgs: [],

  isAuthenticated: false,
  isAuthLoaded: false,

  setAuth: async (authData) => {
    try {
      const { accounts, allOrgs } = get();
      const findOrg = allOrgs.find((x) => x.key === authData.Org);
      if (!findOrg) throw new Error("Organization is not found!");

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
      await AsyncStorage.setItem("activeOrg", JSON.stringify(findOrg));

      set({
        accounts: newAccounts,
        authData,
        isAuthenticated: true,
        activeOrg: findOrg,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },

  switchAccount: async (authData) => {
    try {
      const { accounts, allOrgs } = get();

      let selected = accounts.find(
        (a) => a.Username === authData.Username && a.Org === authData.Org,
      );
      const findOrg = allOrgs.find((x) => x.key === selected?.Org);
      if (!findOrg) throw new Error("Organization is not found!");
      if (!selected) return;

      let updatedAccounts = [...accounts];

      const expirationDate = new Date(selected.ExpiredAt);

      // 🔥 cek expired
      if (expirationDate <= new Date()) {
        const createReq = await LoginApi<UserAuthData>(
          selected.Username,
          "",
          selected.Org,
          findOrg.url,
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
      await AsyncStorage.setItem("activeOrg", JSON.stringify(findOrg));

      set({
        accounts: updatedAccounts,
        authData: selected,
        isAuthenticated: true,
        activeOrg: findOrg,
      });
    } catch (e) {
      throw e;
    }
  },

  logout: async (userData) => {
    try {
      const { accounts, authData, allOrgs } = get();

      // logout semua account
      if (!userData) {
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
        (a) => a.Username !== userData.Username || a.Org !== userData.Org,
      );
      if (newAccounts.length > 0)
        await AsyncStorage.setItem("accounts", JSON.stringify(newAccounts));
      else await AsyncStorage.removeItem("accounts");

      let newActive = authData;
      let newActiveOrg = null;

      if (authData?.Username === userData.Username) {
        newActive = newAccounts[0] || null;

        if (newActive) {
          const findOrg = allOrgs.find((x) => x.key === newActive?.Org);
          if (!findOrg) throw new Error("Organization is not found!");
          newActiveOrg = findOrg;

          await AsyncStorage.setItem(
            "authData",
            JSON.stringify({
              username: newActive.Username,
              org: newActive.Org,
            }),
          );
          await AsyncStorage.setItem("activeOrg", JSON.stringify(findOrg));
        } else {
          await AsyncStorage.removeItem("authData");
          await AsyncStorage.removeItem("activeOrg");
        }
      }

      set({
        accounts: newAccounts,
        authData: newActive,
        isAuthenticated: !!newActive,
        activeOrg: newActiveOrg,
      });
    } catch (e) {
      throw e;
    }
  },

  loadAuth: async () => {
    try {
      const asyncStorageKeys = ["allOrgs", "activeOrg", "accounts", "authData"];
      const asyncStorageResults = await AsyncStorage.multiGet(asyncStorageKeys);
      const asyncStorageDatas = Object.fromEntries(asyncStorageResults);

      const allOrgStr = asyncStorageDatas.allOrgs;
      const activeOrgStr = asyncStorageDatas.activeOrg;
      const accountsStr = asyncStorageDatas.accounts;
      const activeAuth = asyncStorageDatas.authData;

      if (!allOrgStr) {
        set({
          accounts: [],
          authData: null,
          isAuthenticated: false,
          activeOrg: null,
          allOrgs: [],
        });
        return;
      }
      const allOrgs: SistemOrg[] = JSON.parse(allOrgStr);
      let activeOrg = activeOrgStr ? JSON.parse(activeOrgStr) : null;

      set({
        activeOrg,
        allOrgs,
      });

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
        const findOrg = allOrgs.find((x) => x.key === authData?.Org);
        if (!findOrg) throw new Error("Organization is not found!");
        activeOrg = findOrg;

        const expirationDate = new Date(authData.ExpiredAt);

        if (expirationDate <= new Date()) {
          const createReq = await LoginApi<UserAuthData>(
            authData.Username,
            "",
            authData.Org,
            activeOrg.url,
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
        activeOrg: activeOrg,
      });
    } catch (e) {
      throw e;
    } finally {
      set({ isAuthLoaded: true });
    }
  },

  //-----------------------------------------------------------------------------------

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

      // delete semua org
      if (!org) {
        await AsyncStorage.multiRemove(["allOrgs", "activeOrg"]);

        set({
          activeOrg: null,
          allOrgs: [],
        });

        return;
      }

      const newOrgs = allOrgs.filter((a) => a.key !== org.key);
      await AsyncStorage.setItem("allOrgs", JSON.stringify(newOrgs));

      set({ allOrgs: newOrgs });
    } catch (e) {
      throw e;
    }
  },
}));

export async function LoginApi<T>(
  username: string,
  password: string,
  org: string,
  base_url: string,
  isRelogin = false,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(
      `${base_url}/WebServicesNoCred/MobileJsonWebService.asmx/Login`,
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
