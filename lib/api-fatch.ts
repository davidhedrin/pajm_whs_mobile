import { LoginApi, useAuthStore } from "@/hooks/zustand";
import Configs from "./config";
import { ApiResponse, UserAuthData } from "./model-type";

type CallApiOptions = {
  endpoint: string;
  params?: Record<string, any>;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  isCredentian?: boolean;
};

export async function callApi<T>({
  endpoint,
  params = {},
  method = "POST",
  headers = {},
  isCredentian = true,
}: CallApiOptions): Promise<ApiResponse<T>> {
  try {
    const { authData, activeOrg, setAuth, logout } = useAuthStore.getState();

    if (!activeOrg) throw new Error("Organization active is not found!");
    let finalHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    };

    const ENDPOINT_URL = `${activeOrg.url}/WebServicesNoCred/MobileJsonWebService.asmx`;
    if (isCredentian) {
      if (authData === null) throw new Error("Credential is not found!");
      if (authData.Token === null) throw new Error("Credential is not found!");

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
          finalHeaders["Cookie"] =
            `${Configs.COOKIE_PREFIX}=${createReq.Data.Token}`;
          setAuth(createReq.Data);
        } else {
          logout(authData);
        }
      } else {
        finalHeaders["Cookie"] = `${Configs.COOKIE_PREFIX}=${authData.Token}`;
      }

      params = { ...params, username: authData.Username };
    }

    const res = await fetch(`${ENDPOINT_URL}/${endpoint}`, {
      method,
      headers: finalHeaders,
      body: method === "POST" ? JSON.stringify(params) : undefined,
    });

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

// export async function callApi<T>({
//   endpoint,
//   params = {},
//   method = "POST",
//   headers = {},
//   isCredentian = true,
// }: CallApiOptions): Promise<ApiResponse<T>> {
//   try {
//     const { authData, setAuth, logout } = useAuthStore.getState();

//     let finalHeaders: Record<string, string> = {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       ...headers,
//     };

//     const ENDPOINT_URL = `${Configs.BASE_URL}/${isCredentian ? "WebServices" : "WebServicesNoCred"}/MobileJsonWebService.asmx`;
//     if (isCredentian) {
//       if (authData === null) throw new Error("Credential is not found!");
//       if (authData.Token === null) throw new Error("Credential is not found!");

//       const expirationDate = new Date(authData.ExpiredAt);
//       if (expirationDate <= new Date()) {
//         const createReq = await LoginApi<UserAuthData>(
//           authData.Username,
//           "",
//           true,
//         );

//         if (createReq.Data) {
//           finalHeaders["Cookie"] =
//             `${Configs.COOKIE_PREFIX}=${createReq.Data.Token}`;
//           setAuth(createReq.Data);
//         } else {
//           logout(authData.Username);
//         }
//       } else {
//         finalHeaders["Cookie"] = `${Configs.COOKIE_PREFIX}=${authData.Token}`;
//       }

//       params = { ...params, username: authData.Username };
//     }

//     const res = await fetch(`${ENDPOINT_URL}/${endpoint}`, {
//       method,
//       headers: finalHeaders,
//       body: method === "POST" ? JSON.stringify(params) : undefined,
//     });

//     const raw = await res.json();
//     const resJson: ApiResponse<T> = { ...raw.d, Status: res.status };

//     if (!resJson.Success)
//       throw new Error(
//         resJson.Message === undefined ? raw["Message"] : resJson.Message,
//       );
//     return resJson;
//   } catch (error) {
//     throw error;
//   }
// }
