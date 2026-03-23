import { BASE_URL } from "@/lib/config";
import { ApiResponse, UserAuthData } from "@/lib/model-type";
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
        await AsyncStorage.multiRemove(["accounts", "authData"]);

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
    } finally {
      set({ isAuthLoaded: false });
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

  // setAuth: async (authData) => {
  //   try {
  //     await AsyncStorage.setItem("authData", JSON.stringify(authData));

  //     set({ authData, isAuthenticated: true });
  //   } catch (e) {
  //     throw e;
  //   } finally {
  //     set({ isAuthLoaded: true });
  //   }
  // },

  // logout: async () => {
  //   try {
  //     await AsyncStorage.multiRemove(["authData"]);
  //     set({
  //       authData: null,
  //       isAuthenticated: false,
  //     });
  //   } catch (e) {
  //     throw e;
  //   } finally {
  //     set({ isAuthLoaded: false });
  //   }
  // },

  // loadAuth: async () => {
  //   try {
  //     const [authData] = await AsyncStorage.multiGet(["authData"]).then((res) =>
  //       res.map((r) => r[1]),
  //     );

  //     if (!authData) {
  //       set({ isAuthenticated: false });
  //       return;
  //     }

  //     const ticketParse = JSON.parse(authData) as UserAuthData;
  //     const expirationDate = new Date(ticketParse.ExpiredAt);

  //     const setDatas = {
  //       authData: ticketParse,
  //       isAuthenticated: true,
  //     };

  //     if (expirationDate <= new Date()) {
  //       const createReq = await LoginApi<UserAuthData>(
  //         ticketParse.Username,
  //         "",
  //         true,
  //       );
  //       if (createReq.Data) setDatas.authData = createReq.Data;
  //       await AsyncStorage.setItem("authData", JSON.stringify(createReq));
  //     }

  //     set(setDatas);
  //   } catch (e) {
  //     throw e;
  //   } finally {
  //     set({ isAuthLoaded: true });
  //   }
  // },
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
