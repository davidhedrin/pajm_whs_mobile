import { useAuthStore } from "@/hooks/zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SendPushNotificationParams {
  targetToken: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification({
  targetToken,
  title,
  body,
  data = {},
}: SendPushNotificationParams): Promise<void> {
  const message = {
    to: targetToken,
    sound: "default",
    title,
    body,
    data,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

type FilterAccountTokenProps = {
  username: string;
  url: string;
};
type GroupingUserTokenProps = {
  url: string;
  usernames: string[];
};
export function filterAccountForToken(): FilterAccountTokenProps[] {
  const { accounts, allOrgs } = useAuthStore.getState();

  const orgMap = Object.fromEntries(allOrgs.map((o) => [o.key, o.url]));

  const map = new Map();

  accounts.forEach((x) => {
    const url = orgMap[x.Org];
    if (!url) return;

    const key = `${x.Username}_${url}`;

    if (!map.has(key)) {
      map.set(key, {
        username: x.Username,
        url: url,
      });
    }
  });

  const result: FilterAccountTokenProps[] = Array.from(map.values());
  return result;
}

export async function UpdateUsersTokenDevice(
  token: string,
  old_token: string | null,
) {
  const userList = filterAccountForToken();

  const mapUserList = new Map();
  userList.forEach((item) => {
    if (!mapUserList.has(item.url)) {
      mapUserList.set(item.url, {
        url: item.url,
        usernames: [],
      });
    }

    mapUserList.get(item.url).usernames.push(item.username);
  });
  const userGroup: GroupingUserTokenProps[] = Array.from(
    mapUserList.values(),
  ).map((item) => ({
    url: item.url,
    usernames: item.usernames,
  }));

  Promise.all(
    userGroup.map((x) =>
      fetch(
        `${x.url}/WebServicesNoCred/MobileJsonWebService.asmx/StoreUserNotifToken`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_token: token,
            old_token: old_token ?? "",
            usernames: x.usernames,
          }),
        },
      ),
    ),
  )
    .then(() => {
      // console.log("All requests sent successfully");
    })
    .catch((err) => {
      // console.log("Some request failed:", err);
    });
}

export async function saveDeviceToken(token: string | null) {
  try {
    if (token) await AsyncStorage.setItem("device_token", token);
  } catch (error) {
    console.error("Error saving device token:", error);
  }
}

export async function getDeviceToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem("device_token");
    return token;
  } catch (error) {
    console.error("Error getting device token:", error);
    return null;
  }
}
