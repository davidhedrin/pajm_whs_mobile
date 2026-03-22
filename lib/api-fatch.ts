import { useAuthStore } from "@/hooks/zustand";
import { BASE_URL } from "./config";
import { ApiResponse } from "./model-type";

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
    const { authData } = useAuthStore.getState();

    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    };

    const ENDPOINT_URL = `${BASE_URL}/${isCredentian ? "WebServices" : "WebServicesNoCred"}/MobileJsonWebService.asmx`;
    if (isCredentian) {
      if (authData === null) throw new Error("Credential is not found!");
      if (authData.Token === null) throw new Error("Credential is not found!");
      finalHeaders["Cookie"] = `.ASPXFORMSAUTH_WPAJM=${authData.Token}`;

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
