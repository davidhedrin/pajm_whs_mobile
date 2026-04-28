import AppBottomSheet, { BottomSheetRef } from '@/components/bottom-sheet';
import Button from '@/components/button';
import CopywriteFooter from '@/components/c-footer';
import ScreenWrapper from '@/components/screen-wrapper';
import { CText } from '@/components/text';
import { clearRecentItems } from '@/hooks/recently-halper';
import { useStatisticStore } from '@/hooks/statistic-zustand';
import useTheme, { ColorScheme } from '@/hooks/use-theme';
import { useAuthStore, useConfirmStore, useLoadingStore } from '@/hooks/zustand';
import { ResponsiveScale, SistemOrg, UserAuthData } from '@/lib/model-type';
import { useResposiveScale } from '@/lib/resposive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Switch, TouchableOpacity, View } from 'react-native';
import { Accounts, EmptyAccount } from '.';

const SettingScreen = () => {
  const { rw, rh, rpm, rf } = useResposiveScale();
  const scales = useResposiveScale();
  const { authData, accounts, activeOrg, allOrgs, switchAccount } = useAuthStore();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const { showConfirm } = useConfirmStore();
  const router = useRouter();
  const loadingPage = useLoadingStore.getState();
  const { fetchStatistic } = useStatisticStore();
  const logout = useAuthStore((s) => s.logout);

  const [activeTabOrg, setActiveTabOrg] = useState<SistemOrg | null>(activeOrg);
  const [accountsToShow, setAccountsToShow] = useState<UserAuthData[]>(accounts.filter(x => x.Org === activeOrg?.key));
  const handleChangeOrg = (org: SistemOrg | null) => {
    const filterAccount = accounts.filter(x => x.Org === org?.key);
    setAccountsToShow(filterAccount);
    setActiveTabOrg(org);
  };

  const bottomSheetRef = useRef<BottomSheetRef>(null);

  const confirmLogout = async (isLogout: boolean = false) => {
    const confirmed = await showConfirm({
      title: `Confirm ${isLogout ? "Logout" : "Remove"}!`,
      message: isLogout ? "Are you sure you want to remove all account to log out from app?" : "Are you sure you want to log out of your account?",
      confirmText: isLogout ? "Yes, Logout" : "Yes, Remove",
      cancelText: "Cancel",
      icon: isLogout ? 'log-out-outline' : 'refresh-outline'
    });

    if (confirmed) {
      if (isLogout === true) { await logout(); }
      else { await logout(authData ?? undefined); }

      await clearRecentItems();
    }
  };

  return (
    <>
      <ScreenWrapper>
        <View className="rounded-bl-full"
          style={{
            paddingTop: rpm(24),
            paddingHorizontal: rpm(18),
            backgroundColor: colors.primary
          }}
        >
          <View className="flex-row items-start">
            <Ionicons name='settings-outline' size={rf(27)} style={{ color: "#fff" }} />
            <CText className='font-medium leading-tight'
              style={{
                color: "#fff",
                fontSize: rpm(28),
                marginLeft: rpm(6),
                marginBottom: rpm(25),
              }}
            >Settings</CText>
          </View>

          {/* PROFILE HEADER */}
          <View className="flex-row items-center" style={{ marginBottom: rpm(18) }}>
            <View
              className="bg-slate-700 rounded-full items-center justify-center"
              style={{
                padding: rpm(14),
                marginRight: rpm(14)
              }}
            >
              <Ionicons name="person" size={rf(30)} color="white" />
            </View>

            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <CText className="font-semibold" style={{ color: "#fff", fontSize: rf(17) }}>
                  {authData?.Fullname ?? "Guest"}
                </CText>

                <View className="bg-blue-100 rounded-full" style={{ paddingHorizontal: rpm(7), paddingTop: rpm(2) }}>
                  <CText className="font-medium" style={{ color: "#2563eb", fontSize: rf(13) }}>
                    {authData?.Role ?? "Guest"}
                  </CText>
                </View>
              </View>

              <CText style={{ color: "#fff", fontSize: rf(14) }}>
                {authData?.Email ? (authData.Email.trim() !== "" ? authData.Email : "Email not registered") : "Email not registered"}
              </CText>

              <CText style={{ color: "#fff", fontSize: rf(13) }}>
                Org. {activeOrg ? activeOrg.name : "-"}
              </CText>
            </View>
          </View>
        </View>

        <View style={{ paddingTop: rpm(20), paddingHorizontal: rpm(12) }}>
          {/* CONTENT */}
          <View>
            {/* ACCOUNT BUTTONS */}
            <View className="flex-row justify-between" style={{ marginBottom: rpm(24), paddingHorizontal: rpm(6) }}>
              <Button title='Switch Account' prefixIcon='swap-horizontal-outline'
                className="flex-1 bg-transparent border border-gray-500"
                style={{
                  borderRadius: 9999,
                  paddingTop: rpm(10),
                  paddingBottom: rpm(10),
                  marginEnd: rpm(10)
                }}
                titleColor={colors.text}
                onPress={() => {
                  setActiveTabOrg(activeOrg);
                  bottomSheetRef.current?.open();
                }}
              />
              <Button onPress={() => router.push("/pages/new_account")} title='Add Account' prefixIcon="add" className="flex-1 bg-blue-500"
                style={{
                  borderRadius: 9999,
                  paddingTop: rpm(10),
                  paddingBottom: rpm(10),
                }} />
            </View>

            {/* MENU ITEMS */}
            <View
              style={{
                borderRadius: rpm(14),
                paddingHorizontal: rpm(13),
                paddingVertical: rpm(5),
                backgroundColor: colors.surface
              }}
            >
              {/* Profile */}
              <ItemMenu
                onPressItem={() => { }}
                icon='person-outline'
                colors={colors}
                title='Profile'
                desc='Manage your personal information'
                scales={scales}
                isBordered={true}
              />

              {/* Dark Mode */}
              <View className="flex-row items-center border-b border-gray-200"
                style={{
                  paddingVertical: rpm(10)
                }}
              >
                <Ionicons name="moon-outline" size={rf(18)} color={colors.text} />
                <View className='flex-1 ml-4'
                  style={{
                    marginLeft: rpm(13)
                  }}
                >
                  <CText className="font-medium" style={{ fontSize: rf(13) }}>
                    Dark Mode
                  </CText>
                  <CText style={{ fontSize: rf(12) }}>
                    Switch between light and dark theme
                  </CText>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => {
                    toggleDarkMode(val);
                  }}
                />
              </View>

              {/* Logout */}
              <ItemMenu
                onPressItem={() => confirmLogout()}
                icon='refresh-outline'
                colors={colors}
                title='Remove Account'
                desc='Sign out your account and switch to nearest'
                scales={scales}
                isBordered={true}
              />

              {/* Logout All Account */}
              <ItemMenu
                onPressItem={() => confirmLogout(true)}
                icon='log-out-outline'
                colors={colors}
                title='Logout All Account'
                desc='Sign out from all account registred'
                scales={scales}
              />
            </View>
          </View>

          {/* FOOTER VERSION */}
          <CopywriteFooter />
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
            {
              allOrgs.map((tab, i) => {
                const isActive = activeTabOrg?.key === tab.key;

                return (
                  <Pressable
                    key={i}
                    onPress={() => handleChangeOrg(tab)}
                    className="flex-1 items-center"
                    style={{
                      paddingVertical: rpm(10)
                    }}
                  >
                    <CText className="font-semibold leading-none" style={{ color: isActive ? colors.primary : colors.textMuted, fontSize: rf(13) }}>
                      PT. {tab.key}
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
              })
            }
          </View>
        </View>

        <CText className="text-center" style={{ paddingBottom: rpm(6), color: colors.textMuted }}>Registered Accounts</CText>
        {
          accountsToShow.length > 0 ? accountsToShow.map((x, i) => (
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
                loadingPage.show();
                await clearRecentItems();

                await switchAccount(x);
                await fetchStatistic(x?.BpUserId ?? 0);
                bottomSheetRef.current?.close();
                loadingPage.hide();
              }}
            >
              <Accounts data={x} activeUser={authData ?? undefined} scales={scales} />
            </TouchableOpacity>
          )) : EmptyAccount(scales, colors)
        }

        <CText className="text-center" style={{ paddingBottom: rpm(6), color: colors.textMuted }}>Or</CText>
        <Button
          onPress={() => router.push({
            pathname: "/pages/new_account",
            params: {
              org: activeTabOrg?.key
            }
          })}
          title='Add Account' prefixIcon="add" className="w-full" style={{ marginBottom: rpm(30) }}
        />
      </AppBottomSheet>
    </>
  )
}

export default SettingScreen

type ItemMenuProps = {
  title: string;
  desc: string;
  colors: ColorScheme;
  onPressItem?: () => void;
  scales: ResponsiveScale;
  icon?: keyof typeof Ionicons.glyphMap;
  isBordered?: boolean
};

export function ItemMenu({ title, desc, onPressItem, colors, scales, icon, isBordered = false }: ItemMenuProps) {
  const { rpm, rf } = scales;

  return <View className={`${isBordered ? "border-b border-gray-200" : ""}`}>
    <TouchableOpacity onPress={onPressItem} className='flex-row items-center'
      style={{
        paddingVertical: rpm(10)
      }}
    >
      {icon && <Ionicons name={icon} size={rf(19)} color={colors.text}
        style={{
          marginRight: rpm(13)
        }}
      />}
      <View className='flex-1'>
        <CText className="font-medium" style={{ fontSize: rf(13) }}>
          {title}
        </CText>
        <CText style={{ fontSize: rf(12) }}>
          {desc}
        </CText>
      </View>
      <Ionicons name="chevron-forward" size={rf(18)} color={colors.textMuted} />
    </TouchableOpacity>
  </View>;
}
