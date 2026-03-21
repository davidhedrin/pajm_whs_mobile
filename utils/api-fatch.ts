import { useAuthStore } from "@/hooks/zustand";

const BASE_URL = "https://poetastrical-kory-salamanderlike.ngrok-free.dev";

type ApiResponse<T> = {
  Status: number;
  Success: boolean;
  Message: string;
  Data?: T;
};

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
    const { token, username } = useAuthStore.getState();
    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    };

    const ENDPOINT_URL = `${BASE_URL}/${isCredentian ? "WebServices" : "WebServicesNoCred"}/MobileJsonWebService.asmx`;
    if (isCredentian) {
      if (token === null) throw new Error("Credential is not found!");
      finalHeaders["Cookie"] = `.ASPXFORMSAUTH_WPAJM=${token}`;

      params = { ...params, username };
    }

    const res = await fetch(`${ENDPOINT_URL}/${endpoint}`, {
      method,
      headers: finalHeaders,
      body: method === "POST" ? JSON.stringify(params) : undefined,
    });

    const raw = await res.json();
    const resJson: ApiResponse<T> = { ...raw.d, Status: res.status };

    if (!resJson.Success) throw new Error(resJson.Message);
    return resJson;
  } catch (error) {
    throw error;
  }
}
