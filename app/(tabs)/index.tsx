import ScreenWrapper from "@/components/screen-wrapper";
import { CText } from "@/components/text";
import useTheme from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from "@/components/button";
import { useAuthStore } from "@/hooks/zustand";
import { UserAuthData } from "@/lib/model-type";
import { useRouter } from "expo-router";
import { useRef } from "react";

type ModuleItem = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  badgeVal?: string;
  onPress?: () => void;
};
export default function Index() {
  const { authData, accounts, switchAccount } = useAuthStore();
  const { toggleDarkMode, colors } = useTheme();

  const { logout } = useAuthStore();
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

  return (
    <ScreenWrapper>
      <View
        className="pt-5 px-4"
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between">

          {/* Profile Section */}
          <TouchableOpacity onPress={() => bottomSheetRef.current?.open()}>
            <View
              className="ps-1.5 pe-4 py-1.5 flex-row items-center border rounded-full"
              style={{
                borderColor: colors.border
              }}
            >
              <View
                className="w-10 h-10 bg-slate-700 rounded-full items-center justify-center"
              >
                <Ionicons name="person" size={18} color="white" />
              </View>

              <View className="ml-2">
                <CText
                  className="font-regular leading-5"
                >
                  Hello...
                </CText>

                <CText
                  className="font-medium leading-5 text-lg mt-1"
                >
                  {authData?.Fullname ? authData.Fullname.trim().split(" ")[0] : "Guest"}
                </CText>
              </View>
            </View>
          </TouchableOpacity>

          {/* Notification */}
          <TouchableOpacity
            onPress={async () => {
              toggleDarkMode();
            }}
            className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={22} color="white" />

            {/* Badge */}
            <View
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
            >
              <CText
                className="font-medium text-white text-sm"
                style={{ color: '#ffffff' }}
              >
                3
              </CText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await logout(authData?.Username ?? "");
              router.replace("/(auth)/login");
            }}
            className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* HERO TEXT */}
        <View className="mt-7 p-4 flex-row justify-between rounded-tl-3xl rounded-br-full"
          style={{
            backgroundColor: colors.bg_primary
          }}>
          <View>
            <CText className="font-regular text-xl">
              Welcome to,
            </CText>

            <CText className="font-semibold text-3xl mt-3">
              <Text className="font-semibold text-red-500">PAJM</Text> Warehouse
            </CText>

            <CText
              className="font-regular text-lg mt-3"
            >
              Your login as {authData?.Role ?? "Guest"}!
            </CText>
          </View>
          <View className="pe-5">
            <Image
              className="w-20 h-20"
              source={require("../../assets/images/splash-icon.png")}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Statistics */}
        <View className="mt-7">
          <View>
            <CText
              className="font-medium text-lg leading-none"
            >
              Statistics
            </CText>
            <CText className="font-regular">
              This summary data's is belongs to you!
            </CText>
          </View>

          <View className="flex-row flex-wrap justify-between mt-2">
            <View
              className="w-[48.5%] mb-[3%] rounded-xl p-2.5"
              style={{
                backgroundColor: colors.bg_success
              }}
            >
              <View className="flex-row justify-between">
                <View
                  className="w-10 h-10 bg-green-600/30 rounded-xl items-center justify-center"
                >
                  <Ionicons name="document-text-outline" size={20} color="white" />
                </View>


                <View className="items-end">
                  <CText
                    className="font-regular leading-none"
                    style={{ color: colors.textMuted }}
                  >
                    Total Data
                  </CText>

                  <CText className="text-2xl font-semibold">
                    1456
                  </CText>
                </View>

              </View>

              {/* Module */}
              <CText
                className="font-regular text-lg mt-2.5"
              >
                Purchase Request
              </CText>

              {/* Divider */}
              <View className="h-px bg-gray-400 my-2" />

              {/* Status */}
              <View className="gap-1">

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular leading-5"
                    style={{ color: colors.textMuted }}>
                    Waiting Action
                  </CText>
                  <CText className="font-medium leading-5">
                    123
                  </CText>
                </View>

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular leading-5"
                    style={{ color: colors.textMuted }}>
                    Done
                  </CText>
                  <CText className="font-medium leading-5">
                    456
                  </CText>
                </View>

              </View>
            </View>

            <View
              className="w-[48.5%] mb-[3%] rounded-xl p-2.5"
              style={{ backgroundColor: colors.bg_warning }}
            >
              {/* Header */}
              <View className="flex-row justify-between">

                <View className="w-10 h-10 bg-orange-600/30 rounded-xl items-center justify-center">
                  <Ionicons name="cart-outline" size={20} color="white" />
                </View>

                <View className="items-end">
                  <CText
                    className="font-regular leading-none"
                    style={{ color: colors.textMuted }}
                  >
                    Total Data
                  </CText>

                  <CText className="text-2xl font-semibold">
                    1456
                  </CText>
                </View>

              </View>

              {/* Module */}
              <CText
                className="font-regular text-lg mt-2.5"
              >
                Purchase Order
              </CText>

              {/* Divider */}
              <View className="h-px bg-gray-400 my-2" />

              {/* Status */}
              <View className="gap-1">

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular leading-5"
                    style={{ color: colors.textMuted }}>
                    Waiting Action
                  </CText>
                  <CText className="font-medium leading-5">
                    123
                  </CText>
                </View>

                <View className="flex-row justify-between">
                  <CText
                    className="font-regular leading-5"
                    style={{ color: colors.textMuted }}>
                    Done
                  </CText>
                  <CText className="font-medium leading-5">
                    456
                  </CText>
                </View>

              </View>
            </View>
          </View>
        </View>

        {/* MODULE HEADER */}
        <View
          className="mt-2 flex-row items-center justify-between"
        >
          <CText
            className="font-medium text-lg"
          >
            Menus
          </CText>

          <TouchableOpacity>
            <CText
              className="underline text-lg font-regular"
            >
              See all
            </CText>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 mt-2">
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
            />
          ))}
        </View>
      </View>

      <View className="px-4">
        <CText
          className="mt-2 font-medium text-lg"
        >
          Recently Viewed
        </CText>
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
              <Accounts data={x} activeUser={authData?.Username ?? ""} />
            </TouchableOpacity>
          ))
        }

        <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className='mb-10' />
      </AppBottomSheet>
    </ScreenWrapper>
  );
};

type ModuleButtonProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  badgeVal?: string;
  onPress?: () => void;
};
function ModuleButton({ iconName, title, badgeVal, onPress }: ModuleButtonProps) {
  const { colors } = useTheme();

  return <TouchableOpacity
    onPress={onPress}
    className="h-24 px-4 w-[31.5%] mb-[3%] border rounded-xl items-center justify-center"
    style={{
      borderColor: colors.border + "44",
      backgroundColor: colors.bg + "77"
    }}
  >
    {
      badgeVal !== undefined && <View
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
      >
        <CText
          className="font-medium text-sm"
          style={{ color: '#ffffff' }}
        >
          {badgeVal}
        </CText>
      </View>
    }

    <Ionicons
      name={iconName}
      size={30}
      color={colors.primary}
    />

    <CText
      className="text-base mt-0.5 font-regular text-center"
    >
      {title}
    </CText>
  </TouchableOpacity>;
};

function Accounts({ data, activeUser }: { data: UserAuthData, activeUser: string }) {
  return <View className="flex-row items-center rounded-xl bg-gray-300/20 border border-gray-400/15 p-3 mb-4">
    <View className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center mr-3">
      <CText className="text-lg font-semibold" style={{ color: "#fff" }}>JD</CText>
    </View>

    <View className="flex-1">
      <CText className="font-medium text-lg">{data.Fullname}</CText>
      <CText className="opacity-60">{data.Email ? data.Email.trim() !== "" ? data.Email : "Email not registered" : "Email not registered"}</CText>
    </View>

    <Ionicons name={activeUser == data.Username ? "checkmark-circle" : "ellipse-outline"} size={24} color={activeUser == data.Username ? "#3b82f6" : "#9CA3AF"} />
  </View>
}