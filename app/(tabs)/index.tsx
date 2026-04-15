import ScreenWrapper from "@/components/screen-wrapper";
import { CText } from "@/components/text";
import useTheme from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from "@/components/button";
import { useAuthStore } from "@/hooks/zustand";
import { callApi } from "@/lib/api-fatch";
import { ResponsiveScale, StatisticProps, UserAuthData } from "@/lib/model-type";
import { useResposiveScale } from "@/lib/resposive";
import { showToast } from "@/lib/utils";
import { useRouter } from "expo-router";
import { useRef } from "react";

type ModuleItem = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  badgeVal?: string;
  onPress?: () => void;
};
export default function Index() {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { authData, accounts, switchAccount } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();

  const modules: ModuleItem[] = [
    {
      iconName: "document-text-outline",
      title: "Purchase Request",
      onPress: () => {
        router.push("/pages/purchase_request");
      }
    },
    {
      iconName: "cart-outline",
      title: "Purchase Order",
      badgeVal: "5",
    },
    {
      iconName: "cube-outline",
      title: "Delivery Notes",
    },
  ];

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const fatchStatistic = async () => {
    try {
      const createReq = await callApi<StatisticProps>({
        endpoint: "PrDetailById",
        params: {
          pr_id: "",
        }
      });
    }
    catch (error: any) {
      showToast({
        type: "error",
        title: "Request Failed",
        message: error.message
      });
    }
  }

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: rpm(16), paddingHorizontal: rpm(12) }}>
        {/* HEADER */}
        <View className="flex-row items-center justify-between">

          {/* Profile Section */}
          <TouchableOpacity onPress={() => bottomSheetRef.current?.open()}>
            <View
              className="flex-row items-center border rounded-full"
              style={{
                paddingStart: rpm(5),
                paddingEnd: rpm(13),
                paddingVertical: rpm(4),
                borderColor: colors.border
              }}
            >
              <View
                className="bg-slate-700 rounded-full items-center justify-center"
                style={{
                  width: rw(31),
                  height: rh(31)
                }}
              >
                <Ionicons name="person" size={rf(16)} color="white" />
              </View>

              <View style={{ marginLeft: rpm(6) }}>
                <CText
                  className="font-regular"
                  style={{ fontSize: rf(12), lineHeight: rpm(16) }}
                >
                  Hello...
                </CText>

                <CText
                  className="font-medium"
                  style={{ fontSize: rf(13), marginTop: rpm(2), lineHeight: rpm(16) }}
                >
                  {authData?.Fullname ? authData.Fullname.trim().split(" ")[0] : "Guest"}
                </CText>
              </View>
            </View>
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            className="bg-slate-800 rounded-full items-center justify-center"
            style={{
              width: rw(36),
              height: rh(36),
            }}
          >
            <Ionicons name="notifications-outline" size={rf(20)} color="white" />

            {/* Badge */}
            <View
              className="absolute bg-red-500 rounded-full items-center justify-center"
              style={{
                top: rpm(-3),
                right: rpm(-3),
                width: rw(15),
                height: rh(15)
              }}
            >
              <CText
                className="font-medium text-white"
                style={{ color: '#ffffff', fontSize: rf(11) }}
              >
                3
              </CText>
            </View>
          </TouchableOpacity>
        </View>

        {/* HERO TEXT */}
        <View className="flex-row justify-between rounded-tl-3xl rounded-br-full"
          style={{
            marginTop: rpm(24),
            padding: rpm(12),
            backgroundColor: colors.bg_primary
          }}>
          <View>
            <CText className="font-regular" style={{ fontSize: rf(14) }}>
              Welcome to,
            </CText>

            <CText className="font-semibold" style={{ fontSize: rf(21), marginTop: rpm(4) }}>
              <Text className="font-semibold text-red-500">PAJM</Text> Warehouse
            </CText>

            <CText
              className="font-regular"
              style={{ fontSize: rf(13), marginTop: rpm(4) }}
            >
              Your login as {authData?.Role ?? "Guest"}!
            </CText>
          </View>
          <View style={{ paddingEnd: rpm(20) }}>
            <Image
              source={require("../../assets/images/splash-icon.png")}
              resizeMode="contain"
              style={{
                width: rw(60),
                height: rh(60)
              }}
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={{ paddingTop: rpm(20) }}>
          <View>
            <CText
              className="font-medium leading-none"
              style={{
                fontSize: rf(13)
              }}
            >
              Statistics
            </CText>
            <CText className="font-regular">
              This summary data's is belongs to you!
            </CText>
          </View>

          <View className="flex-row flex-wrap justify-between mt-2" style={{ marginTop: rpm(6) }}>
            {/* Purchase Request */}
            <View
              className="w-[48.5%] mb-[3%]"
              style={{
                borderRadius: rpm(10),
                padding: rpm(8),
                backgroundColor: colors.bg_success
              }}
            >
              <View className="flex-row justify-between">
                <View
                  className="bg-green-600/30 items-center justify-center"
                  style={{ borderRadius: rpm(10) }}
                >
                  <Ionicons name="document-text-outline" size={rf(24)} color="white" style={{ padding: rpm(8) }} />
                </View>


                <View className="items-end">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13) }}
                  >
                    Total Data
                  </CText>

                  <CText className="font-semibold" style={{ fontSize: rf(17) }}>
                    1456
                  </CText>
                </View>

              </View>

              <CText
                className="font-medium"
                style={{
                  fontSize: rf(13),
                  marginTop: rpm(8)
                }}
              >
                Purchase Request
              </CText>

              <View className="h-px bg-gray-400" style={{ marginVertical: rpm(6) }} />

              <View className="gap-1">
                <View className="flex-row justify-between">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13), lineHeight: rpm(18) }}
                  >
                    On Progress
                  </CText>
                  <CText className="font-medium" style={{ fontSize: rf(13), lineHeight: rpm(18) }}>
                    123
                  </CText>
                </View>

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13), lineHeight: rpm(18) }}
                  >
                    Finish
                  </CText>
                  <CText className="font-medium" style={{ fontSize: rf(13), lineHeight: rpm(18) }}>
                    456
                  </CText>
                </View>
              </View>
            </View>

            {/* Purchase Order */}
            <View
              className="w-[48.5%] mb-[3%]"
              style={{
                borderRadius: rpm(10),
                padding: rpm(8),
                backgroundColor: colors.bg_warning
              }}
            >
              <View className="flex-row justify-between">
                <View
                  className="bg-orange-600/30 items-center justify-center"
                  style={{ borderRadius: rpm(10) }}
                >
                  <Ionicons name="cart-outline" size={rf(24)} color="white" style={{ padding: rpm(8) }} />
                </View>

                <View className="items-end">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13) }}
                  >
                    Total Data
                  </CText>

                  <CText className="font-semibold" style={{ fontSize: rf(17) }}>
                    1456
                  </CText>
                </View>

              </View>

              <CText
                className="font-medium"
                style={{
                  fontSize: rf(13),
                  marginTop: rpm(8)
                }}
              >
                Purchase Order
              </CText>

              <View className="h-px bg-gray-400" style={{ marginVertical: rpm(6) }} />

              <View className="gap-1">
                <View className="flex-row justify-between">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13), lineHeight: rpm(18) }}
                  >
                    On Progress
                  </CText>
                  <CText className="font-medium" style={{ fontSize: rf(13), lineHeight: rpm(18) }}>
                    123
                  </CText>
                </View>

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular"
                    style={{ color: colors.textMuted, fontSize: rf(13), lineHeight: rpm(18) }}
                  >
                    Finish
                  </CText>
                  <CText className="font-medium" style={{ fontSize: rf(13), lineHeight: rpm(18) }}>
                    456
                  </CText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* MODULE HEADER */}
        <View
          className="flex-row items-center justify-between"
          style={{
            marginTop: rpm(6)
          }}
        >
          <CText
            className="font-medium"
            style={{ fontSize: rf(13) }}
          >
            Menus
          </CText>

          <TouchableOpacity>
            <CText
              className="underline font-regular"
              style={{ fontSize: rf(13) }}
            >
              See all
            </CText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: rpm(12), marginTop: rpm(6) }}>
        <View
          className="flex-row flex-wrap justify-between"
        >
          {modules.map((item, index) => (
            <ModuleButton
              key={index}
              iconName={item.iconName}
              title={item.title}
              badgeVal={item.badgeVal}
              onPress={item.onPress}

              scales={scales}
            />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: rpm(14) }}>
        <CText
          className="font-medium"
          style={{
            marginTop: rpm(6),
            fontSize: rf(13)
          }}
        >
          Recently Viewed
        </CText>

        <View className="items-center justify-center shadow-md"
          style={{
            marginTop: rpm(6),
            paddingHorizontal: rpm(16),
            paddingVertical: rpm(20),
            borderRadius: rpm(10),
            backgroundColor: colors.surface
          }}
        >
          <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

          <CText className="font-medium text-gray-500 text-center" style={{ fontSize: rf(13) }}>
            You haven't any history yet.
          </CText>

          <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(12) }}>
            Start explore and they will appear here.
          </CText>
        </View>
      </View>

      <AppBottomSheet title="Switch Account" ref={bottomSheetRef} snapPoints={["30%", "40%"]} enableGesture={true}>
        {
          accounts.map((x, i) => (
            <TouchableOpacity
              key={i}
              onPress={async () => {
                await switchAccount(x.Username);
                bottomSheetRef.current?.close();
              }}
            >
              <Accounts data={x} activeUser={authData?.Username ?? ""} scales={scales} />
            </TouchableOpacity>
          ))
        }

        <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className="w-full" style={{ marginBottom: rpm(30) }} />
      </AppBottomSheet>
    </ScreenWrapper>
  );
};

type ModuleButtonProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  scales: ResponsiveScale;
  badgeVal?: string;
  onPress?: () => void;
};

function ModuleButton({ iconName, title, badgeVal, onPress, scales }: ModuleButtonProps) {
  const { rw, rh, rpm, rf } = scales;
  const { colors } = useTheme();

  return <TouchableOpacity
    onPress={onPress}
    className="w-[31.5%] mb-[3%] border items-center justify-center"
    style={{
      height: rh(76),
      paddingHorizontal: rpm(14),
      borderRadius: rpm(10),
      borderColor: colors.border + "44",
      backgroundColor: colors.bg + "77"
    }}
  >
    {
      badgeVal !== undefined && <View
        className="absolute bg-red-500 rounded-full items-center justify-center"
        style={{
          top: rpm(6),
          right: rpm(6),
          width: rw(18),
          height: rh(18)
        }}
      >
        <CText
          className="font-medium"
          style={{ color: '#ffffff', fontSize: rf(11) }}
        >
          {badgeVal}
        </CText>
      </View>
    }

    <Ionicons
      name={iconName}
      size={rf(25)}
      color={colors.primary}
    />

    <CText
      className="font-regular text-center"
      style={{
        fontSize: rf(12),
        marginTop: rpm(1)
      }}
    >
      {title}
    </CText>
  </TouchableOpacity>;
};

export function Accounts({ data, activeUser, scales }: { data: UserAuthData, activeUser: string, scales: ResponsiveScale; }) {
  const { rw, rh, rpm, rf } = scales;

  return <View className="flex-row items-center bg-gray-300/20 border border-gray-400/15"
    style={{
      borderRadius: rpm(10),
      padding: rpm(9),
      marginBottom: rpm(14)
    }}
  >
    <View className="bg-indigo-600 items-center justify-center"
      style={{
        borderRadius: rpm(10),
        width: rw(30),
        height: rh(30),
        marginRight: rpm(10)
      }}
    >
      <CText className="font-semibold" style={{ color: "#fff", fontSize: rf(13) }}>JD</CText>
    </View>

    <View className="flex-1">
      <CText className="font-medium" style={{ fontSize: rf(13) }}>{data.Fullname}</CText>
      <CText className="opacity-60" style={{ fontSize: rf(12) }}>{data.Email ? (data.Email.trim() !== "" ? data.Email : "Email not registered") : "Email not registered"}</CText>
    </View>

    <Ionicons name={activeUser == data.Username ? "checkmark-circle" : "ellipse-outline"} size={rf(21)} color={activeUser == data.Username ? "#3b82f6" : "#9CA3AF"} />
  </View>
}