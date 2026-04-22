import ScreenWrapper from "@/components/screen-wrapper";
import { CText } from "@/components/text";
import useTheme, { ColorScheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from "@/components/button";
import { clearRecentItems, getRecentItems, RecentItem } from "@/hooks/recently-halper";
import { useStatisticStore } from "@/hooks/statistic-zustand";
import { useAuthStore, useConfirmStore, useLoadingStore } from "@/hooks/zustand";
import { ResponsiveScale, SistemOrg, sistemOrgList, UserAuthData } from "@/lib/model-type";
import { useResposiveScale } from "@/lib/resposive";
import { formatDate, showToast } from "@/lib/utils";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Index() {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { authData, accounts, activeOrg, switchAccount } = useAuthStore();
  const { colors } = useTheme();
  const { showConfirm } = useConfirmStore();
  const router = useRouter();
  const { dataStPr, dataStPo, fetchStatistic } = useStatisticStore();
  const loadingPage = useLoadingStore.getState();

  const [activeTabSwitch, setActiveTabSwitch] = useState<SistemOrg | null>(activeOrg);
  const acoPajm = useMemo(() => accounts.filter(x => x.Org === "PAJM"), [accounts]);
  const acoLcs = useMemo(() => accounts.filter(x => x.Org === "LCS"), [accounts]);

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const fatchDatas = async (bp_id = authData?.BpUserId ?? 0) => {
    loadingPage.show();
    try {
      await fetchStatistic(bp_id);
    }
    catch (error: any) {
      showToast({
        type: "error",
        title: "Request Failed",
        message: error.message
      });
    }
    loadingPage.hide();
  };

  useEffect(() => {
    if (authData != null) fatchDatas(authData?.BpUserId ?? 0);
  }, [authData]);

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const loadRecentView = async () => {
    const data = await getRecentItems();
    setRecentItems(data);
  };
  useFocusEffect(
    useCallback(() => {
      loadRecentView();
    }, [])
  );

  return (
    <>
      <ScreenWrapper
        refreshControlAction={async () => {
          await fetchStatistic(authData?.BpUserId ?? 0);
          await loadRecentView();
        }}
      >
        <View style={{ paddingTop: rpm(16), paddingHorizontal: rpm(12) }}>
          {/* HEADER */}
          <View className="flex-row items-center justify-between">

            {/* Profile Section */}
            <TouchableOpacity onPress={() => {
              setActiveTabSwitch(activeOrg);
              bottomSheetRef.current?.open();
            }}>
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
              onPress={async () => {
                // ClearAllStorage();
                // CheckAllStorage();
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
                <Text className="font-semibold text-red-500">{activeOrg}</Text> Warehouse
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
                      {dataStPr?.TotalData ?? 0}
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
                      {dataStPr?.OnProgress ?? 0}
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
                      {dataStPr?.Finish ?? 0}
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
                      {dataStPo?.TotalData ?? 0}
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
                      {dataStPo?.TotalData ?? 0}
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
                      {dataStPo?.TotalData ?? 0}
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
            {
              [
                {
                  iconName: "document-text-outline",
                  title: "Purchase Request",
                  badgeVal: dataStPr?.Waiting ? (dataStPr?.Waiting > 0 ? dataStPr?.Waiting : undefined) : undefined,
                  onPress: () => router.push("/pages/purchase_request")
                },
                {
                  iconName: "cart-outline",
                  title: "Purchase Order",
                  badgeVal: dataStPo?.Waiting ? (dataStPo?.Waiting > 0 ? dataStPo?.Waiting : undefined) : undefined,
                  onPress: () => router.push("/pages/purchase_order")
                },
                {
                  iconName: "cube-outline",
                  title: "Delivery Notes",
                },
              ].map((item, index) => (
                <ModuleButton
                  key={index}
                  iconName={item.iconName}
                  title={item.title}
                  badgeVal={item.badgeVal}
                  onPress={item.onPress}

                  scales={scales}
                />
              ))
            }
          </View>
        </View>

        <View style={{ paddingHorizontal: rpm(14) }}>
          <View
            className="flex-row items-center justify-between"
            style={{
              marginVertical: rpm(6),
            }}
          >
            <CText className="font-medium" style={{ fontSize: rf(13) }}>
              Recently Viewed
            </CText>

            <TouchableOpacity
              onPress={async () => {
                const confirmed = await showConfirm({
                  title: "Confirm Clear!",
                  message: "Are you sure want to clear you recently viewed?",
                  confirmText: "Yes, Clear",
                  cancelText: "Cancel",
                  icon: 'trash-outline'
                });
                if (!confirmed) return;

                setRecentItems([]);
                clearRecentItems();
              }}
            >
              <CText
                className="underline font-regular"
                style={{ fontSize: rf(13) }}
              >
                Clear all
              </CText>
            </TouchableOpacity>
          </View>

          {
            recentItems.length > 0 ? recentItems.map((x, i) => (
              <TouchableOpacity
                key={i}
                className="shadow-md"
                style={{
                  padding: rpm(8),
                  borderRadius: rpm(10),
                  backgroundColor: colors.surface,
                  marginBottom: rpm(10)
                }}
                onPress={() => {
                  router.push({
                    pathname: x.module_url as any,
                    params: {
                      id: x.id.toString(),
                      doc_num: x.doc_num,
                    }
                  });
                }}
              >
                <View className="flex-row justify-between items-center" style={{ marginBottom: rpm(4) }}>
                  <CText className="font-semibold" style={{ fontSize: rf(13) }}>
                    {i + 1}. {x.doc_num}
                  </CText>

                  <View className="flex-row items-center">
                    <CText style={{ fontSize: rf(13), marginEnd: rpm(2) }} className="leading-none">
                      Source: {x.source}
                    </CText>

                    <Ionicons
                      name={x.source === 'PR' ? "document-text-outline" : "cart-outline"}
                      size={rf(17)}
                      color={x.source === 'PR' ? colors.success : colors.warning}
                    />
                  </View>
                </View>

                <CText className="font-regular" style={{ fontSize: rf(13), marginBottom: rpm(3) }}>
                  Req By: {x.name}
                </CText>

                {
                  x.date !== null ? <CText style={{ color: colors.textMuted, fontSize: rf(12) }}>
                    Submit At: {formatDate(x.date, 'medium', 'short')}
                  </CText> : <CText style={{ color: colors.danger, fontSize: rf(12) }}>NOT SUBMITTED YET</CText>
                }
              </TouchableOpacity>
            )) : <View className="items-center justify-center shadow-md"
              style={{
                paddingHorizontal: rpm(8),
                paddingVertical: rpm(20),
                borderRadius: rpm(10),
                backgroundColor: colors.surface
              }}
            >
              <Ionicons name="folder-open-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(10) }} />

              <CText className="font-semibold text-center" style={{ fontSize: rf(13) }}>
                You haven't any history yet.
              </CText>

              <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(13) }}>
                Start explore and they will appear here.
              </CText>
            </View>
          }
        </View>
      </ScreenWrapper>

      <AppBottomSheet title="Switch Account" ref={bottomSheetRef} snapPoints={["30%", "40%"]} enableGesture={true}>
        <View style={{ paddingBottom: rpm(12), paddingTop: rpm(4) }}>
          <CText className="text-center" style={{ paddingBottom: rpm(6), color: colors.textMuted }}>Choose Organization</CText>

          <View className="flex-row items-center border border-gray-300"
            style={{
              borderRadius: rpm(10)
            }}
          >
            {sistemOrgList.map((tab) => {
              const isActive = activeTabSwitch === tab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTabSwitch(tab as any)}
                  className="flex-1 items-center"
                  style={{
                    paddingVertical: rpm(10)
                  }}
                >
                  <CText className="font-semibold leading-none" style={{ color: isActive ? colors.primary : colors.textMuted, fontSize: rf(13) }}>
                    PT. {tab}
                  </CText>

                  {isActive && (
                    <View className="rounded-full"
                      style={{
                        width: rpm(20),
                        height: rpm(3),
                        backgroundColor: colors.primary,
                        marginTop: rpm(5)
                      }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <CText className="text-center" style={{ paddingBottom: rpm(6), color: colors.textMuted }}>Registered Accounts</CText>
        {
          activeTabSwitch === "PAJM" ? (
            acoPajm.length > 0 ? acoPajm.map((x, i) => (
              <TouchableOpacity
                key={i}
                onPress={async () => {
                  if (x.Username == authData?.Username && x.Org === authData?.Org) return;

                  const confirmed = await showConfirm({
                    title: "Confirm Switch!",
                    message: "Are you sure you want to switch account? This action will delete recently viewed data!",
                    confirmText: "Yes, Switch",
                    cancelText: "Cancel",
                    icon: 'swap-horizontal-outline'
                  });

                  if (!confirmed) return;
                  setRecentItems([]);
                  clearRecentItems();

                  loadingPage.show();
                  await switchAccount(x.Username, x.Org);
                  await fetchStatistic(x?.BpUserId ?? 0);
                  bottomSheetRef.current?.close();
                  loadingPage.hide();
                }}
              >
                <Accounts data={x} activeUser={authData ?? undefined} scales={scales} />
              </TouchableOpacity>
            )) : EmptyAccount(scales, colors)
          ) : (
            acoLcs.length > 0 ? acoLcs.map((x, i) => (
              <TouchableOpacity
                key={i}
                onPress={async () => {
                  if (x.Username == authData?.Username && x.Org === authData?.Org) return;

                  const confirmed = await showConfirm({
                    title: "Confirm Switch!",
                    message: "Are you sure you want to switch account? This action will delete recently viewed data!",
                    confirmText: "Yes, Switch",
                    cancelText: "Cancel",
                    icon: 'swap-horizontal-outline'
                  });

                  if (!confirmed) return;
                  setRecentItems([]);
                  clearRecentItems();

                  loadingPage.show();
                  await switchAccount(x.Username, x.Org);
                  await fetchStatistic(x?.BpUserId ?? 0);
                  bottomSheetRef.current?.close();
                  loadingPage.hide();
                }}
              >
                <Accounts data={x} activeUser={authData ?? undefined} scales={scales} />
              </TouchableOpacity>
            )) : EmptyAccount(scales, colors)
          )
        }

        <CText className="text-center" style={{ paddingBottom: rpm(6), color: colors.textMuted }}>Or</CText>
        <Button
          onPress={() => router.push({
            pathname: "/pages/new_account",
            params: {
              org: activeTabSwitch
            }
          })}
          title='Add Account' prefixIcon="add" className="w-full" style={{ marginBottom: rpm(10) }}
        />
      </AppBottomSheet>
    </>
  );
};

type ModuleButtonProps = {
  iconName: string;
  title: string;
  scales: ResponsiveScale;
  badgeVal?: number;
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
          width: rw(15),
          height: rh(15)
        }}
      >
        <CText
          className="font-medium leading-none"
          style={{ color: '#ffffff', fontSize: rf(11) }}
        >
          {badgeVal}
        </CText>
      </View>
    }

    <Ionicons
      name={iconName as React.ComponentProps<typeof Ionicons>["name"]}
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

export function Accounts({ data, activeUser, scales }: { data: UserAuthData, activeUser?: UserAuthData, scales: ResponsiveScale; }) {
  const { rw, rh, rpm, rf } = scales;
  const isSelected = (activeUser && activeUser.Username == data.Username && activeUser.Org == data.Org)

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
      <Ionicons name="person-outline" size={rf(15)} color={"#fff"} />
    </View>

    <View className="flex-1">
      <CText className="font-medium" style={{ fontSize: rf(13) }}>{data.Fullname}</CText>
      <CText className="opacity-60" style={{ fontSize: rf(12) }}>{data.Email ? (data.Email.trim() !== "" ? data.Email : "Email not registered") : "Email not registered"}</CText>
    </View>

    <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={rf(21)} color={isSelected ? "#3b82f6" : "#9CA3AF"} />
  </View>
};

export function EmptyAccount(scales: ResponsiveScale, colors: ColorScheme): import("react").ReactNode {
  const { rw, rh, rpm, rf } = scales;

  return <View className="items-center justify-center bg-gray-300/20 border border-gray-400/15"
    style={{
      borderRadius: rpm(10),
      paddingVertical: rpm(12),
      marginBottom: rpm(14)
    }}
  >
    <Ionicons name="person-circle-outline" size={rf(38)} color="#9CA3AF" style={{ marginBottom: rpm(4) }} />

    <CText className="font-semibold text-center" style={{ fontSize: rf(13) }}>
      No Account Yet!
    </CText>

    <CText className="font-regular text-center" style={{ color: colors.textMuted, fontSize: rf(13) }}>
      Theres no accounts registered on this organization.
    </CText>
  </View>;
};